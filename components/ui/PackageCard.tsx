import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { cn } from '@/lib/cn';
import { colors, withAlpha, type TierKey } from '@/lib/theme';

import { HexBadge } from './HexBadge';
import { HexPattern } from './HexPattern';
import { Pill } from './Pill';
import { SlotBar } from './SlotBar';

/** Tier-tinted border and price color (static strings so Tailwind keeps them). */
const tierClass: Record<TierKey, { border: string; strong: string; text: string; fill: string }> = {
  bronze: { border: 'border-tier-bronze/60', strong: 'border-tier-bronze', text: 'text-tier-bronze', fill: 'bg-tier-bronze' },
  silver: { border: 'border-tier-silver/60', strong: 'border-tier-silver', text: 'text-tier-silver', fill: 'bg-tier-silver' },
  gold: { border: 'border-tier-gold/60', strong: 'border-tier-gold', text: 'text-tier-gold', fill: 'bg-tier-gold' },
  platinum: { border: 'border-tier-platinum/60', strong: 'border-tier-platinum', text: 'text-tier-platinum', fill: 'bg-tier-platinum' },
  diamond: { border: 'border-tier-diamond/60', strong: 'border-tier-diamond', text: 'text-tier-diamond', fill: 'bg-tier-diamond' },
  royal: { border: 'border-tier-royal/60', strong: 'border-tier-royal', text: 'text-tier-royal', fill: 'bg-tier-royal' },
};

