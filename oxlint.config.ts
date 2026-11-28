import { baseConfig } from '@marcalexiei/oxlint-config/base';
import { nodeConfig } from '@marcalexiei/oxlint-config/node';
import { reactConfig } from '@marcalexiei/oxlint-config/react';
import { typescriptConfig } from '@marcalexiei/oxlint-config/typescript';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [baseConfig, typescriptConfig],

  // `parla build` writes `src/parla/`.
  ignorePatterns: ['**/src/parla/**', 'vendor/**'],

  env: {
    browser: true,
  },

  options: {
    reportUnusedDisableDirectives: 'error',
    typeAware: true,
  },

  rules: {
    // As in Parla: a module exports next to what it defines, so its shape reads top to bottom.
    'import/exports-last': 'off',
  },

  overrides: [
    {
      // Each line is a type error pinned with `@ts-expect-error`, so its values are error-typed.
      files: ['apps/web/src/pages/type-errors/examples.tsx'],
      rules: {
        'typescript/no-floating-promises': 'off',
        'typescript/no-unsafe-call': 'off',
        'typescript/no-unsafe-member-access': 'off',
      },
    },
    {
      // All browser code, so the hooks in `.ts` modules are checked too.
      files: ['apps/web/src/**', 'packages/ui/src/**'],
      ...reactConfig,
    },
    {
      // Only these run on Node; the rest runs in the browser.
      files: ['**/*.config.ts'],
      ...nodeConfig,
      env: { node: true },
    },
  ],
});
