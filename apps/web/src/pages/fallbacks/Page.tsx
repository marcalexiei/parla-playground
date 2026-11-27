import { useLocale, useParla } from '@parlajs/react';
import type { ReactNode } from 'react';

import { catalogSources, fileSource, textSource } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { FallbacksDemo } from './Demo.js';

// What `parla build` prints for this namespace.
const BUILD = `warning [missing-translation] fallbacks › de › shipping: using "en" (locales/de/fallbacks.json)
warning [missing-translation] fallbacks › de › returns: using "en" (locales/de/fallbacks.json)
warning [missing-translation] fallbacks › de › support: using "en" (locales/de/fallbacks.json)`;

export function Page(): ReactNode {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.fallbacks.title()}
      intro={t.shell.pages.fallbacks.intro()}
      sources={[
        fileSource('Demo.tsx', async () => import('./Demo.tsx?raw')),
        ...catalogSources('fallbacks', locale === 'en' ? 'de' : locale),
        textSource('parla build', BUILD),
      ]}
    >
      <FallbacksDemo />
    </Scenario>
  );
}
