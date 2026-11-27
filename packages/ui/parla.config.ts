import { defineConfig } from '@parlajs/compiler';

// The owner fixes the locales: an app may have fewer, not more.
export default defineConfig({
  locales: ['en', 'it', 'de', 'ar'],
  sourceLocale: 'en',
  outDir: 'src/parla',
  namespaces: {
    common: { format: 'icu', path: 'locales/{locale}/common.json' },
  },
});
