import { useLocale, useParla } from '@parlajs/react';

import { catalogSources, typesSource } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { RichTextDemo } from './Demo.js';

export function Page() {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.richText.title()}
      intro={t.shell.pages.richText.intro()}
      sources={[
        { label: 'Demo.tsx', load: async () => (await import('./Demo.tsx?raw')).default },
        { label: 'parla.tsx', load: async () => (await import('../../parla.tsx?raw')).default },
        typesSource('richText'),
        ...catalogSources('rich-text', locale),
      ]}
    >
      <RichTextDemo />
    </Scenario>
  );
}
