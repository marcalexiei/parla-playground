import { useLocale, useParla } from '@parlajs/react';

import { catalogSources } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { FormattingDemo } from './Demo.js';

export function Page() {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.formatting.title()}
      intro={t.shell.pages.formatting.intro()}
      sources={[
        { label: 'Demo.tsx', load: async () => (await import('./Demo.tsx?raw')).default },
        { label: 'parla.tsx', load: async () => (await import('../../parla.tsx?raw')).default },
        ...catalogSources('formatting', locale),
      ]}
    >
      <FormattingDemo />
    </Scenario>
  );
}
