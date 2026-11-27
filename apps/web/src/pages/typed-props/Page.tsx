import { useLocale, useParla } from '@parlajs/react';

import { catalogSources, typesSource } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { TypedPropsDemo } from './Demo.js';

export function Page() {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.typedProps.title()}
      intro={t.shell.pages.typedProps.intro()}
      sources={[
        { label: 'Demo.tsx', load: async () => (await import('./Demo.tsx?raw')).default },
        typesSource('checkout'),
        ...catalogSources('checkout', locale),
        ...catalogSources('account', locale),
      ]}
    >
      <TypedPropsDemo />
    </Scenario>
  );
}
