import { createParla, matchLocale } from '@parlajs/react';

import { localeFallbacks } from './lab/fallbacks.js';
import { catalog } from './parla/catalog.js';

const saved = ((): string | null => {
  try {
    return localStorage.getItem('locale');
  } catch {
    return null;
  }
})();

export const parla = createParla({
  catalog,
  locale: matchLocale(
    saved ? [saved, ...navigator.languages] : navigator.languages,
    catalog.locales,
    catalog.sourceLocale,
  ),
  // The config's `functions`: `{$days :relative unit=day}`.
  functions: {
    relative: (value, options, locale) =>
      // Browsers lack `fur`: its fallback chain gives `Intl` Italian.
      new Intl.RelativeTimeFormat([locale, ...(localeFallbacks[locale] ?? [])], {
        numeric: 'auto',
      }).format(Number(value), (options.unit ?? 'day') as Intl.RelativeTimeFormatUnit),
  },
  // The config's `markup`: tags a call may leave out.
  markup: {
    strong: (children) => <strong>{children}</strong>,
    code: (children) => <code dir="ltr">{children}</code>,
    br: () => <br />,
  },
});
