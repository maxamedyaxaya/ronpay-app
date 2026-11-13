import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, ReceiptText } from 'lucide-react-native';

import { Button, HexPattern } from '@/components/ui';
import { useStrings } from '@/lib/i18n';
import { colors, withAlpha } from '@/lib/theme';

export type BalanceCardProps = {
  available: string;
  totalEarned: string;
  totalWithdrawn: string;
  onDeposit?: () => void;
  onHistory?: () => void;
};

const HIDDEN = '••••';

/** Blue → violet gradient card at the top of Home. */
export function BalanceCard({ available, totalEarned, totalWithdrawn, onDeposit, onHistory }: BalanceCardProps) {
  const s = useStrings();
  const [hidden, setHidden] = useState(false);

  return (
    <View className="overflow-hidden rounded-3xl p-5">
      <LinearGradient
        colors={[colors.primary, colors.violet]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Darkens the bottom-right corner, so it ends in a deep purple like the design. */}
      <LinearGradient
        colors={[withAlpha(colors.bg, 0), withAlpha(colors.bg, 0.3)]}
        start={{ x: 0.3, y: 0.3 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View className="absolute -right-10 -top-10" pointerEvents="none">
        <HexPattern width={170} height={170} opacity={0.15} />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="font-sans-medium text-sm text-white/90">{s.home.availableBalance}</Text>
        <Pressable
          onPress={() => setHidden((h) => !h)}
          accessibilityRole="button"
          className="min-h-touch justify-center"
          hitSlop={6}
        >
          <View className="rounded-xl bg-white/15 px-3.5 py-1.5">
            <Text className="font-sans-semibold text-[13px] text-white">{hidden ? s.home.show : s.home.hide}</Text>
          </View>
        </Pressable>
      </View>

      <View
        className="mt-2 flex-row items-end gap-1.5"
        accessible
        accessibilityLabel={`${s.home.availableBalance}: ${hidden ? s.home.hiddenAmount : available}`}
      >
        <Text className="font-sans-extrabold text-[44px] leading-[52px] text-white">{hidden ? HIDDEN : available}</Text>
        <Text className="mb-2 font-sans-semibold text-sm text-white/85">{s.home.currency}</Text>
      </View>

      <View className="mt-4 flex-row gap-3">
        {[
          { label: s.home.totalEarned, value: totalEarned },
          { label: s.home.totalWithdrawn, value: totalWithdrawn },
        ].map((item) => (
          <View key={item.label} className="flex-1 rounded-2xl bg-bg/25 px-3.5 py-3">
            <Text className="font-sans text-xs text-white/85">{item.label}</Text>
            <Text className="mt-1 font-sans-bold text-[17px] text-white">{hidden ? HIDDEN : item.value}</Text>
          </View>
        ))}
      </View>

      <View className="mt-5 flex-row gap-3">
        <Button label={s.home.deposit} icon={Plus} variant="light" className="flex-1" onPress={onDeposit} />
        <Button label={s.home.history} icon={ReceiptText} variant="glass" className="flex-1" onPress={onHistory} />
      </View>
    </View>
  );
}
