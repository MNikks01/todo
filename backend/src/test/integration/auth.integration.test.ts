import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildApp, parseCookies } from './helpers.js';

let app: Express;
beforeAll(() => {
  app = buildApp();
});

const creds = { email: 'alice@example.com', password: 'password123' };

async function registerAndLogin(credentials = creds) {
  await request(app).post('/api/v1/auth/register').send(credentials).expect(201);
  const res = await request(app).post('/api/v1/auth/login').send(credentials).expect(200);
  const cookies = parseCookies(res.headers['set-cookie'] as unknown as string[]);
  return { accessToken: res.body.user ? res.body.accessToken : undefined, cookies, body: res.body };
}

describe('POST /auth/register', () => {
  it('creates a user and returns a safe DTO (no passwordHash)', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(creds).expect(201);
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/v1/auth/register').send(creds).expect(201);
    await request(app).post('/api/v1/auth/register').send(creds).expect(409);
  });

  it('rejects invalid input with 400 and a Problem envelope', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
    expect(res.body.correlationId).toBeTruthy();
  });
});

describe('POST /auth/login', () => {
  it('sets HttpOnly refresh + readable csrf cookies and returns an access token', async () => {
    await request(app).post('/api/v1/auth/register').send(creds).expect(201);
    const res = await request(app).post('/api/v1/auth/login').send(creds).expect(200);

    const setCookie = res.headers['set-cookie'] as unknown as string[];
    expect(setCookie.some((c) => c.startsWith('refreshToken=') && /HttpOnly/i.test(c))).toBe(true);
    expect(setCookie.some((c) => c.startsWith('csrfToken=') && !/HttpOnly/i.test(c))).toBe(true);
    expect(res.body.accessToken).toBeTruthy();
  });

  it('rejects wrong credentials with a generic 401', async () => {
    await request(app).post('/api/v1/auth/register').send(creds).expect(201);
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ ...creds, password: 'wrong' })
      .expect(401);
    expect(res.body.message).toBe('Invalid email or password');
  });
});

describe('GET /auth/me', () => {
  it('returns the current user with a valid Bearer token', async () => {
    const { body } = await registerAndLogin();
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .expect(200);
    expect(res.body.user.email).toBe('alice@example.com');
  });

  it('rejects a missing token with 401', async () => {
    await request(app).get('/api/v1/auth/me').expect(401);
  });

  it('rejects a malformed token with 401', async () => {
    await request(app).get('/api/v1/auth/me').set('Authorization', 'Bearer nope').expect(401);
  });
});

describe('POST /auth/refresh (CSRF + rotation)', () => {
  it('rejects refresh without the CSRF header (double-submit)', async () => {
    const { cookies } = await registerAndLogin();
    await request(app).post('/api/v1/auth/refresh').set('Cookie', cookies.header).expect(403);
  });

  it('rotates the session with cookie + matching CSRF header', async () => {
    const { cookies } = await registerAndLogin();
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookies.header)
      .set('X-CSRF-Token', cookies.csrfToken ?? '')
      .expect(200);
    expect(res.body.accessToken).toBeTruthy();
    const rotated = parseCookies(res.headers['set-cookie'] as unknown as string[]);
    expect(rotated.refreshToken).toBeTruthy();
    expect(rotated.refreshToken).not.toBe(cookies.refreshToken);
  });

  it('detects refresh-token reuse and revokes the family (401 on replay)', async () => {
    const { cookies } = await registerAndLogin();
    // First rotation succeeds.
    const first = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookies.header)
      .set('X-CSRF-Token', cookies.csrfToken ?? '')
      .expect(200);
    const rotated = parseCookies(first.headers['set-cookie'] as unknown as string[]);

    // Replaying the ORIGINAL (now-used) refresh token → reuse detected.
    await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookies.header)
      .set('X-CSRF-Token', cookies.csrfToken ?? '')
      .expect(401);

    // The legitimately rotated token is now revoked too.
    await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refreshToken=${rotated.refreshToken}; csrfToken=${rotated.csrfToken}`)
      .set('X-CSRF-Token', rotated.csrfToken ?? '')
      .expect(401);
  });
});

describe('POST /auth/logout', () => {
  it('clears the session and invalidates the refresh token', async () => {
    const { cookies } = await registerAndLogin();
    await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', cookies.header)
      .set('X-CSRF-Token', cookies.csrfToken ?? '')
      .expect(204);

    // Refresh with the logged-out token now fails.
    await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookies.header)
      .set('X-CSRF-Token', cookies.csrfToken ?? '')
      .expect(401);
  });
});
