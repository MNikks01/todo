import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAuthStore } from '@/app/store/authStore';
import { BASE, server, testUser } from '@/test/server';
import { renderWithProviders } from '@/test/utils';
import { AuthInitializer } from './AuthInitializer';

describe('AuthInitializer', () => {
  it('renders children after the silent refresh settles (no session)', async () => {
    renderWithProviders(
      <AuthInitializer>
        <div>App ready</div>
      </AuthInitializer>,
    );
    expect(await screen.findByText('App ready')).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('restores the session when refresh succeeds', async () => {
    server.use(
      http.post(`${BASE}/auth/refresh`, () =>
        HttpResponse.json({ user: testUser, accessToken: 'restored' }),
      ),
    );
    renderWithProviders(
      <AuthInitializer>
        <div>App ready</div>
      </AuthInitializer>,
    );
    await screen.findByText('App ready');
    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true));
    expect(useAuthStore.getState().accessToken).toBe('restored');
  });
});
