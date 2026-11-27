import { useLocale, useParla } from '@parlajs/react';

import { catalogSources, typesSource } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { SelectDemo } from './Demo.js';

export function Page() {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.select.title()}
      intro={t.shell.pages.select.intro()}
      sources={[
        { label: 'Demo.tsx', load: async () => (await import('./Demo.tsx?raw')).default },
        typesSource('select'),
        ...catalogSources('select', locale),
      ]}
    >
      <SelectDemo />
    </Scenario>
  );
}
