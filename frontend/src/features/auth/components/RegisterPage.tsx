import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/shared/api/errors';
import { useRegister } from '../api/hooks';
import { CredentialsForm } from './CredentialsForm';

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();

  return (
    <main className="mx-auto mt-16 w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-semibold">Create account</h1>
      <CredentialsForm
        submitLabel="Register"
        minPasswordLength={8}
        pending={register.isPending}
        errorMessage={
          register.isError ? getErrorMessage(register.error, 'Registration failed') : undefined
        }
        onSubmit={(creds) =>
          register.mutate(creds, { onSuccess: () => navigate('/', { replace: true }) })
        }
      />
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{' '}
        <Link className="text-blue-600 underline" to="/login">
          Log in
        </Link>
      </p>
    </main>
  );
}
