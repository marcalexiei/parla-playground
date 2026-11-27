import { useParla } from '@parlajs/react';
import type { ReactNode } from 'react';

import { shell } from '../../parla/namespaces/shell.js';
import { href } from '../../router.js';
import type { RouteId } from '../../routes.js';

export function Page() {
  const { t } = useParla([shell]);
  const cards: Array<[RouteId, string, ReactNode]> = [
    ['plurals', t.shell.pages.plurals.title(), t.shell.pages.plurals.intro()],
    ['select', t.shell.pages.select.title(), t.shell.pages.select.intro()],
    ['formatting', t.shell.pages.formatting.title(), t.shell.pages.formatting.intro()],
    ['richText', t.shell.pages.richText.title(), t.shell.pages.richText.intro()],
    ['lazy', t.shell.pages.lazy.title(), t.shell.pages.lazy.intro()],
    ['fallbacks', t.shell.pages.fallbacks.title(), t.shell.pages.fallbacks.intro()],
    ['typedProps', t.shell.pages.typedProps.title(), t.shell.pages.typedProps.intro()],
    ['sharedPackage', t.shell.pages.sharedPackage.title(), t.shell.pages.sharedPackage.intro()],
    ['typeErrors', t.shell.pages.typeErrors.title(), t.shell.pages.typeErrors.intro()],
  ];
  return (
    <article className="scenario home">
      <h1>{t.shell.home.title()}</h1>
      <p className="intro">{t.shell.home.intro()}</p>
      <p className="callout">{t.shell.home.try()}</p>
      <h2>{t.shell.home.cards({ count: cards.length })}</h2>
      <ul className="cards">
        {cards.map(([id, title, intro]) => (
          <li key={id}>
            <a href={href(id)}>
              <strong>{title}</strong>
              <span>{intro}</span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
