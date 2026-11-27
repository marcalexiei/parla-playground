import { useLocale, useParla } from '@parlajs/react';

import { catalogSources } from '../../code/sources.js';
import { shell } from '../../parla/namespaces/shell.js';
import { Scenario } from '../../Scenario.js';
import { FallbacksDemo } from './Demo.js';

// What `parla build` prints for this namespace.
const BUILD = `warning [missing-translation] fallbacks › de › shipping: using "en" (locales/de/fallbacks.json)
warning [missing-translation] fallbacks › de › returns: using "en" (locales/de/fallbacks.json)
warning [missing-translation] fallbacks › de › support: using "en" (locales/de/fallbacks.json)`;

export function Page() {
  const { t } = useParla([shell]);
  const { locale } = useLocale();
  return (
    <Scenario
      title={t.shell.pages.fallbacks.title()}
      intro={t.shell.pages.fallbacks.intro()}
      sources={[
        { label: 'Demo.tsx', load: async () => (await import('./Demo.tsx?raw')).default },
        ...catalogSources('fallbacks', locale === 'en' ? 'de' : locale),
        { label: 'parla build', load: async () => BUILD },
      ]}
    >
      <FallbacksDemo />
    </Scenario>
  );
}
