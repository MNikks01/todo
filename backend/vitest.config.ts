import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/test/setup.ts'],
    // Integration tests share a single in-memory Mongo; run serially to keep
    // DB state deterministic (docs/testing.md §6).
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reports: ['text', 'html'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/main.ts',
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/test/**',
        'src/**/*Model.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 75,
        // Security-critical: auth/ownership held to a higher bar (rules/testing.md).
        'src/modules/auth/application/**': {
          lines: 95,
          functions: 100,
          statements: 95,
          branches: 90,
        },
      },
    },
  },
});
