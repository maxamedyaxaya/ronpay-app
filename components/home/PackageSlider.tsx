import { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Plus } from 'lucide-react-native';

import { PackageCard, ownedCardHeight } from '@/components/ui';
import { cn } from '@/lib/cn';
import { format, useStrings } from '@/lib/i18n';
import { formatUsd, percentOf } from '@/lib/money';
import { colors, type TierKey } from '@/lib/theme';

export type OwnedPackage = {
  id: string;
  tier: TierKey;
  /** Price in $0.0001 units. */
  price: bigint;
  /** Package-link slots used and total (CLAUDE.md §4.5.2). */
  slotsUsed: number;
  slotsTotal: number;
};

export type PackageSliderProps = {
  packages: OwnedPackage[];
  /** Admin setting `package_link_reward_percent` (whole number). */
  rewardPercent: number;
  onBuyAnother?: () => void;
  /** Opens the package details screen. */
  onOpen?: (id: string) => void;
};

const GAP = 12;
const SIDE = 16;

/** Swipe between owned packages; the last card buys another one. */
export function PackageSlider({ packages, rewardPercent, onBuyAnother, onOpen }: PackageSliderProps) {
  const s = useStrings();
  const { width: screen } = useWindowDimensions();
  const cardWidth = Math.round((screen - SIDE * 2) * 0.82);
  const cardHeight = ownedCardHeight(cardWidth);
  const [page, setPage] = useState(0);
  const count = packages.length + 1;

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + GAP}
        decelerationRate="fast"
        contentContainerClassName="gap-3 px-4"
        onScroll={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + GAP)))}
        scrollEventThrottle={32}
        className="-mx-4"
      >
        {packages.map((p) => {
          const perReferral = percentOf(p.price, rewardPercent);
          return (
            <PackageCard
              key={p.id}
              variant="owned"
              width={cardWidth}
              tier={p.tier}
              name={s.tiers[p.tier]}
              price={formatUsd(p.price, { whole: true })}
              priceLabel={s.home.priceLabel}
              reward={{ label: s.home.perReferralLabel, value: formatUsd(perReferral) }}
              maxTotal={{ label: s.home.maxTotalLabel, value: formatUsd(perReferral * BigInt(p.slotsTotal)) }}
              activeLabel={s.status.active}
              onPress={onOpen ? () => onOpen(p.id) : undefined}
              slots={{
                used: p.slotsUsed,
                total: p.slotsTotal,
                label: s.home.slotsLabel,
                status:
                  p.slotsUsed >= p.slotsTotal
                    ? s.home.slotsFull
                    : format(s.home.slotsLeft, { count: p.slotsTotal - p.slotsUsed }),
              }}
            />
          );
        })}
        <Pressable
          onPress={onBuyAnother}
          accessibilityRole="button"
          accessibilityLabel={s.home.buyAnother}
          // Same runtime size as the package cards.
          style={{ width: cardWidth, height: cardHeight }}
          className="items-center justify-center gap-2 rounded-3xl border border-dashed border-border bg-surface/50 active:opacity-80"
        >
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/20">
            <Plus size={22} color={colors.blue} />
          </View>
          <Text className="font-sans-bold text-[15px] text-ink">{s.home.buyAnother}</Text>
          <Text className="font-sans text-xs text-muted">{s.home.buyAnotherBody}</Text>
        </Pressable>
      </ScrollView>

      <View className="mt-3 flex-row justify-center gap-1.5" accessibilityElementsHidden>
        {Array.from({ length: count }, (_, i) => (
          <View key={i} className={cn('h-1.5 rounded-full', i === page ? 'w-6 bg-blue' : 'w-1.5 bg-border')} />
        ))}
      </View>
    </View>
  );
}
