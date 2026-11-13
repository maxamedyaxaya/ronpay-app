import { Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/lib/theme';

export type ActivityTone = 'blue' | 'gold' | 'violet' | 'success' | 'danger';

const tones: Record<ActivityTone, { box: string; color: string }> = {
  blue: { box: 'bg-blue/15', color: colors.blue },
  gold: { box: 'bg-gold/15', color: colors.gold },
  violet: { box: 'bg-violet/20', color: colors.violet },
  success: { box: 'bg-success/15', color: colors.success },
  danger: { box: 'bg-danger/15', color: colors.danger },
};

export type ActivityRowProps = {
  icon: LucideIcon;
  tone?: ActivityTone;
  title: string;
  subtitle?: string;
  /** Already formatted, with sign: "+$0.05" or "-$10.00". */
  amount: string;
  /** Money in shows green; money out shows in normal text color. */
  direction: 'in' | 'out';
  /** Draws the divider under the row (off for the last row). */
  divider?: boolean;
};

/** One line in a transaction / activity list. */
export function ActivityRow({ icon: Icon, tone = 'blue', title, subtitle, amount, direction, divider = true }: ActivityRowProps) {
  const t = tones[tone];
  return (
    <View
      className={cn('flex-row items-center gap-3 py-3.5', divider && 'border-b border-border')}
      accessible
      accessibilityLabel={[title, subtitle, amount].filter(Boolean).join(', ')}
    >
      <View className={cn('h-10 w-10 items-center justify-center rounded-xl', t.box)}>
        <Icon size={18} color={t.color} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-sans-semibold text-[15px] text-ink" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text className="font-sans text-[13px] text-muted" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      <Text className={cn('font-sans-bold text-[15px]', direction === 'in' ? 'text-success' : 'text-ink')}>{amount}</Text>
    </View>
  );
}
