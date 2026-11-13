/**
 * Token colors as JS values, for the few props that can't take a className
 * (SVG fill/stroke, lucide icon `color`, TextInput placeholderTextColor).
 * They are read from tailwind-preset.js, so there is still one source of truth.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const preset = require('../tailwind-preset') as {
  theme: { colors: Record<string, unknown> };
};

export type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'royal';

const c = preset.theme.colors as Record<string, string> & { tier: Record<TierKey, string> };

export const colors = {
  bg: c.bg,
  surface: c.surface,
  border: c.border,
  ink: c.ink,
  muted: c.muted,
  primary: c.primary,
  blue: c.blue,
  violet: c.violet,
  success: c.success,
  gold: c.gold,
  danger: c.danger,
  white: c.white,
  tier: c.tier,
};

export type ColorToken = Exclude<keyof typeof colors, 'tier'>;

/** A token color with transparency, for gradients: withAlpha(colors.gold, 0.2). */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export const TIERS: TierKey[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'royal'];
