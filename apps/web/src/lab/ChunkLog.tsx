import { useLocale, useParla } from '@parlajs/react';

import type { ReactNode } from 'react';

import { shell } from '../parla/namespaces/shell.js';
import { milliseconds } from './locale.js';
import { update, useLab } from './store.js';

/** Every chunk fetched this visit, newest first, with what asked for it. */
export function ChunkLog({ onClose }: { onClose: () => void }): ReactNode {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  const chunks = useLab((lab) => lab.chunks);
  const fallbacks = useLab((lab) => lab.fallbacksWhileSwitching);
  return (
    <section className="chunk-log" aria-label={t.shell.lab.log()} data-no-flash>
      <header>
        <h2>{t.shell.lab.log()}</h2>
        <button type="button" onClick={() => { update({ chunks: chunks.filter((chunk) => chunk.ms === undefined) }); }}>
          {t.shell.lab.clear()}
        </button>
        <button type="button" onClick={onClose}>
          {t.shell.lab.close()}
        </button>
      </header>
      {chunks.length === 0 ? (
        <p className="muted">{t.shell.lab.empty()}</p>
      ) : (
        <ol dir="ltr">
          {chunks.toReversed().map((chunk) => (
            <li key={chunk.id} className={chunk.failed ? 'failed' : undefined}>
              <code>
                {chunk.locale}/{chunk.namespace}.js
              </code>
              <span className="cause">{chunk.cause}</span>
              <span className="ms">
                {chunk.ms === undefined ? t.shell.lab.pending() : milliseconds(locale, chunk.ms)}
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="muted">{t.shell.lab.fallbacks({ count: fallbacks })}</p>
    </section>
  );
}
