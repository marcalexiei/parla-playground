import { useParla } from '@parlajs/react';
import { Footer, LocaleSwitcher } from '@playground/ui';
import { common } from '@playground/ui/namespaces/common.js';
import { useEffect } from 'react';

import { LabBar } from './lab/LabBar.js';
import { switchLocale } from './lab/locale.js';
import { useLab } from './lab/store.js';
import { shell } from './parla/namespaces/shell.js';
import { href, useRouter } from './router.js';
import type { RouteId } from './routes.js';

export function App() {
  const { t } = useParla([shell, common]);
  const { id, Page, pending } = useRouter();
  const switching = useLab((s) => s.switching);
  const labels: Record<RouteId, string> = {
    home: t.shell.nav.home(),
    plurals: t.shell.nav.plurals(),
    select: t.shell.nav.select(),
    formatting: t.shell.nav.formatting(),
    richText: t.shell.nav.richText(),
    lazy: t.shell.nav.lazy(),
    fallbacks: t.shell.nav.fallbacks(),
    typedProps: t.shell.nav.typedProps(),
    sharedPackage: t.shell.nav.sharedPackage(),
    typeErrors: t.shell.nav.typeErrors(),
  };
  const title = t.common.app.title();

  useEffect(() => {
    document.title = id === 'home' ? title : `${labels[id]} · ${title}`;
  });

  return (
    <div className="app">
      <header className="header">
        <a className="brand" href={href('home')}>
          <span className="brand-title">{title}</span>
          <span className="brand-tagline">{t.common.app.tagline()}</span>
        </a>
        <LocaleSwitcher pending={switching} onSelect={(l) => void switchLocale(l)} />
      </header>
      <LabBar />
      <div className="layout">
        <nav className="nav" aria-label={t.shell.nav.label()}>
          <ul>
            {(Object.keys(labels) as Array<RouteId>).map((route) => (
              <li key={route}>
                <a
                  href={href(route)}
                  aria-current={route === id ? 'page' : undefined}
                  aria-busy={route === pending}
                >
                  {labels[route]}
                  {route === pending && <span className="spinner" role="status" aria-label={t.common.loading()} />}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <main className="main" aria-busy={pending !== null}>
          <Page />
        </main>
      </div>
      <Footer />
    </div>
  );
}
