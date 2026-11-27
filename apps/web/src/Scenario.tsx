import type { ReactNode } from 'react';

import { CodePanel } from './code/CodePanel.js';
import type { Source } from './code/sources.js';

/** One scenario page: what it shows, the live demo, and the code behind it. */
export function Scenario({
  title,
  intro,
  sources,
  children,
}: {
  title: ReactNode;
  intro: ReactNode;
  sources: ReadonlyArray<Source>;
  children?: ReactNode;
}) {
  return (
    <article className="scenario">
      <h1>{title}</h1>
      <p className="intro">{intro}</p>
      {children && <div className="demo">{children}</div>}
      <CodePanel sources={sources} />
    </article>
  );
}
