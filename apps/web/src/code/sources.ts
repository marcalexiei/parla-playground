import type { Locale } from '@parlajs/react';

export interface Source {
  readonly label: string;
  readonly load: () => Promise<string>;
}

type Raw = Record<string, () => Promise<string>>;

const appCatalogs: Raw = import.meta.glob<string>('../../locales/*/*.json', { query: '?raw', import: 'default' });
const uiCatalogs: Raw = import.meta.glob<string>('../../../../packages/ui/locales/*/*.json', {
  query: '?raw',
  import: 'default',
});
const appTypes: Raw = import.meta.glob<string>('../parla/namespaces/*.d.ts', { query: '?raw', import: 'default' });

const pick = (files: Raw, suffix: string): (() => Promise<string>) => {
  const key = Object.keys(files).find((k) => k.endsWith(suffix));
  return key ? (files[key] as () => Promise<string>) : async () => `// ${suffix} not found`;
};

/** The English catalog and, unless it is English, the current locale's. */
export function catalogSources(file: string, locale: Locale, owner: 'app' | 'ui' = 'app'): Array<Source> {
  const files = owner === 'app' ? appCatalogs : uiCatalogs;
  const locales = locale === 'en' ? ['en'] : ['en', locale];
  return locales.map((l) => ({ label: `${l}/${file}.json`, load: pick(files, `/${l}/${file}.json`) }));
}

/** What `parla build` wrote for a namespace's types. */
export const typesSource = (namespace: string): Source => ({
  label: `${namespace}.d.ts`,
  load: pick(appTypes, `/${namespace}.d.ts`),
});
