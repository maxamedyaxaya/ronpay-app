export { en } from './en';

/** Fills `{name}` placeholders: format('Day {day} / 7', { day: 3 }) → 'Day 3 / 7'. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
