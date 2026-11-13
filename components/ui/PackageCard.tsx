import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { cn } from '@/lib/cn';
import { colors, withAlpha, type TierKey } from '@/lib/theme';

import { HexBadge } from './HexBadge';
import { HexPattern } from './HexPattern';
import { Pill } from './Pill';
import { SlotBar } from './SlotBar';

/** Tier-tinted border and price color (static strings so Tailwind keeps them). */
const tierClass: Record<TierKey, { border: string; text: string }> = {
  bronze: { border: 'border-tier-bronze/60', text: 'text-tier-bronze' },
  silver: { border: 'border-tier-silver/60', text: 'text-tier-silver' },
  gold: { border: 'border-tier-gold/60', text: 'text-tier-gold' },
  platinum: { border: 'border-tier-platinum/60', text: 'text-tier-platinum' },
  diamond: { border: 'border-tier-diamond/60', text: 'text-tier-diamond' },
  royal: { border: 'border-tier-royal/60', text: 'text-tier-royal' },
};

export type PackageCardProps = {
  tier: TierKey;
  name: string;
  /** Row variant: small line under the name. */
  subtitle?: string;
  /** Formatted price (e.g. "$25"). */
  price?: string;
  /** Owned variant: purchase date, e.g. "28 Oct". */
  date?: string;
  /** Owned variant: labels for the bottom row ("Price", "Since"). */
  priceLabel?: string;
  dateLabel?: string;
  /** Label for the Active pill; omit to hide it. */
  activeLabel?: string;
  /** Owned variant: package-link slots (CLAUDE.md §4.5.2). */
  slots?: { used: number; total: number; label: string; status: string };
  selected?: boolean;
  onPress?: () => void;
  /**
   * `row`: one line in the Packages list (tap to select).
   * `owned`: the bigger card in the Home package slider.
   */
  variant?: 'row' | 'owned';
  /** Fixed width for the `owned` card inside the Home slider. */
  width?: number;
  className?: string;
};

/** Owned card height; matches the "Buy another package" card in the Home slider. */
export const OWNED_HEIGHT = 212;

/** A soft light band that sweeps across the card every few seconds. */
function Shine({ width }: { width: number }) {
  const [x] = useState(() => new Animated.Value(-1));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(3200),
        Animated.timing(x, { toValue: -1, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [x]);

  const band = width * 0.45;
  return (
    <Animated.View
      pointerEvents="none"
      // Animated value: NativeWind can't express this, so it uses `style`.
      style={{
        position: 'absolute',
        top: -40,
        bottom: -40,
        width: band,
        transform: [{ translateX: x.interpolate({ inputRange: [-1, 1], outputRange: [-band * 1.5, width + band] }) }, { rotate: '18deg' }],
      }}
    >
      <LinearGradient
        colors={[withAlpha(colors.white, 0), withAlpha(colors.white, 0.09), withAlpha(colors.white, 0)]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

/** Round soft glow in the tier color, placed behind the badge. */
function Glow({ id, color, size }: { id: string; color: string; size: number }) {
  return (
    <Svg width={size} height={size} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={0.45} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

export function PackageCard({
  tier,
  name,
  subtitle,
  price,
  date,
  priceLabel,
  dateLabel,
  activeLabel,
  slots,
  selected = false,
  onPress,
  variant = 'row',
  width,
  className,
}: PackageCardProps) {
  const tierColor = colors.tier[tier];

  if (variant === 'owned') {
    const a11y = [name, price, date && dateLabel ? `${dateLabel} ${date}` : date, activeLabel].filter(Boolean).join(', ');
    return (
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={a11y}
        // Slider cards get a fixed width from the parent (a runtime value).
        style={width ? { width, height: OWNED_HEIGHT } : { height: OWNED_HEIGHT }}
        className={cn('overflow-hidden rounded-3xl border bg-surface active:opacity-90', tierClass[tier].border, className)}
      >
        {/* Tier-colored light from the top-left fading into the card. */}
        <LinearGradient
          colors={[withAlpha(tierColor, 0.32), withAlpha(tierColor, 0.08), withAlpha(colors.bg, 0.4)]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {/* Honeycomb in the tier color on the right. */}
        {/* Clipped above the slot bar so its lines never cross the slot text. */}
        <View className="absolute bottom-[68px] right-0 top-0 w-48 overflow-hidden" pointerEvents="none">
          <View className="absolute -bottom-6 -right-16">
            <HexPattern width={200} height={200} color={tierColor} opacity={0.2} highlight />
          </View>
        </View>
        {width ? <Shine width={width} /> : null}

        <View className="flex-1 justify-between p-5">
          <View className="flex-row items-center gap-3.5">
            <View className="h-[52px] w-[52px] items-center justify-center">
              <View className="absolute -left-6 -top-6" pointerEvents="none">
                <Glow id={`glow-${tier}`} color={tierColor} size={104} />
              </View>
              <HexBadge tier={tier} size={52} />
            </View>
            <Text className="flex-1 font-sans-extrabold text-[22px] text-ink" numberOfLines={1}>
              {name}
            </Text>
            {activeLabel && (
              <View className="flex-row items-center gap-1.5 self-start rounded-full border border-success/30 bg-bg px-2.5 py-1">
                <View className="h-1.5 w-1.5 rounded-full bg-success" />
                <Text className="font-sans-semibold text-xs text-success">{activeLabel}</Text>
              </View>
            )}
          </View>

          {/* Price and date sit on the left; the honeycomb has the right side. */}
          <View className="flex-row items-end gap-6">
            {price && (
              <View>
                {priceLabel && <Text className="font-sans-medium text-[11px] uppercase tracking-wider text-muted">{priceLabel}</Text>}
                <Text className={cn('font-sans-extrabold text-2xl', tierClass[tier].text)}>{price}</Text>
              </View>
            )}
            {date && (
              <View className="border-l border-border pb-1 pl-6">
                {dateLabel && <Text className="font-sans-medium text-[11px] uppercase tracking-wider text-muted">{dateLabel}</Text>}
                <Text className="font-sans-bold text-[15px] text-ink">{date}</Text>
              </View>
            )}
          </View>

          {slots && <SlotBar tier={tier} {...slots} />}
        </View>

        {/* Thin glowing tier line along the bottom edge. */}
        <LinearGradient
          colors={[withAlpha(tierColor, 0), tierColor, withAlpha(tierColor, 0)]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2 }}
          pointerEvents="none"
        />
      </Pressable>
    );
  }

  const a11y = [name, price, subtitle, activeLabel].filter(Boolean).join(', ');
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'radio' : undefined}
      accessibilityState={{ selected }}
      accessibilityLabel={a11y}
      className={cn(
        'min-h-touch flex-row items-center gap-3 overflow-hidden rounded-2xl border px-3.5 py-3 active:opacity-80',
        selected ? 'border-primary bg-primary/10' : 'border-border bg-surface',
        className,
      )}
    >
      {/* Faint tier light on the left edge. */}
      <LinearGradient
        colors={[withAlpha(tierColor, 0.16), withAlpha(tierColor, 0)]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0.5, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <HexBadge tier={tier} size={38} />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="font-sans-bold text-[15px] text-ink">{name}</Text>
          {activeLabel && <Pill label={activeLabel} tone="success" size="sm" />}
        </View>
        {subtitle && <Text className="font-sans text-xs text-muted">{subtitle}</Text>}
      </View>
      {price && <Text className={cn('font-sans-extrabold text-lg', tierClass[tier].text)}>{price}</Text>}
    </Pressable>
  );
}
