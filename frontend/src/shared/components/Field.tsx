import type { InputHTMLAttributes, ReactNode } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  children?: ReactNode;
}

export function Field({ label, error, id, children, ...inputProps }: FieldProps) {
  const fieldId = id ?? inputProps.name;
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={fieldId}>
      <span className="font-medium text-gray-700">{label}</span>
      {children ?? (
        <input
          id={fieldId}
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-hidden"
          aria-invalid={error ? true : undefined}
          {...inputProps}
        />
      )}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
