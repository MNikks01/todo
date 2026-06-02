import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from './helpers.js';

let app: Express;
beforeAll(() => {
  app = buildApp();
});

describe('Health endpoints', () => {
  it('GET /health returns 200 (liveness)', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /ready returns 200 with DB connected (readiness)', async () => {
    const res = await request(app).get('/ready').expect(200);
    expect(res.body.db).toBe(true);
  });

  it('echoes a correlation id header', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.headers['x-correlation-id']).toBeTruthy();
  });

  it('unknown route returns 404 Problem envelope', async () => {
    const res = await request(app).get('/api/v1/does-not-exist').expect(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });
});
