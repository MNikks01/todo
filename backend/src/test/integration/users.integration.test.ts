import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { UserModel } from '../../modules/users/infrastructure/userModel.js';
import { buildApp } from './helpers.js';

let app: Express;
beforeAll(() => {
  app = buildApp();
});

async function createAndLogin(
  email: string,
  role: 'user' | 'admin',
): Promise<{ accessToken: string; id: string }> {
  const password = 'password123';
  await request(app).post('/api/v1/auth/register').send({ email, password }).expect(201);
  if (role === 'admin') {
    await UserModel.updateOne({ email }, { role: 'admin' });
  }
  const res = await request(app).post('/api/v1/auth/login').send({ email, password }).expect(200);
  return { accessToken: res.body.accessToken as string, id: res.body.user.id as string };
}

describe('Admin /users routes (RBAC)', () => {
  it('rejects unauthenticated access with 401', async () => {
    await request(app).get('/api/v1/users').expect(401);
  });

  it('forbids a non-admin user with 403', async () => {
    const user = await createAndLogin('user@example.com', 'user');
    await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);
  });

  it('allows an admin to list users', async () => {
    const admin = await createAndLogin('admin@example.com', 'admin');
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThanOrEqual(1);
    expect(res.body.users[0]).not.toHaveProperty('passwordHash');
  });

  it('allows an admin to change a user role and disable an account', async () => {
    const admin = await createAndLogin('admin2@example.com', 'admin');
    const target = await createAndLogin('target@example.com', 'user');

    const roleRes = await request(app)
      .patch(`/api/v1/users/${target.id}/role`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ role: 'admin' })
      .expect(200);
    expect(roleRes.body.user.role).toBe('admin');

    const statusRes = await request(app)
      .patch(`/api/v1/users/${target.id}/status`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ status: 'disabled' })
      .expect(200);
    expect(statusRes.body.user.status).toBe('disabled');
  });

  it('validates the id param (400 on malformed id)', async () => {
    const admin = await createAndLogin('admin3@example.com', 'admin');
    await request(app)
      .patch('/api/v1/users/not-an-objectid/role')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ role: 'admin' })
      .expect(400);
  });

  it('rejects an invalid role value with 400', async () => {
    const admin = await createAndLogin('admin4@example.com', 'admin');
    const target = await createAndLogin('target2@example.com', 'user');
    await request(app)
      .patch(`/api/v1/users/${target.id}/role`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ role: 'superuser' })
      .expect(400);
  });
});
