import Svg, { Polygon } from 'react-native-svg';

import { colors } from '@/lib/theme';

/** Flat-top hexagon of radius 50 centred at (cx, cy). */
function hex(cx: number, cy: number, r = 50): string {
  return [0, 60, 120, 180, 240, 300]
    .map((deg) => {
      const a = (deg * Math.PI) / 180;
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    })
    .join(' ');
}

export type HexPatternProps = {
  width?: number;
  height?: number;
  opacity?: number;
  /** Outline color (a token value from lib/theme). Defaults to white. */
  color?: string;
  /** Fills one cell softly, for a little depth. */
  highlight?: boolean;
};

/** Faint honeycomb outline used as decoration (balance card, package cards). */
export function HexPattern({ width = 170, height = 170, opacity = 0.18, color = colors.white, highlight = false }: HexPatternProps) {
  const cells = [hex(60, 50), hex(135, 93), hex(135, 7), hex(210, 50), hex(60, 136), hex(210, 136), hex(135, 179)];
  return (
    <Svg width={width} height={height} viewBox="0 0 200 200" pointerEvents="none">
      {cells.map((points, i) => (
        <Polygon
          key={points}
          points={points}
          fill={highlight && i === 1 ? color : 'none'}
          fillOpacity={highlight && i === 1 ? opacity * 0.6 : 0}
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth={2.5}
        />
      ))}
    </Svg>
  );
}
