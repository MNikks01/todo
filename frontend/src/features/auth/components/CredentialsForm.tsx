import { type FormEvent, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import type { Credentials } from '../api/authApi';

interface CredentialsFormProps {
  submitLabel: string;
  minPasswordLength: number;
  pending: boolean;
  errorMessage?: string | undefined;
  onSubmit: (creds: Credentials) => void;
}

export function CredentialsForm({
  submitLabel,
  minPasswordLength,
  pending,
  errorMessage,
  onSubmit,
}: CredentialsFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  // Validity is independent of `touched`; `touched` only controls when to SHOW
  // errors. (Deriving the guard from touched-gated errors caused a stale-closure
  // bug where the first click could submit invalid input.)
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const passwordValid = password.length >= minPasswordLength;
  const emailError = touched && !emailValid ? 'Enter a valid email' : undefined;
  const passwordError =
    touched && !passwordValid
      ? `Password must be at least ${minPasswordLength} characters`
      : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setTouched(true);
    if (!emailValid || !passwordValid) {
      return;
    }
    onSubmit({ email, password });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        error={emailError}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={minPasswordLength > 1 ? 'new-password' : 'current-password'}
        value={password}
        error={passwordError}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errorMessage ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Please wait…' : submitLabel}
      </Button>
    </form>
  );
}
