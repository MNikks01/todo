/**
 * App shell (composition layer). Cross-cutting concerns — brand, current user,
 * logout — live here, NOT inside a feature, so features stay isolated
 * (rules/architecture.md). `app/` may depend on features; features may not
 * depend on each other.
 */
import type { ReactNode } from 'react';
import { Button } from '@/shared/components/Button';
import { useLogout } from '@/features/auth/api/hooks';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <div className="mx-auto mt-10 w-full max-w-2xl px-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Todo</h1>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{user?.email}</span>
          <Button variant="secondary" onClick={() => logout.mutate()} disabled={logout.isPending}>
            Log out
          </Button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
