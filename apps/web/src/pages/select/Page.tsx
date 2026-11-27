import { useLocale, useParla } from '@parlajs/react';
import type { ReactNode } from 'react';

import { catalogSources, fileSource, typesSource } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { SelectDemo } from './Demo.js';

export function Page(): ReactNode {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.select.title()}
      intro={t.shell.pages.select.intro()}
      sources={[
        fileSource('Demo.tsx', async () => import('./Demo.tsx?raw')),
        typesSource('select'),
        ...catalogSources('select', locale),
      ]}
    >
      <SelectDemo />
    </Scenario>
  );
}
