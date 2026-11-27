import { useLocale, useParla } from '@parlajs/react';
import type { ReactNode } from 'react';

import { catalogSources, fileSource, typesSource } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { TypedPropsDemo } from './Demo.js';

export function Page(): ReactNode {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.typedProps.title()}
      intro={t.shell.pages.typedProps.intro()}
      sources={[
        fileSource('Demo.tsx', async () => import('./Demo.tsx?raw')),
        typesSource('checkout'),
        ...catalogSources('checkout', locale),
        ...catalogSources('account', locale),
      ]}
    >
      <TypedPropsDemo />
    </Scenario>
  );
}
