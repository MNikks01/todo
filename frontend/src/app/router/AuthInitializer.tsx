/**
 * Restores the session on app load via a silent refresh (the HttpOnly refresh
 * cookie survives reloads; the in-memory access token does not). Blocks render
 * with a spinner until the attempt settles.
 */
import { type ReactNode, useEffect, useState } from 'react';
import { refreshSession } from '@/shared/api/client';
import { useAuthStore } from '@/app/store/authStore';
import { Spinner } from '@/shared/components/Spinner';

export function AuthInitializer({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      setReady(true);
      return;
    }
    void refreshSession().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <Spinner label="Starting" />;
  }
  return <>{children}</>;
}
