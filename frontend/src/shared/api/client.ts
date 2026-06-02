/**
 * Axios client + interceptors (frontend/CLAUDE.md, docs/security.md §8).
 * - Request: attach Bearer access token; add X-CSRF-Token for cookie endpoints.
 * - Response: on 401, attempt a single-flight silent refresh and retry once;
 *   on failure, clear auth (→ redirect to login via ProtectedRoute).
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config/env';
import { useAuthStore } from '@/app/store/authStore';
import type { SessionResponse } from '@/shared/types/auth';

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function isAuthCookieEndpoint(url: string | undefined): boolean {
  return Boolean(url && (url.includes('/auth/refresh') || url.includes('/auth/logout')));
}

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((cfg) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    cfg.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (isAuthCookieEndpoint(cfg.url)) {
    const csrf = readCookie('csrfToken');
    if (csrf) {
      cfg.headers.set('X-CSRF-Token', csrf);
    }
  }
  return cfg;
});

let refreshInFlight: Promise<string | null> | null = null;

/** Single-flight refresh: concurrent 401s share one refresh request. */
export async function refreshSession(): Promise<string | null> {
  refreshInFlight ??= api
    .post<SessionResponse>('/auth/refresh')
    .then((res) => {
      useAuthStore.getState().setAuth(res.data.accessToken, res.data.user);
      return res.data.accessToken;
    })
    .catch(() => {
      useAuthStore.getState().clear();
      return null;
    })
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    // Don't try to refresh auth endpoints themselves, or already-retried calls.
    if (status === 401 && original && !original._retry && !isAuthCookieEndpoint(original.url)) {
      original._retry = true;
      const newToken = await refreshSession();
      if (newToken) {
        original.headers.set('Authorization', `Bearer ${newToken}`);
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);
