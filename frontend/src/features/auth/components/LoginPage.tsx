import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/shared/api/errors';
import { useLogin } from '../api/hooks';
import { CredentialsForm } from './CredentialsForm';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();

  return (
    <main className="mx-auto mt-16 w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-semibold">Log in</h1>
      <CredentialsForm
        submitLabel="Log in"
        minPasswordLength={1}
        pending={login.isPending}
        errorMessage={login.isError ? getErrorMessage(login.error, 'Login failed') : undefined}
        onSubmit={(creds) =>
          login.mutate(creds, { onSuccess: () => navigate('/', { replace: true }) })
        }
      />
      <p className="mt-4 text-sm text-gray-600">
        No account?{' '}
        <Link className="text-blue-600 underline" to="/register">
          Register
        </Link>
      </p>
    </main>
  );
}
