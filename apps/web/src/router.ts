import type { Namespace } from '@parlajs/react';
import type { ComponentType } from 'react';
import { useSyncExternalStore } from 'react';

import { withCause } from './lab/store.js';
import { parla } from './parla.js';
import { routes } from './routes.js';
import type { RouteId } from './routes.js';

interface RouterState {
  readonly id: RouteId;
  readonly Page: ComponentType;
  /** The route being loaded, if any; the current page stays until it is ready. */
  readonly pending: RouteId | null;
}

let state: RouterState | undefined;
const listeners = new Set<() => void>();
let token = 0;

const set = (next: RouterState): void => {
  state = next;
  for (const listener of listeners) {
    listener();
  }
};

const ids = Object.keys(routes) as Array<RouteId>;
const idOf = (hash: string): RouteId => ids.find((id) => `#${routes[id].path}` === (hash || '#/')) ?? 'home';

export const href = (id: RouteId): string => `#${routes[id].path}`;

/** The route loader: the page's code and its namespaces, in parallel. */
async function load(id: RouteId): Promise<ComponentType> {
  const route = routes[id];
  const namespaces: ReadonlyArray<Namespace> = route.namespaces;
  const [{ Page }] = await withCause(`route ${route.path}`, async () =>
    Promise.all([route.page(), namespaces.length > 0 ? parla.load(namespaces) : undefined]),
  );
  return Page;
}

async function navigate(): Promise<void> {
  const id = idOf(location.hash);
  token += 1;
  const mine = token;
  if (state) {
    set({ ...state, pending: id });
  }
  const Page = await load(id);
  if (mine === token) {
    set({ id, Page, pending: null });
    window.scrollTo({ top: 0 });
  }
}

/** Loads the first route; resolves once it can render. */
export async function startRouter(): Promise<void> {
  window.addEventListener('hashchange', () => void navigate());
  await navigate();
}

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useRouter(): RouterState {
  const current = useSyncExternalStore(subscribe, () => state);
  if (!current) {
    throw new Error('startRouter() first');
  }
  return current;
}
