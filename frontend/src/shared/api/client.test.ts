import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/app/store/authStore';
import { BASE, server, testUser } from '@/test/server';
import { api, refreshSession } from './client';

afterEach(() => {
  useAuthStore.getState().clear();
});

describe('api client interceptors', () => {
  it('attaches the Bearer access token to requests', async () => {
    useAuthStore.getState().setAuth('tok-123', testUser);
    server.use(
      http.get(`${BASE}/todos`, ({ request }) =>
        HttpResponse.json({ auth: request.headers.get('authorization') }),
      ),
    );
    const { data } = await api.get<{ auth: string }>('/todos');
    expect(data.auth).toBe('Bearer tok-123');
  });

  it('on 401 performs a silent refresh and retries the original request', async () => {
    let todoCalls = 0;
    server.use(
      http.post(`${BASE}/auth/refresh`, () =>
        HttpResponse.json({ user: testUser, accessToken: 'refreshed-token' }),
      ),
      http.get(`${BASE}/todos`, () => {
        todoCalls += 1;
        if (todoCalls === 1) {
          return HttpResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        }
        return HttpResponse.json({ ok: true });
      }),
    );

    const { data } = await api.get<{ ok: boolean }>('/todos');
    expect(data.ok).toBe(true);
    expect(todoCalls).toBe(2);
    expect(useAuthStore.getState().accessToken).toBe('refreshed-token');
  });

  it('clears auth when refresh fails', async () => {
    useAuthStore.getState().setAuth('stale', testUser);
    server.use(
      http.post(`${BASE}/auth/refresh`, () =>
        HttpResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }),
      ),
    );
    const token = await refreshSession();
    expect(token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
