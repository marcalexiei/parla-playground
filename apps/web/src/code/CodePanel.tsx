import { useParla } from '@parlajs/react';
import { useEffect, useState } from 'react';

import { shell } from '../parla/namespaces/shell.js';
import { Code } from './Code.js';
import type { Source } from './sources.js';

/** Tabs of source files, loaded on demand; the last one shows until the next is ready. */
export function CodePanel({ sources }: { sources: ReadonlyArray<Source> }) {
  const { t } = useParla([shell]);
  const [tab, setTab] = useState(0);
  const [text, setText] = useState<string | null>(null);
  const active = sources[Math.min(tab, sources.length - 1)];

  useEffect(() => {
    let live = true;
    void active?.load().then((source) => {
      if (live) {
        setText(source);
      }
    });
    return () => {
      live = false;
    };
  }, [active?.label]);

  return (
    <section className="code-panel" aria-label={t.shell.code.label()} data-no-flash>
      <div className="tabs" role="tablist" dir="ltr">
        {sources.map((source, i) => (
          <button
            key={source.label}
            type="button"
            role="tab"
            aria-selected={source === active}
            className="tab"
            onClick={() => setTab(i)}
          >
            {source.label}
          </button>
        ))}
      </div>
      {text === null ? <pre className="code" /> : <Code source={text} />}
    </section>
  );
}
