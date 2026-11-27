import type { Locale } from '@parlajs/react';

export interface Source {
  readonly label: string;
  readonly load: () => Promise<string> | string;
}

type Raw = Record<string, () => Promise<string>>;
type Load = Source['load'];

const appCatalogs: Raw = import.meta.glob<string>('../../locales/*/*.json', {
  query: '?raw',
  import: 'default',
});
const uiCatalogs: Raw = import.meta.glob<string>('../../../../packages/ui/locales/*/*.json', {
  query: '?raw',
  import: 'default',
});
const appTypes: Raw = import.meta.glob<string>('../parla/namespaces/*.d.ts', {
  query: '?raw',
  import: 'default',
});

/** A fixed text, such as command output. */
export const textSource = (label: string, text: string): Source => ({ label, load: () => text });

/** A file of this repo, imported as text when its tab opens. */
export const fileSource = (label: string, load: () => Promise<{ default: string }>): Source => ({
  label,
  load: async () => {
    const file = await load();
    return file.default;
  },
});

const pick = (files: Raw, suffix: string): Load => {
  const key = Object.keys(files).find((path) => path.endsWith(suffix));
  return key ? files[key] : textSource(suffix, `// ${suffix} not found`).load;
};

/** The English catalog and, unless it is English, the current locale's. */
export function catalogSources(
  file: string,
  locale: Locale,
  owner: 'app' | 'ui' = 'app',
): Array<Source> {
  const files = owner === 'app' ? appCatalogs : uiCatalogs;
  const locales = locale === 'en' ? ['en'] : ['en', locale];
  return locales.map((shown) => ({
    label: `${shown}/${file}.json`,
    load: pick(files, `/${shown}/${file}.json`),
  }));
}

/** What `parla build` wrote for a namespace's types. */
export const typesSource = (namespace: string): Source => ({
  label: `${namespace}.d.ts`,
  load: pick(appTypes, `/${namespace}.d.ts`),
});
