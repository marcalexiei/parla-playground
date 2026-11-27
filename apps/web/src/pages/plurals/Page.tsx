import { useLocale, useParla } from '@parlajs/react';
import type { ReactNode } from 'react';

import { catalogSources, fileSource } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';

import { PluralsDemo } from './Demo.js';

export function Page(): ReactNode {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.plurals.title()}
      intro={t.shell.pages.plurals.intro()}
      sources={[
        fileSource('Demo.tsx', async () => import('./Demo.tsx?raw')),
        ...catalogSources('plurals-icu', locale),
        ...catalogSources('plurals-mf2', locale),
      ]}>
      <PluralsDemo />
    </Scenario>
  );
}
