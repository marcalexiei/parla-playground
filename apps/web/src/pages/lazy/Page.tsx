import { useLocale, useParla } from '@parlajs/react';

import { catalogSources } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { LazyDemo } from './Demo.js';

export function Page() {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.lazy.title()}
      intro={t.shell.pages.lazy.intro()}
      sources={[
        { label: 'Demo.tsx', load: async () => (await import('./Demo.tsx?raw')).default },
        { label: 'routes.ts', load: async () => (await import('../../routes.ts?raw')).default },
        { label: 'router.ts', load: async () => (await import('../../router.ts?raw')).default },
        ...catalogSources('lazy', locale),
        ...catalogSources('account', locale),
      ]}
    >
      <LazyDemo />
    </Scenario>
  );
}
