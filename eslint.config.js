// Flat ESLint config — root, applies to all workspaces.
// Enforces: strict TS, no `any` (rules/typescript.md), and architectural
// boundaries (rules/architecture.md, ADR-0007): frontend feature isolation +
// backend Clean-Architecture layering (no Mongoose/infra leaking inward).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    // Not linted.
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/.husky/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Project-wide TypeScript rules.
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { import: importPlugin },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      // rules/typescript.md — no `any`, explicit boundaries, type-only imports.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
    },
  },

  // Backend — Clean Architecture layering (ADR-0007).
  // Domain & application layers must NOT import Mongoose or the infrastructure layer.
  {
    files: ['backend/src/**/domain/**/*.ts', 'backend/src/**/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'mongoose',
              message:
                'Domain/application layers must not depend on Mongoose. Use repository interfaces; keep Mongoose in infrastructure/ (rules/architecture.md).',
            },
          ],
          patterns: [
            {
              group: ['**/infrastructure/**', '**/interface/**'],
              message:
                'Inner layers (domain/application) must not import outer layers (infrastructure/interface). Dependency rule: inward only.',
            },
          ],
        },
      ],
    },
  },

  // Backend — only the infrastructure layer may import Mongoose. Tests are
  // exempt (they set up the DB and assert on models directly).
  {
    files: ['backend/src/**/*.ts'],
    ignores: [
      'backend/src/**/infrastructure/**',
      'backend/src/infrastructure/**',
      'backend/src/test/**',
      'backend/src/**/*.test.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'mongoose',
              message:
                'Mongoose may only be imported from the infrastructure layer (rules/architecture.md, ADR-0007).',
            },
          ],
        },
      ],
    },
  },

  // Frontend — feature isolation: a feature may not import from a sibling
  // feature. Enforced on the `@/` alias (no-restricted-imports), which is how
  // the app actually imports (rules/architecture.md). `app/` may import features.
  {
    files: ['frontend/src/features/todos/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/auth', '@/features/auth/*', '../auth', '../auth/*'],
              message:
                'Features must not import each other. Share via src/shared/ or lift to app/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['frontend/src/features/auth/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/todos', '@/features/todos/*', '../todos', '../todos/*'],
              message:
                'Features must not import each other. Share via src/shared/ or lift to app/.',
            },
          ],
        },
      ],
    },
  },

  // Node globals for backend + tooling + e2e.
  {
    files: ['backend/**/*.ts', '*.{js,ts}', 'scripts/**/*.{js,ts}', 'e2e/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
  },

  // CommonJS config files (e.g. commitlint.config.cjs).
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },

  // Browser globals for frontend.
  {
    files: ['frontend/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
  },

  // Prettier compatibility — must be last to disable conflicting style rules.
  prettier,
);
