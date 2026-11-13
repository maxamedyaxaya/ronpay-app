import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { colors, type ColorToken, type TierKey } from '@/lib/theme';

/** Pointy-top hexagon in a 100×100 box. The hexagon is the brand shape. */
const OUTER = '50,3 92,27 92,73 50,97 8,73 8,27';
const INNER = '50,30 67,40 67,60 50,70 33,60 33,40';
const INNER_LARGE = '50,22 74,36 74,64 50,78 26,64 26,36';

export type HexVariant =
  /** Package badge: tier-colored outline with a small filled hexagon inside. */
  | 'tier'
  /** Solid hexagon (a claimed reward day, a medal). */
  | 'filled'
  /** Outline with a soft tint (today's reward day). */
  | 'outline'
  /** Dim outline (a future or missed day). */
  | 'empty'
  /** Thin colored outline only, for large background decoration. */
  | 'line';

export type HexBadgeProps = {
  /** A package tier color… */
  tier?: TierKey;
  /** …or any token color. Ignored when `tier` is set. */
  tone?: ColorToken;
  variant?: HexVariant;
  size?: number;
  /** Optional content centered on the hexagon (an icon or a short number). */
  children?: ReactNode;
  accessibilityLabel?: string;
};

export function HexBadge({
  tier,
  tone = 'blue',
  variant = 'tier',
  size = 40,
  children,
  accessibilityLabel,
}: HexBadgeProps) {
  const color = tier ? colors.tier[tier] : colors[tone];

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        {variant === 'tier' && (
          <>
            <Polygon points={OUTER} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={7} strokeLinejoin="round" />
            {!children && <Polygon points={INNER} fill={color} />}
          </>
        )}
        {variant === 'filled' && <Polygon points={OUTER} fill={color} stroke={color} strokeWidth={4} strokeLinejoin="round" />}
        {variant === 'outline' && (
          <Polygon points={OUTER} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={6} strokeLinejoin="round" />
        )}
        {variant === 'line' && (
          <>
            <Polygon points={OUTER} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
            <Polygon points={INNER_LARGE} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
          </>
        )}
        {variant === 'empty' && (
          <Polygon points={OUTER} fill={colors.surface} stroke={colors.border} strokeWidth={6} strokeLinejoin="round" />
        )}
      </Svg>
      {children}
    </View>
  );
}
