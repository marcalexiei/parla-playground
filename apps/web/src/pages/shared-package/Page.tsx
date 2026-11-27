import { useLocale, useParla } from '@parlajs/react';
import type { ReactNode } from 'react';

import { catalogSources, fileSource } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { SharedPackageDemo } from './Demo.js';

export function Page(): ReactNode {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.sharedPackage.title()}
      intro={t.shell.pages.sharedPackage.intro()}
      sources={[
        fileSource('Demo.tsx', async () => import('./Demo.tsx?raw')),
        fileSource('packages/ui/src/index.tsx', async () => import('../../../../../packages/ui/src/index.tsx?raw')),
        fileSource('packages/ui/parla.config.ts', async () => import('../../../../../packages/ui/parla.config.ts?raw')),
        ...catalogSources('common', locale, 'ui'),
      ]}
    >
      <SharedPackageDemo />
    </Scenario>
  );
}
