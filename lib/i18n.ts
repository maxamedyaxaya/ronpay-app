import { en, format } from '../i18n';

export { format };

/**
 * The app is English only (CLAUDE.md). Screens still read every text through this hook,
 * so all wording stays in one file (i18n/en.ts) instead of being spread across screens.
 */
export function useStrings() {
  return en;
}
