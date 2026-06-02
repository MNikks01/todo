import { useAuthStore } from '@/app/store/authStore';

/** Convenience accessor for auth state (frontend/features/auth/CLAUDE.md). */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return { user, isAuthenticated };
}
