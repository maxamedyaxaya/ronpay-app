import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUpRight, Plus } from 'lucide-react-native';

import { Button, HexPattern } from '@/components/ui';
import { format, useStrings } from '@/lib/i18n';
import { colors, withAlpha } from '@/lib/theme';

export type WalletBalanceCardProps = {
  available: string;
  locked: string;
  onDeposit?: () => void;
  onWithdraw?: () => void;
};

/** Same blue → violet card as Home, with Deposit and Withdraw. */
export function WalletBalanceCard({ available, locked, onDeposit, onWithdraw }: WalletBalanceCardProps) {
  const s = useStrings();
  return (
    <View className="overflow-hidden rounded-3xl p-5">
      <LinearGradient colors={[colors.primary, colors.violet]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[withAlpha(colors.bg, 0), withAlpha(colors.bg, 0.3)]}
        start={{ x: 0.3, y: 0.3 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View className="absolute -bottom-12 -right-10" pointerEvents="none">
        <HexPattern width={170} height={170} opacity={0.15} />
      </View>

      <View accessible accessibilityLabel={`${s.home.availableBalance}: ${available}. ${format(s.wallet.locked, { amount: locked })}`}>
        <Text className="font-sans-medium text-sm text-white/90">{s.home.availableBalance}</Text>
        <View className="mt-1 flex-row items-end gap-1.5">
          <Text className="font-sans-extrabold text-[40px] leading-[48px] text-white">{available}</Text>
          <Text className="mb-2 font-sans-semibold text-sm text-white/85">{s.home.currency}</Text>
        </View>
        <Text className="font-sans text-xs text-white/80">{format(s.wallet.locked, { amount: locked })}</Text>
      </View>

      <View className="mt-5 flex-row gap-3">
        <Button label={s.home.deposit} icon={Plus} variant="light" className="flex-1" onPress={onDeposit} />
        <Button label={s.wallet.withdraw} icon={ArrowUpRight} variant="glass" className="flex-1" onPress={onWithdraw} />
      </View>
    </View>
  );
}
