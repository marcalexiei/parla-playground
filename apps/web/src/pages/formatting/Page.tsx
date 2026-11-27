import { useLocale, useParla } from '@parlajs/react';
import type { ReactNode } from 'react';

import { catalogSources, fileSource } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { FormattingDemo } from './Demo.js';

export function Page(): ReactNode {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.formatting.title()}
      intro={t.shell.pages.formatting.intro()}
      sources={[
        fileSource('Demo.tsx', async () => import('./Demo.tsx?raw')),
        fileSource('parla.tsx', async () => import('../../parla.tsx?raw')),
        ...catalogSources('formatting', locale),
      ]}
    >
      <FormattingDemo />
    </Scenario>
  );
}
