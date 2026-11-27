import type { Locale } from '@parlajs/react';

import { parla } from '../parla.js';
import { getLab, update, withCause } from './store.js';

// Firefox has neither `getTextInfo` nor `textInfo` yet.
const RTL = new Set(['ar', 'fa', 'he', 'ur']);

export function direction(locale: string): 'ltr' | 'rtl' {
  const tag = new Intl.Locale(locale) as Intl.Locale & {
    getTextInfo?: () => { direction: string };
    textInfo?: { direction: string };
  };
  const dir = tag.getTextInfo?.().direction ?? tag.textInfo?.direction;
  return (dir ?? (RTL.has(tag.language) ? 'rtl' : 'ltr')) === 'rtl' ? 'rtl' : 'ltr';
}

/** `locale`'s name in `inLocale`, e.g. "Deutsch" or "tedesco". */
export function localeName(locale: string, inLocale: string = locale): string {
  const name = new Intl.DisplayNames([inLocale], { type: 'language' }).of(locale) ?? locale;
  return name.charAt(0).toLocaleUpperCase(inLocale) + name.slice(1);
}

export const milliseconds = (locale: string, ms: number): string =>
  new Intl.NumberFormat(locale, { style: 'unit', unit: 'millisecond' }).format(ms);

function syncDocument(): void {
  const root = document.documentElement;
  root.lang = parla.locale;
  root.dir = direction(parla.locale);
  try {
    localStorage.setItem('locale', parla.locale);
  } catch {
    // Private mode: the choice lasts this visit only.
  }
}

/** Keeps `<html lang dir>` and the saved locale in step with Parla's. */
export function startLocaleSync(): void {
  parla.subscribe(syncDocument);
  syncDocument();
}

/** `setLocale`, with the target kept in the lab store while its chunks load. */
export async function switchLocale(locale: Locale): Promise<void> {
  update({ switching: locale === parla.locale ? null : locale });
  try {
    await withCause(`setLocale("${locale}")`, async () => parla.setLocale(locale));
  } finally {
    if (getLab().switching === locale) {
      update({ switching: null });
    }
  }
}
