import { useSyncExternalStore } from 'react';

import { format, getStrings, type Lang } from '../i18n';

export { format };
export type { Lang };

// The chosen language lives in a tiny in-memory store so every screen updates
// at once. Later it is saved to the member's profile (step 3).
let currentLang: Lang = 'en';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setLang(lang: Lang) {
  if (lang === currentLang) return;
  currentLang = lang;
  listeners.forEach((l) => l());
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, () => currentLang);
}

export function useStrings() {
  return getStrings(useLang());
}
