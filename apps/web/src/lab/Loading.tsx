import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { getLab, update } from './store.js';

/** A Suspense fallback that counts itself when it shows during a locale switch. */
export function Loading({ children }: { children: ReactNode }): ReactNode {
  useEffect(() => {
    if (getLab().switching) {
      update((lab) => ({ fallbacksWhileSwitching: lab.fallbacksWhileSwitching + 1 }));
    }
  }, []);
  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true" />
      {children}
    </div>
  );
}
