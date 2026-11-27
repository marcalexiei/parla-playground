import { useLocale, useParla } from '@parlajs/react';
import type { ReactNode } from 'react';

import { catalogSources, fileSource } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';

import { LazyDemo } from './Demo.js';

export function Page(): ReactNode {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.lazy.title()}
      intro={t.shell.pages.lazy.intro()}
      sources={[
        fileSource('Demo.tsx', async () => import('./Demo.tsx?raw')),
        fileSource('routes.ts', async () => import('../../routes.ts?raw')),
        fileSource('router.ts', async () => import('../../router.ts?raw')),
        ...catalogSources('lazy', locale),
        ...catalogSources('account', locale),
      ]}>
      <LazyDemo />
    </Scenario>
  );
}
