import axios from 'axios';
import type { ApiProblem } from '@/shared/types/api';

/** Extracts a safe, user-facing message from an API error. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiProblem | undefined;
    if (data?.message) {
      return data.message;
    }
  }
  return fallback;
}
