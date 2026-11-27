import { defineConfig } from '@parlajs/compiler';

export default defineConfig({
  locales: ['en', 'it', 'de'],
  sourceLocale: 'en',
  outDir: 'src/parla',
  namespaces: {
    checkout: { format: 'mf2', path: 'locales/{locale}/checkout.json' },
    account: { format: 'icu', path: 'locales/{locale}/account.json' },
  },
});
