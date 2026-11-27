import { useLocale, useParla } from '@parlajs/react';
import type { Locale } from '@parlajs/react';

import { common } from './parla/namespaces/common.js';

/** Each locale in its own language: what a reader looks for. */
const ownName = (locale: string): string => {
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
}) {
  const { t } = useParla([common]);
  const { locale, locales } = useLocale();
  return (
    <div className="locale-switcher" role="group" aria-label={t.common.locale.label()}>
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === locale}
          aria-busy={l === pending}
          className={l === pending ? 'pending' : undefined}
          onClick={() => onSelect(l)}
        >
          {ownName(l)}
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
}) {
  const { t } = useParla([common]);
  return (
    <nav className="pagination" aria-label={t.common.pager.status({ page, total })}>
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        {t.common.pager.previous()}
      </button>
      <span>{t.common.pager.status({ page, total })}</span>
      <button type="button" disabled={page >= total} onClick={() => onChange(page + 1)}>
        {t.common.pager.next()}
      </button>
    </nav>
  );
}

export function Footer() {
  const { t } = useParla([common]);
  return (
    <footer className="footer">
      {t.common.footer({
        year: String(new Date().getFullYear()),
        link: (children) => <a href="https://github.com/marcalexiei/parla">{children}</a>,
      })}
    </footer>
  );
}
