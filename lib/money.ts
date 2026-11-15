/**
 * Money helpers (CLAUDE.md §5). Amounts are whole numbers in units of $0.0001,
 * kept as `bigint`, so no floating-point math ever touches money.
 *   $0.05 = 500n · $0.0143 = 143n · $10 = 100000n
 */
export const UNITS_PER_USD = 10000n;

/** $ amount → units, for writing constants: usd(10) = 100000n. Whole dollars only. */
export function usd(dollars: number): bigint {
  if (!Number.isInteger(dollars)) throw new Error('usd() takes whole dollars; write units for cents.');
  return BigInt(dollars) * UNITS_PER_USD;
}

function groupThousands(n: bigint): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export type FormatOptions = {
  /** Show "+" for positive amounts (history lists). */
  sign?: boolean;
  /** Drop ".00" on whole dollars ("$10" for package prices). */
  whole?: boolean;
};

/**
 * 123000n → "$12.30", 143n → "$0.0143", 100000n (whole) → "$10".
 * Uses 2 decimals when the amount is whole cents, otherwise all 4.
 */
export function formatUsd(units: bigint, { sign = false, whole = false }: FormatOptions = {}): string {
  const negative = units < 0n;
  const abs = negative ? -units : units;
  const dollars = abs / UNITS_PER_USD;
  const frac = abs % UNITS_PER_USD;

  let body: string;
  if (whole && frac === 0n) body = groupThousands(dollars);
  else if (frac % 100n === 0n) body = `${groupThousands(dollars)}.${(frac / 100n).toString().padStart(2, '0')}`;
  else body = `${groupThousands(dollars)}.${frac.toString().padStart(4, '0')}`;

  const prefix = negative ? '-' : sign && units > 0n ? '+' : '';
  return `${prefix}$${body}`;
}

/**
 * What the member typed → units. "25" → 250000n, "0.5" → 5000n, "$1,000.25" → 10002500n.
 * Returns null for anything that isn't a positive amount with at most 4 decimals.
 * Text-only: never goes through a JS float.
 */
export function parseUsd(text: string): bigint | null {
  const clean = text.trim().replace(/^\$/, '').replace(/,/g, '');
  // Up to 9 digits of dollars, an optional dot, up to 4 decimals ("25", "25.", ".5", "0.0143").
  const m = /^(\d{0,9})(?:\.(\d{0,4}))?$/.exec(clean);
  if (!m || (m[1] === '' && !m[2])) return null;
  const dollars = BigInt(m[1] || '0');
  const frac = BigInt((m[2] ?? '').padEnd(4, '0'));
  const units = dollars * UNITS_PER_USD + frac;
  return units > 0n ? units : null;
}

/**
 * Package-link reward (CLAUDE.md §4.5.2): a whole-number percent of the price,
 * rounded down to whole $0.0001 units.
 */
export function percentOf(units: bigint, percent: number): bigint {
  if (!Number.isInteger(percent) || percent < 0) throw new Error('percent must be a whole number ≥ 0');
  return (units * BigInt(percent)) / 100n;
}
