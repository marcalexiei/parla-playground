import { useLocale, useParla } from '@parlajs/react';
import { useState } from 'react';

import { shell } from '../parla/namespaces/shell.js';
import { ChunkLog } from './ChunkLog.js';
import { localeName, milliseconds } from './locale.js';
import { update, useLab } from './store.js';

const DELAYS = [0, 300, 1000, 3000];

/** The locale switch, made visible: its status, a chunk delay, and the chunk log. */
export function LabBar() {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  const switching = useLab((s) => s.switching);
  const delay = useLab((s) => s.delay);
  const highlight = useLab((s) => s.highlight);
  const chunks = useLab((s) => s.chunks);
  const [open, setOpen] = useState(false);
  const loading = chunks.filter((c) => c.ms === undefined).length;

  return (
    <div className="lab-bar" data-switching={switching ? '' : undefined}>
      <p className="lab-status" role="status">
        {switching ? <span className="spinner" aria-hidden="true" /> : <span className="dot" aria-hidden="true" />}
        {switching
          ? t.shell.lab.switching({ locale: localeName(switching, locale), current: localeName(locale, locale) })
          : t.shell.lab.showing({ locale: localeName(locale, locale) })}
      </p>
      <div className="lab-controls">
        <label>
          {t.shell.lab.delay()}
          <select value={delay} onChange={(e) => update({ delay: Number(e.target.value) })}>
            {DELAYS.map((ms) => (
              <option key={ms} value={ms}>
                {ms === 0 ? t.shell.lab.off() : milliseconds(locale, ms)}
              </option>
            ))}
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={highlight} onChange={(e) => update({ highlight: e.target.checked })} />
          {t.shell.lab.highlight()}
        </label>
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {loading > 0 && <span className="spinner" aria-hidden="true" />}
          {t.shell.lab.chunks({ count: chunks.length })}
        </button>
      </div>
      {open && <ChunkLog onClose={() => setOpen(false)} />}
    </div>
  );
}
