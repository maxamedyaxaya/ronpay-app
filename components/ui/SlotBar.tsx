import { Text, View } from 'react-native';

import { cn } from '@/lib/cn';
import type { TierKey } from '@/lib/theme';

/** Static class strings so Tailwind keeps them. */
const fill: Record<TierKey, { bg: string; text: string }> = {
  bronze: { bg: 'bg-tier-bronze', text: 'text-tier-bronze' },
  silver: { bg: 'bg-tier-silver', text: 'text-tier-silver' },
  gold: { bg: 'bg-tier-gold', text: 'text-tier-gold' },
  platinum: { bg: 'bg-tier-platinum', text: 'text-tier-platinum' },
  diamond: { bg: 'bg-tier-diamond', text: 'text-tier-diamond' },
  royal: { bg: 'bg-tier-royal', text: 'text-tier-royal' },
};

export type SlotBarProps = {
  tier: TierKey;
  /** Slots already used by buyers through this package link. */
  used: number;
  /** Total slots on the link (admin setting, 5 by default). */
  total: number;
  /** e.g. "Package link slots". */
  label: string;
  /** e.g. "2 left", or "Full" when no slots are left. */
  status: string;
  className?: string;
};

/** "Package link slots  3 / 5 · 2 left" with one segment per slot. */
export function SlotBar({ tier, used, total, label, status, className }: SlotBarProps) {
  const full = used >= total;
  return (
    <View className={cn('gap-2', className)} accessible accessibilityLabel={`${label}, ${used} / ${total}, ${status}`}>
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-medium text-xs text-muted">{label}</Text>
        <Text className="font-sans-bold text-xs text-ink">
          {used} / {total}
          <Text className="text-muted"> · </Text>
          <Text className={full ? 'text-success' : fill[tier].text}>{status}</Text>
        </Text>
      </View>
      <View className="flex-row gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <View key={i} className={cn('h-1.5 flex-1 rounded-full', i < used ? fill[tier].bg : 'bg-border')} />
        ))}
      </View>
    </View>
  );
}
