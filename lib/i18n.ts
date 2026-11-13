import { format, getStrings, type Lang } from '../i18n';

export { format };

// The member's language will come from their profile/settings later (Zustand store, step 4).
const currentLang: Lang = 'en';

export function useStrings() {
  return getStrings(currentLang);
}

export function useLang(): Lang {
  return currentLang;
}
