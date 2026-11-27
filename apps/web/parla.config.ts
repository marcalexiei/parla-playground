import { defineConfig } from '@parlajs/compiler';

import { localeFallbacks } from './src/lab/fallbacks.ts';

export default defineConfig({
  locales: ['en', 'it', 'de', 'de-IT-x-sappada', 'fur', 'ar'],
  // Friulian falls back to Italian; Sappadino to its base, German.
  fallbacks: localeFallbacks,
  sourceLocale: 'en',
  outDir: 'src/parla',
  functions: { relative: 'number' },
  markup: ['strong', 'code', 'br'],
  namespaces: {
    shell: { format: 'icu', path: 'locales/{locale}/shell.json' },
    pluralsIcu: { format: 'icu', path: 'locales/{locale}/plurals-icu.json' },
    pluralsMf2: { format: 'mf2', path: 'locales/{locale}/plurals-mf2.json' },
    select: { format: 'mf2', path: 'locales/{locale}/select.json' },
    formatting: { format: 'mf2', path: 'locales/{locale}/formatting.json' },
    richText: { format: 'icu', path: 'locales/{locale}/rich-text.json' },
    lazy: { format: 'icu', path: 'locales/{locale}/lazy.json' },
    fallbacks: { format: 'icu', path: 'locales/{locale}/fallbacks.json' },
    checkout: { format: 'mf2', path: 'locales/{locale}/checkout.json' },
    account: { format: 'icu', path: 'locales/{locale}/account.json' },
  },
});
