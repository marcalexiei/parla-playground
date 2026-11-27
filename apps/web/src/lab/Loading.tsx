import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { getLab, update } from './store.js';

/** A Suspense fallback that counts itself when it shows during a locale switch. */
export function Loading({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (getLab().switching) {
      update((s) => ({ fallbacksWhileSwitching: s.fallbacksWhileSwitching + 1 }));
    }
  }, []);
  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true" />
      {children}
    </div>
  );
}
