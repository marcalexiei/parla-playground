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

export function FallbacksDemo(): ReactNode {
  const { t } = useParla([fallbacks]);
  const { locale } = useLocale();
  const own = Object.entries(catalogs).find(([path]) => path.includes(`/${locale}/`))?.[1] ?? {};
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
          {key in own ? (
            <span className="badge">{t.fallbacks.legend.own()}</span>
          ) : (
            <span className="badge warn">
              {t.fallbacks.legend.fallback({ locale: localeName('en', locale) })}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
