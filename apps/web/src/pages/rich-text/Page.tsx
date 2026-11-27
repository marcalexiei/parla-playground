import { useLocale, useParla } from '@parlajs/react';
import type { ReactNode } from 'react';

import { catalogSources, fileSource, typesSource } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { RichTextDemo } from './Demo.js';

export function Page(): ReactNode {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.richText.title()}
      intro={t.shell.pages.richText.intro()}
      sources={[
        fileSource('Demo.tsx', async () => import('./Demo.tsx?raw')),
        fileSource('parla.tsx', async () => import('../../parla.tsx?raw')),
        typesSource('richText'),
        ...catalogSources('rich-text', locale),
      ]}
    >
      <RichTextDemo />
    </Scenario>
  );
}
