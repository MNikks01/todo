import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { useAuthStore } from '@/app/store/authStore';
import { useFilterStore } from '@/features/todos/store/filterStore';
import { server } from './server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  // With Vitest globals disabled, RTL's auto-cleanup isn't registered — do it here.
  cleanup();
  server.resetHandlers();
  useAuthStore.getState().clear();
  useFilterStore.getState().reset();
});

afterAll(() => server.close());
