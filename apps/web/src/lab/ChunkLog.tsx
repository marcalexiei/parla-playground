import { useLocale, useParla } from '@parlajs/react';

import { shell } from '../parla/namespaces/shell.js';
import { milliseconds } from './locale.js';
import { update, useLab } from './store.js';

/** Every chunk fetched this visit, newest first, with what asked for it. */
export function ChunkLog({ onClose }: { onClose: () => void }) {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  const chunks = useLab((s) => s.chunks);
  const fallbacks = useLab((s) => s.fallbacksWhileSwitching);
  return (
    <section className="chunk-log" aria-label={t.shell.lab.log()} data-no-flash>
      <header>
        <h2>{t.shell.lab.log()}</h2>
        <button type="button" onClick={() => update({ chunks: chunks.filter((c) => c.ms === undefined) })}>
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
          {chunks.toReversed().map((c) => (
            <li key={c.id} className={c.failed ? 'failed' : undefined}>
              <code>
                {c.locale}/{c.namespace}.js
              </code>
              <span className="cause">{c.cause}</span>
              <span className="ms">{c.ms === undefined ? t.shell.lab.pending() : milliseconds(locale, c.ms)}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="muted">{t.shell.lab.fallbacks({ count: fallbacks })}</p>
    </section>
  );
}
