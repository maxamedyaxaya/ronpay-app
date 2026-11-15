import { useState } from 'react';
import { LayoutAnimation, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button, PackageCard, ScreenHeader } from '@/components/ui';
import { format, useStrings } from '@/lib/i18n';
import { formatUsd, percentOf } from '@/lib/money';
import { sampleCatalog, sampleOwned, sampleSettings } from '@/lib/sample-tabs';
import type { TierKey } from '@/lib/theme';

// Design reference: docs/RoonPay-UI-Design-v1.1.pdf, page 10 (left), updated for the
// package-link rule in CLAUDE.md §4.5.2. Data is temporary (lib/sample-tabs.ts).
export default function PackagesScreen() {
  const s = useStrings();
  const router = useRouter();
  const { packageLinkRewardPercent: percent, packageLinkSlots: slots } = sampleSettings;
  const [selected, setSelected] = useState<TierKey>('platinum');
  const owned = new Set(sampleOwned.map((p) => p.tier));

  const chosen = sampleCatalog.find((p) => p.tier === selected) ?? sampleCatalog[0];
  const chosenPerSale = percentOf(chosen.price, percent);

  const info = [
    { label: s.packages.infoSlots, value: format(s.packages.infoSlotsValue, { slots }) },
    { label: s.packages.infoReward, value: format(s.packages.infoRewardValue, { percent }) },
    { label: s.packages.infoPaid, value: s.packages.infoPaidValue },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-4 pb-6 pt-3" showsVerticalScrollIndicator={false}>
        <ScreenHeader title={s.tabs.packages} subtitle={format(s.packages.subtitle, { slots })} />

        <View className="flex-row gap-2.5">
          {info.map((i) => (
            <View key={i.label} className="flex-1 rounded-2xl border border-border bg-surface px-3 py-2.5" accessible>
              <Text className="font-sans text-[11px] text-muted">{i.label}</Text>
              <Text className="mt-0.5 font-sans-bold text-[13px] text-ink" numberOfLines={1}>
                {i.value}
              </Text>
            </View>
          ))}
        </View>

        <View className="gap-2.5">
          {sampleCatalog.map((p) => {
            const perSale = percentOf(p.price, percent);
            return (
              <PackageCard
                key={p.tier}
                tier={p.tier}
                name={s.tiers[p.tier]}
                price={formatUsd(p.price, { whole: true })}
                subtitle={format(s.packages.perSale, { amount: formatUsd(perSale) })}
                activeLabel={owned.has(p.tier) ? s.status.active : undefined}
                selected={selected === p.tier}
                details={[
                  { label: s.packageDetail.perSale, value: formatUsd(perSale) },
                  { label: s.home.maxTotalLabel, value: formatUsd(perSale * BigInt(slots)) },
                ]}
                slotsPreview={{ count: slots, label: format(s.packages.slotsPreview, { slots }) }}
                onPress={() => {
                  if (selected === p.tier) return;
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setSelected(p.tier);
                }}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Summary of the chosen package, always visible above the tab bar. */}
      <View className="flex-row items-center gap-3 border-t border-border bg-bg px-4 py-3">
        <View className="flex-1">
          <Text className="font-sans text-xs text-muted">
            {format(s.packages.footerTitle, { name: s.tiers[chosen.tier], slots })}
          </Text>
          <Text className="font-sans-semibold text-[13px] text-ink">
            {format(s.packages.footerBody, { amount: formatUsd(chosenPerSale * BigInt(slots)) })}
          </Text>
        </View>
        <Button
          label={format(s.packages.buy, { price: formatUsd(chosen.price, { whole: true }) })}
          onPress={() => router.push({ pathname: '/checkout', params: { tier: chosen.tier } })}
        />
      </View>
    </SafeAreaView>
  );
}
