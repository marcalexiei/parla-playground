import { useLocale, useParla } from '@parlajs/react';

import { catalogSources } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { SharedPackageDemo } from './Demo.js';

export function Page() {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.sharedPackage.title()}
      intro={t.shell.pages.sharedPackage.intro()}
      sources={[
        { label: 'Demo.tsx', load: async () => (await import('./Demo.tsx?raw')).default },
        {
          label: 'packages/ui/src/index.tsx',
          load: async () => (await import('../../../../../packages/ui/src/index.tsx?raw')).default,
        },
        {
          label: 'packages/ui/parla.config.ts',
          load: async () => (await import('../../../../../packages/ui/parla.config.ts?raw')).default,
        },
        ...catalogSources('common', locale, 'ui'),
      ]}
    >
      <SharedPackageDemo />
    </Scenario>
  );
}
