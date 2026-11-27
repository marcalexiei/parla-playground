import { useParla } from '@parlajs/react';

import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';

export function Page() {
  const { t } = useParla([shell]);
  return (
    <Scenario
      title={t.shell.pages.typeErrors.title()}
      intro={t.shell.pages.typeErrors.intro()}
      sources={[
        { label: 'examples.tsx', load: async () => (await import('./examples.tsx?raw')).default },
        { label: 'checkout.d.ts', load: async () => (await import('../../parla/namespaces/checkout.d.ts?raw')).default },
      ]}
    />
  );
}
