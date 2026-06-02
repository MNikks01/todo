export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center p-6" role="status" aria-live="polite">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
