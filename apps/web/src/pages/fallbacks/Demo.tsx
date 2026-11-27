import { useLocale, useParla } from '@parlajs/react';
import type { ReactNode } from 'react';

import { localeName } from '../../lab/locale.js';
import { fallbacks } from '../../parla/namespaces/fallbacks.js';

// The raw catalogs, only to tell which keys a locale has: Parla's output already filled the rest.
const catalogs: Record<string, Record<string, unknown>> = import.meta.glob(
  '../../../locales/*/fallbacks.json',
  {
    eager: true,
    import: 'default',
  },
);

const keysOf = (tag: string): Record<string, unknown> =>
  Object.entries(catalogs).find(([path]) => path.includes(`/${tag}/`))?.[1] ?? {};

export function FallbacksDemo(): ReactNode {
  const { t } = useParla([fallbacks]);
  const { locale } = useLocale();
  // Parla's chain: the locale, its base language, then English.
  const chain = [...new Set([locale, locale.split('-')[0] ?? locale, 'en'])];
  const sourceOf = (key: string): string => chain.find((tag) => key in keysOf(tag)) ?? 'en';
  const rows: Array<[string, ReactNode]> = [
    ['welcome', t.fallbacks.welcome()],
    ['cart', t.fallbacks.cart()],
    ['shipping', t.fallbacks.shipping()],
    ['returns', t.fallbacks.returns()],
    ['support', t.fallbacks.support()],
  ];
  return (
    <ul className="values">
      {rows.map(([key, text]) => (
        <li key={key} className="fallback-row">
          <code dir="ltr">{key}</code>
          <span>{text}</span>
          {sourceOf(key) === locale ? (
            <span className="badge">{t.fallbacks.legend.own()}</span>
          ) : (
            <span className="badge warn">
              {t.fallbacks.legend.fallback({ locale: localeName(sourceOf(key), locale) })}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
