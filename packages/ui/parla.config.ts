import { defineConfig } from '@parlajs/compiler';

// The owner fixes the locales: an app may have fewer, not more.
export default defineConfig({
  // Sappadino (Plodarisch) has no text yet: `parla build` fills it from `de`, then `en`.
  locales: ['en', 'it', 'de', 'de-IT-x-sappada', 'ar'],
  sourceLocale: 'en',
  outDir: 'src/parla',
  namespaces: {
    common: { format: 'icu', path: 'locales/{locale}/common.json' },
  },
});
