import { Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/lib/theme';

export type StatTone = 'blue' | 'violet' | 'success' | 'gold';

const tones: Record<StatTone, { box: string; value: string; color: string }> = {
  blue: { box: 'bg-blue/15', value: 'text-ink', color: colors.blue },
  violet: { box: 'bg-violet/20', value: 'text-ink', color: colors.violet },
  success: { box: 'bg-success/15', value: 'text-success', color: colors.success },
  gold: { box: 'bg-gold/15', value: 'text-ink', color: colors.gold },
};

export type StatBoxProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: StatTone;
  className?: string;
};

export function StatBox({ label, value, icon: Icon, tone = 'blue', className }: StatBoxProps) {
  const t = tones[tone];
  return (
    <View
      className={cn('flex-1 rounded-3xl border border-border bg-surface p-4', className)}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <View className={cn('h-9 w-9 items-center justify-center rounded-xl', t.box)}>
        <Icon size={17} color={t.color} />
      </View>
      <Text className="mt-4 font-sans text-[13px] text-muted" numberOfLines={1}>
        {label}
      </Text>
      <Text className={cn('mt-0.5 font-sans-extrabold text-[22px]', t.value)}>{value}</Text>
    </View>
  );
}
