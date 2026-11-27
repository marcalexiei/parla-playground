import { useParla } from '@parlajs/react';
import { Footer, LocaleSwitcher } from '@playground/ui';
import { common } from '@playground/ui/namespaces/common.js';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { LabBar } from './lab/LabBar.js';
import { switchLocale } from './lab/locale.js';
import { useLab } from './lab/store.js';
import { shell } from './parla/namespaces/shell.js';
import { href, useRouter } from './router.js';
import type { RouteId } from './routes.js';

export function App(): ReactNode {
  const { t } = useParla([shell, common]);
  const { id, Page, pending } = useRouter();
  const switching = useLab((lab) => lab.switching);
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
          {/* The mark only: the title beside it is translated, the logo's wordmark is not. */}
          <img
            className="brand-mark"
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
            width={40}
            height={40}
          />
          <span className="brand-text">
            <span className="brand-title">{title}</span>
            <span className="brand-tagline">{t.common.app.tagline()}</span>
          </span>
        </a>
        <LocaleSwitcher
          pending={switching}
          onSelect={(locale) => {
            void switchLocale(locale);
          }}
        />
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
                  aria-busy={route === pending}>
                  {labels[route]}
                  {route === pending && (
                    <span className="spinner" role="status" aria-label={t.common.loading()} />
                  )}
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
