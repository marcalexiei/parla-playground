import { useParla } from '@parlajs/react';
import { useEffect, useEffectEvent, useState } from 'react';
import type { ReactNode } from 'react';

import { shell } from '../parla/namespaces/shell.js';
import { Code } from './Code.js';
import type { Source } from './sources.js';

/** Tabs of source files, loaded on demand; the last one shows until the next is ready. */
export function CodePanel({ sources }: { sources: ReadonlyArray<Source> }): ReactNode {
  const { t } = useParla([shell]);
  const [tab, setTab] = useState(0);
  const [text, setText] = useState<string | null>(null);
  const active = sources[Math.min(tab, sources.length - 1)];

  const { label } = active;
  // Each render passes new source objects, so the effect follows the label and reads the latest.
  const loadActive = useEffectEvent(async (): Promise<string> => active.load());

  useEffect(() => {
    let live = true;
    const show = async (): Promise<void> => {
      const source = await loadActive();
      if (live) {
        setText(source);
      }
    };
    void show();
    return (): void => {
      live = false;
    };
  }, [label]);

  return (
    <section className="code-panel" aria-label={t.shell.code.label()} data-no-flash>
      <div className="tabs" role="tablist" dir="ltr">
        {sources.map((source, index) => (
          <button
            key={source.label}
            type="button"
            role="tab"
            aria-selected={source === active}
            className="tab"
            onClick={() => {
              setTab(index);
            }}
          >
            {source.label}
          </button>
        ))}
      </div>
      {text === null ? <pre className="code" /> : <Code source={text} />}
    </section>
  );
}
