import { defineConfig } from '@x18n/cli';

import { parla } from './x18n-parla.ts';

export default defineConfig({
  sourceLocale: 'en',
  locales: ['en', 'it', 'de', 'de-IT-x-sappada', 'fur', 'ar'],
  // Parla fills a missing key from English at build time, so a partial locale is not broken.
  localeFallbacks: { it: 'en', de: 'en', 'de-IT-x-sappada': 'de', fur: 'it', ar: 'en' },
  resources: [
    { pattern: 'apps/web/locales/{locale}/{namespace}.json' },
    { pattern: 'packages/ui/locales/{locale}/{namespace}.json' },
  ],
  // Parla keys are dotted paths inside a namespace, never `ns.key`.
  namespace: { separator: ':' },
  plugins: [parla()],
  usage: {
    include: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
    exclude: ['**/src/parla/**'],
  },
});
