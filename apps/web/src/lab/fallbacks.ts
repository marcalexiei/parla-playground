// Shared by `parla.config.ts` and the fallbacks demo, so the badges follow Parla's chain.
export const localeFallbacks: Record<string, Array<string>> = { fur: ['it'] };

/** Parla's chain: the locale, its explicit fallbacks, its base language, then English. */
export const fallbackChain = (locale: string): Array<string> => [
  ...new Set([locale, ...(localeFallbacks[locale] ?? []), locale.split('-')[0] ?? locale, 'en']),
];
