import { useParla } from '@parlajs/react';
import type { ReactNode } from 'react';

import { fileSource } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';

export function Page(): ReactNode {
  const { t } = useParla([shell]);
  return (
    <Scenario
      title={t.shell.pages.typeErrors.title()}
      intro={t.shell.pages.typeErrors.intro()}
      sources={[
        fileSource('examples.tsx', async () => import('./examples.tsx?raw')),
        fileSource('checkout.d.ts', async () => import('../../parla/namespaces/checkout.d.ts?raw')),
      ]}
    />
  );
}
