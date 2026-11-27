import { useLocale, useParla } from '@parlajs/react';
import type { Locale } from '@parlajs/react';
import type { ReactNode } from 'react';

import { common } from './parla/namespaces/common.js';

// `Intl` has no name for a private-use tag.
const OWN_NAMES: Partial<Record<string, string>> = { 'de-IT-x-sappada': 'Plodarisch' };

/** Each locale in its own language: what a reader looks for. */
const ownName = (locale: string): string => {
  const known = OWN_NAMES[locale];
  if (known !== undefined) {
    return known;
  }
  const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
};

export function LocaleSwitcher({
  pending,
  onSelect,
}: {
  /** The locale being loaded, if any. */
  pending?: Locale | null;
  onSelect: (locale: Locale) => void;
}): ReactNode {
  const { t } = useParla([common]);
  const { locale, locales } = useLocale();
  return (
    <div className="locale-switcher" role="group" aria-label={t.common.locale.label()}>
      {locales.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-pressed={option === locale}
          aria-busy={option === pending}
          className={option === pending ? 'pending' : undefined}
          onClick={() => {
            onSelect(option);
          }}>
          {ownName(option)}
        </button>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (page: number) => void;
}): ReactNode {
  const { t } = useParla([common]);
  return (
    <nav className="pagination" aria-label={t.common.pager.status({ page, total })}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => {
          onChange(page - 1);
        }}>
        {t.common.pager.previous()}
      </button>
      <span>{t.common.pager.status({ page, total })}</span>
      <button
        type="button"
        disabled={page >= total}
        onClick={() => {
          onChange(page + 1);
        }}>
        {t.common.pager.next()}
      </button>
    </nav>
  );
}

const YEAR = String(new Date().getFullYear());
const parlaLink = (children: ReactNode): ReactNode => (
  <a href="https://github.com/marcalexiei/parla">{children}</a>
);

export function Footer(): ReactNode {
  const { t } = useParla([common]);
  return <footer className="footer">{t.common.footer({ year: YEAR, link: parlaLink })}</footer>;
}
