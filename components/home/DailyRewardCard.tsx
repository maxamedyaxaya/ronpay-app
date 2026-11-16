import { Text, View } from 'react-native';
import { Gift } from 'lucide-react-native';

import { Button, HexBadge } from '@/components/ui';
import { cn } from '@/lib/cn';
import { format, useStrings } from '@/lib/i18n';
import { colors } from '@/lib/theme';

export type DailyRewardCardProps = {
  weeklyTotal: string;
  dailyAmount: string;
  /** 0 = Monday … 6 = Sunday. */
  todayIndex: number;
  claimedToday: boolean;
  /** Days of this week already claimed (0–6). */
  claimedDays: number[];
  /** False when the member has no active package (CLAUDE.md §4.6). */
  canClaim: boolean;
  claiming?: boolean;
  onClaim?: () => void;
};

export function DailyRewardCard({
  weeklyTotal,
  dailyAmount,
  todayIndex,
  claimedToday,
  claimedDays,
  canClaim,
  claiming,
  onClaim,
}: DailyRewardCardProps) {
  const s = useStrings();
  const days = Object.values(s.daysShort);

  return (
    <View className="rounded-3xl border border-border bg-surface p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-gold/15">
          <Gift size={20} color={colors.gold} />
        </View>
        <View className="flex-1">
          <Text className="font-sans-bold text-[17px] text-ink">{s.home.dailyReward}</Text>
          <Text className="font-sans text-[13px] text-muted">{format(s.home.weeklyReward, { amount: weeklyTotal })}</Text>
        </View>
        <Text className="font-sans-bold text-sm text-ink">{format(s.home.dayOf, { day: todayIndex + 1 })}</Text>
      </View>

      <View className="mt-4 flex-row justify-between px-1">
        {days.map((d, i) => {
          const done = claimedDays.includes(i);
          const today = i === todayIndex && !claimedToday;
          return (
            <View key={d} className="items-center gap-1.5">
              <HexBadge tone={done || today ? 'gold' : 'blue'} variant={done ? 'filled' : today ? 'outline' : 'empty'} size={34} />
              <Text
                className={cn(
                  'text-xs',
                  done || today ? 'font-sans-semibold text-gold' : 'font-sans text-muted',
                )}
              >
                {d}
              </Text>
            </View>
          );
        })}
      </View>

      <Button
        label={claimedToday ? s.home.claimed : canClaim ? format(s.home.claim, { amount: dailyAmount }) : s.home.claimNeedsPackage}
        variant="gold"
        disabled={claimedToday || !canClaim}
        loading={claiming}
        onPress={onClaim}
        fullWidth
        className="mt-4"
      />
    </View>
  );
}
