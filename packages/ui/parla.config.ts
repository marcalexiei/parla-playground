import { defineConfig } from '@parlajs/compiler';

// The owner fixes the locales: an app may have fewer, not more.
export default defineConfig({
  locales: ['en', 'it', 'de', 'de-IT-x-sappada', 'fur', 'ar'],
  fallbacks: { fur: ['it'] },
  sourceLocale: 'en',
  outDir: 'src/parla',
  namespaces: {
    common: { format: 'icu', path: 'locales/{locale}/common.json' },
  },
});