export type PackageCardProps = {
  tier: TierKey;
  name: string;
  /** Row variant: small line under the name. */
  subtitle?: string;
  /** Formatted price (e.g. "$25"). */
  price?: string;
  /** Owned variant: label above the price ("Price"). */
  priceLabel?: string;
  /** Owned variant: package-link reward per referral, e.g. { label: "Per referral", value: "$4.00" }. */
  reward?: { label: string; value: string };
  /** Owned variant: the most the link can earn (reward × slots), e.g. { label: "Up to", value: "$20.00" }. */
  maxTotal?: { label: string; value: string };
  /** Label for the Active pill; omit to hide it. */
  activeLabel?: string;
  /** Owned variant: package-link slots (CLAUDE.md §4.5.2). */
  slots?: { used: number; total: number; label: string; status: string };
  selected?: boolean;
  /** Row variant: facts shown only while the row is selected (e.g. per sale, up to). */
  details?: { label: string; value: string }[];
  /** Row variant: number of link slots, drawn as hexagons while selected. */
  slotsPreview?: { count: number; label: string };
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

/**
 * Owned card height follows its width (a little wider than tall-ish, like a bank card),
 * never below what the content needs. The "Buy another package" card uses the same value.
 */
export function ownedCardHeight(width?: number) {
  return Math.max(176, Math.round((width ?? 320) * 0.58));
}

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
  reward,
  maxTotal,
  priceLabel,
  activeLabel,
  slots,
  selected = false,
  details,
  slotsPreview,
  onPress,
  variant = 'row',
  width,
  className,
}: PackageCardProps) {
  const tierColor = colors.tier[tier];

  if (variant === 'owned') {
    const a11y = [
      name,
      price,
      reward && `${reward.label} ${reward.value}`,
      maxTotal && `${maxTotal.label} ${maxTotal.value}`,
      activeLabel,
    ]
      .filter(Boolean)
      .join(', ');
    const stats = [reward, maxTotal].filter((x): x is { label: string; value: string } => Boolean(x));
    return (
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={a11y}
        // Size comes from the slider width at runtime, so it can't be a className.
        style={{ width, height: ownedCardHeight(width) }}
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
        {/* Kept to the top-right corner so its lines never cross the numbers or slot text. */}
        <View className="absolute right-0 top-0 h-24 w-44 overflow-hidden" pointerEvents="none">
          <View className="absolute -bottom-6 -right-16">
            <HexPattern width={200} height={200} color={tierColor} opacity={0.2} highlight />
          </View>
        </View>
        {width ? <Shine width={width} /> : null}

        <View className="flex-1 justify-between p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center">
              <View className="absolute -left-6 -top-6" pointerEvents="none">
                <Glow id={`glow-${tier}`} color={tierColor} size={92} />
              </View>
              <HexBadge tier={tier} size={44} />
            </View>
            <Text className="flex-1 font-sans-extrabold text-xl text-ink" numberOfLines={1}>
              {name}
            </Text>
            {activeLabel && (
              <View className="flex-row items-center gap-1.5 self-start rounded-full border border-success/30 bg-bg px-2.5 py-1">
                <View className="h-1.5 w-1.5 rounded-full bg-success" />
                <Text className="font-sans-semibold text-xs text-success">{activeLabel}</Text>
              </View>
            )}
          </View>

          {/* Price, reward per referral and the most the link can earn. */}
          <View className="flex-row items-end gap-4">
            {price && (
              <View>
                {priceLabel && <Text className="font-sans-medium text-[10px] uppercase tracking-wider text-muted">{priceLabel}</Text>}
                <Text className={cn('font-sans-extrabold text-[22px]', tierClass[tier].text)}>{price}</Text>
              </View>
            )}
            {stats.map((st) => (
              <View key={st.label} className="border-l border-border pb-1 pl-4">
                <Text className="font-sans-medium text-[10px] uppercase tracking-wider text-muted" numberOfLines={1}>
                  {st.label}
                </Text>
                <Text className="font-sans-bold text-[15px] text-ink">{st.value}</Text>
              </View>
            ))}
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

  return (
    <RowCard
      tier={tier}
      name={name}
      subtitle={subtitle}
      price={price}
      activeLabel={activeLabel}
      selected={selected}
      details={details}
      slotsPreview={slotsPreview}
      onPress={onPress}
      className={className}
    />
  );
}

type RowCardProps = Pick<
  PackageCardProps,
  'tier' | 'name' | 'subtitle' | 'price' | 'activeLabel' | 'selected' | 'details' | 'slotsPreview' | 'onPress' | 'className'
>;

/** One package in the Packages list. When selected it grows into a tier-colored card with details. */
function RowCard({ tier, name, subtitle, price, activeLabel, selected = false, details, slotsPreview, onPress, className }: RowCardProps) {
  const tierColor = colors.tier[tier];
  const [width, setWidth] = useState(0);
  const extra = selected && details ? details.map((d) => `${d.label} ${d.value}`) : [];
  const a11y = [name, price, subtitle, activeLabel, ...extra].filter(Boolean).join(', ');

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'radio' : undefined}
      accessibilityState={{ selected }}
      accessibilityLabel={a11y}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      className={cn(
        'overflow-hidden rounded-2xl bg-surface active:opacity-90',
        selected ? cn('border-2', tierClass[tier].strong) : 'border border-border',
        className,
      )}
    >
      {/* Tier light: a faint edge normally, a full wash when selected. */}
      {selected ? (
        <LinearGradient
          colors={[withAlpha(tierColor, 0.3), withAlpha(tierColor, 0.08), withAlpha(colors.bg, 0.3)]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : (
        <LinearGradient
          colors={[withAlpha(tierColor, 0.16), withAlpha(tierColor, 0)]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.5, y: 0.5 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {selected && (
        <View className="absolute right-0 top-0 h-24 w-40 overflow-hidden" pointerEvents="none">
          <View className="absolute -bottom-8 -right-16">
            <HexPattern width={190} height={190} color={tierColor} opacity={0.1} highlight />
          </View>
        </View>
      )}
      {selected && width > 0 ? <Shine width={width} /> : null}

      <View className={cn('min-h-touch flex-row items-center gap-3 px-3.5', selected ? 'pb-2.5 pt-3.5' : 'py-3')}>
        <View className="items-center justify-center">
          {selected && (
            <View className="absolute" pointerEvents="none">
              <Glow id={`row-glow-${tier}`} color={tierColor} size={88} />
            </View>
          )}
          <HexBadge tier={tier} size={selected ? 46 : 38} />
        </View>
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2">
            <Text className={cn('text-ink', selected ? 'font-sans-extrabold text-lg' : 'font-sans-bold text-[15px]')}>{name}</Text>
            {activeLabel && <Pill label={activeLabel} tone="success" size="sm" />}
          </View>
          {subtitle && !(selected && details?.length) && <Text className="font-sans text-xs text-muted">{subtitle}</Text>}
        </View>
        {price && <Text className={cn('font-sans-extrabold', selected ? 'text-[22px]' : 'text-lg', tierClass[tier].text)}>{price}</Text>}
        {selected && (
          <View className={cn('h-6 w-6 items-center justify-center rounded-full', tierClass[tier].fill)}>
            <Check size={14} color={colors.bg} strokeWidth={3} />
          </View>
        )}
      </View>

      {selected && (details?.length || slotsPreview) ? (
        <View className="gap-3 px-3.5 pb-3.5">
          {details && details.length > 0 && (
            <View className="flex-row gap-2">
              {details.map((d) => (
                <View key={d.label} className="flex-1 rounded-xl border border-border bg-bg/60 px-3 py-2">
                  <Text className="font-sans-medium text-[10px] uppercase tracking-wider text-muted" numberOfLines={1}>
                    {d.label}
                  </Text>
                  <Text className="font-sans-bold text-[15px] text-ink" numberOfLines={1}>
                    {d.value}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {slotsPreview && (
            <View className="flex-row items-center gap-1.5">
              <Text className="flex-1 font-sans-semibold text-xs text-muted">{slotsPreview.label}</Text>
              {Array.from({ length: slotsPreview.count }, (_, i) => (
                <HexBadge key={i} tier={tier} variant="outline" size={20} />
              ))}
            </View>
          )}
        </View>
      ) : null}
    </Pressable>
  );
}
