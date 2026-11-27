import { defineConfig } from '@marcalexiei/oxfmt-config';

export default defineConfig({
  // `parla build` writes `src/parla/`; oxfmt already skips lock files, but spelled out it survives that default changing.
  ignorePatterns: ['pnpm-lock.yaml', '**/src/parla/**', 'vendor/**'],
});
