/** Joins class names, skipping empty values: cn('p-4', active && 'bg-primary'). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
