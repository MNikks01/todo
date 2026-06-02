import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAuthStore } from '@/app/store/authStore';
import { testUser } from '@/test/server';
import { renderWithProviders } from '@/test/utils';
import { ProtectedRoute } from './ProtectedRoute';

function renderRoutes() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<div>Login screen</div>} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div>Secret content</div>
          </ProtectedRoute>
        }
      />
    </Routes>,
    { route: '/' },
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when unauthenticated', () => {
    renderRoutes();
    expect(screen.getByText('Login screen')).toBeInTheDocument();
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useAuthStore.getState().setAuth('tok', testUser);
    renderRoutes();
    expect(screen.getByText('Secret content')).toBeInTheDocument();
  });
});
