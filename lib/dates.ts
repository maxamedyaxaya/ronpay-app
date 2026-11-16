import { en, format } from '@/i18n';

/** Date display helpers. The API sends ISO strings; screens show short English labels. */

const pad = (n: number) => n.toString().padStart(2, '0');
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "14:30" */
export const timeOf = (isoText: string) => {
  const d = new Date(isoText);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** "5 Nov" */
export const shortDate = (isoText: string) => {
  const d = new Date(isoText);
  return `${d.getDate()} ${en.monthsShort[d.getMonth()]}`;
};

export const isToday = (isoText: string) => sameDay(new Date(isoText), new Date());

/** "Today, 14:30" · "Yesterday" · "5 Nov" */
export function relativeDate(isoText: string): string {
  const d = new Date(isoText);
  const now = new Date();
  if (sameDay(d, now)) return format(en.activity.today, { time: timeOf(isoText) });
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (sameDay(d, y)) return en.activity.yesterday;
  return shortDate(isoText);
}
