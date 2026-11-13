import { en, type Translations } from './en';
import { so } from './so';

export type Lang = 'en' | 'so';
export type { Translations };

export const translations: Record<Lang, Translations> = { en, so };

export function getStrings(lang: Lang): Translations {
  return translations[lang];
}

/** Fills `{name}` placeholders: format('Day {day} / 7', { day: 3 }) → 'Day 3 / 7'. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
