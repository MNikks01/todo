import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/app/components/AppLayout';
import { AuthInitializer } from '@/app/router/AuthInitializer';
import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { RegisterPage } from '@/features/auth/components/RegisterPage';
import { TodosPage } from '@/features/todos/components/TodosPage';

export function App() {
  return (
    <AuthInitializer>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TodosPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthInitializer>
  );
}
