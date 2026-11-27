import { useLocale, useParla } from '@parlajs/react';

import { common } from './parla/namespaces/common.js';

export function LocaleSwitcher() {
  const { t } = useParla([common]);
  const { locale, locales, setLocale } = useLocale();
  return (
    <label className="locale">
      {t.common.locale.label()}
      <select value={locale} onChange={(e) => void setLocale(e.target.value as typeof locale)}>
        {locales.map((l) => (
          <option key={l} value={l}>
            {t.common.locale.name({ locale: l })}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Header() {
  const { t } = useParla([common]);
  return (
    <header className="header">
      <div>
        <h1>{t.common.app.title()}</h1>
        <p>{t.common.app.tagline()}</p>
      </div>
      <LocaleSwitcher />
    </header>
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
