import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store/authStore';
import { type Credentials, login, logout, register } from './authApi';

/** Logs in and stores the session (access token in memory + user). */
export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (creds: Credentials) => login(creds),
    onSuccess: (session) => setAuth(session.accessToken, session.user),
  });
}

/** Registers then immediately logs in for a smooth first-run experience. */
export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (creds: Credentials) => {
      await register(creds);
      return login(creds);
    },
    onSuccess: (session) => setAuth(session.accessToken, session.user),
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      clear();
      queryClient.clear();
    },
  });
}
