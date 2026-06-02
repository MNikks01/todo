import { api } from '@/shared/api/client';
import type { AuthUser, SessionResponse } from '@/shared/types/auth';

export interface Credentials {
  email: string;
  password: string;
}

export async function login(creds: Credentials): Promise<SessionResponse> {
  const { data } = await api.post<SessionResponse>('/auth/login', creds);
  return data;
}

export async function register(creds: Credentials): Promise<AuthUser> {
  const { data } = await api.post<{ user: AuthUser }>('/auth/register', creds);
  return data.user;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}
