import { useLocale, useParla, useT } from '@parlajs/react';

export function LocaleSwitcher() {
  const t = useT('common');
  const parla = useParla();
  const [locale, setLocale] = useLocale();
  return (
    <label className="locale">
      {t.locale.label()}
      <select value={locale} onChange={(e) => void setLocale(e.target.value as typeof locale)}>
        {parla.locales.map((l) => (
          <option key={l} value={l}>
            {t.locale.name({ locale: l })}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Header() {
  const t = useT('common');
  return (
    <header className="header">
      <div>
        <h1>{t.app.title()}</h1>
        <p>{t.app.tagline()}</p>
      </div>
      <LocaleSwitcher />
    </header>
  );
}

export function Footer() {
  const t = useT('common');
  return (
    <footer className="footer">
      {t.footer({
        year: String(new Date().getFullYear()),
        link: (children) => <a href="https://github.com/marcalexiei/parla">{children}</a>,
      })}
    </footer>
  );
}
