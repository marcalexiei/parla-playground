import type { Locale } from '@parlajs/react';
import { useSyncExternalStore } from 'react';

interface Chunk {
  readonly id: number;
  readonly namespace: string;
  readonly locale: string;
  /** What asked for it: a route, `setLocale`, or a component suspending in `useParla`. */
  readonly cause: string;
  /** Milliseconds it took; unset while it loads. */
  readonly ms?: number;
  readonly failed?: boolean;
}

export interface LabState {
  readonly chunks: ReadonlyArray<Chunk>;
  /** Added before every chunk fetch, to make loading visible. */
  readonly delay: number;
  readonly highlight: boolean;
  /** The locale `setLocale` is loading, if any. */
  readonly switching: Locale | null;
  /** Suspense fallbacks that mounted while a locale switch was loading: Parla keeps this at 0. */
  readonly fallbacksWhileSwitching: number;
}

let state: LabState = {
  chunks: [],
  delay: 0,
  highlight: true,
  switching: null,
  fallbacksWhileSwitching: 0,
};
const listeners = new Set<() => void>();

export function update(patch: Partial<LabState> | ((lab: LabState) => Partial<LabState>)): void {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
  for (const listener of listeners) {
    listener();
  }
}

export const getLab = (): LabState => state;

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function useLab<Selected>(select: (lab: LabState) => Selected): Selected {
  return useSyncExternalStore(subscribe, () => select(state));
}

let cause: string | undefined;

/** Runs `run`, crediting the chunk fetches it starts synchronously to `label`. */
export function withCause<Result>(label: string, run: () => Result): Result {
  const previous = cause;
  cause = label;
  try {
    return run();
  } finally {
    cause = previous;
  }
}

let nextId = 0;
const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

declare global {
  var __parlaChunk:
    | (<Module>(namespace: string, locale: string, load: () => Promise<Module>) => Promise<Module>)
    | undefined;
}

// Called by every generated loader, as `vite.config.ts` rewrites them.
globalThis.__parlaChunk = async <Module>(
  namespace: string,
  locale: string,
  load: () => Promise<Module>,
): Promise<Module> => {
  const id = nextId;
  nextId += 1;
  const started = performance.now();
  const set = (patch: Partial<Chunk>): void => {
    update((lab) => ({
      chunks: lab.chunks.map((chunk) => (chunk.id === id ? { ...chunk, ...patch } : chunk)),
    }));
  };
  const entry = { id, namespace, locale, cause: cause ?? 'useParla' };
  // Deferred: a component suspending in `useParla` starts this during its render.
  queueMicrotask(() => {
    update((lab) => ({ chunks: [...lab.chunks, entry] }));
  });
  try {
    if (state.delay > 0) {
      await sleep(state.delay);
    }
    const mod = await load();
    set({ ms: Math.round(performance.now() - started) });
    return mod;
  } catch (error) {
    set({ ms: Math.round(performance.now() - started), failed: true });
    throw error;
  }
};
