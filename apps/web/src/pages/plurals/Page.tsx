import { useLocale, useParla } from '@parlajs/react';

import { catalogSources } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { PluralsDemo } from './Demo.js';

export function Page() {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.plurals.title()}
      intro={t.shell.pages.plurals.intro()}
      sources={[
        { label: 'Demo.tsx', load: async () => (await import('./Demo.tsx?raw')).default },
        ...catalogSources('plurals-icu', locale),
        ...catalogSources('plurals-mf2', locale),
      ]}
    >
      <PluralsDemo />
    </Scenario>
  );
}
