import type { Namespace } from '@parlajs/react';
import { common } from '@playground/ui/namespaces/common.js';
import type { ComponentType } from 'react';

import { account } from './parla/namespaces/account.js';
import { checkout } from './parla/namespaces/checkout.js';
import { fallbacks } from './parla/namespaces/fallbacks.js';
import { formatting } from './parla/namespaces/formatting.js';
import { lazy } from './parla/namespaces/lazy.js';
import { pluralsIcu } from './parla/namespaces/pluralsIcu.js';
import { pluralsMf2 } from './parla/namespaces/pluralsMf2.js';
import { richText } from './parla/namespaces/richText.js';
import { select } from './parla/namespaces/select.js';

export interface Route {
  readonly path: string;
  /** Loaded with the page's code, before the page shows: it never suspends on them. */
  readonly namespaces: ReadonlyArray<Namespace>;
  readonly page: () => Promise<{ Page: ComponentType }>;
}

export const routes = {
  home: { path: '/', namespaces: [], page: async () => import('./pages/home/Page.js') },
  plurals: {
    path: '/plurals',
    namespaces: [pluralsIcu, pluralsMf2],
    page: async () => import('./pages/plurals/Page.js'),
  },
  select: { path: '/select', namespaces: [select], page: async () => import('./pages/select/Page.js') },
  formatting: {
    path: '/formatting',
    namespaces: [formatting],
    page: async () => import('./pages/formatting/Page.js'),
  },
  richText: {
    path: '/rich-text',
    namespaces: [richText],
    page: async () => import('./pages/rich-text/Page.js'),
  },
  // `account` is left out on purpose: the page's panel suspends on it.
  lazy: { path: '/lazy', namespaces: [lazy], page: async () => import('./pages/lazy/Page.js') },
  fallbacks: {
    path: '/fallbacks',
    namespaces: [fallbacks],
    page: async () => import('./pages/fallbacks/Page.js'),
  },
  typedProps: {
    path: '/typed-props',
    namespaces: [checkout, account],
    page: async () => import('./pages/typed-props/Page.js'),
  },
  sharedPackage: {
    path: '/shared-package',
    namespaces: [common],
    page: async () => import('./pages/shared-package/Page.js'),
  },
  typeErrors: { path: '/type-errors', namespaces: [], page: async () => import('./pages/type-errors/Page.js') },
} as const satisfies Record<string, Route>;

export type RouteId = keyof typeof routes;
