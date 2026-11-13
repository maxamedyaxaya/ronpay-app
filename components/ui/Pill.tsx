import { Text, View } from 'react-native';

import { cn } from '@/lib/cn';

export type PillTone = 'success' | 'gold' | 'danger' | 'blue' | 'violet' | 'muted';

const tones: Record<PillTone, { box: string; text: string }> = {
  success: { box: 'bg-success/15', text: 'text-success' },
  gold: { box: 'bg-gold/15', text: 'text-gold' },
  danger: { box: 'bg-danger/15', text: 'text-danger' },
  blue: { box: 'bg-blue/15', text: 'text-blue' },
  violet: { box: 'bg-violet/20', text: 'text-violet' },
  muted: { box: 'bg-border', text: 'text-muted' },
};

/** The tone each status uses everywhere (deposits, withdrawals, packages). */
export const statusTone = {
  active: 'success',
  pending: 'gold',
  approved: 'blue',
  rejected: 'danger',
  paid: 'success',
} as const satisfies Record<string, PillTone>;

export type PillProps = {
  label: string;
  tone?: PillTone;
  size?: 'md' | 'sm';
  className?: string;
};

export function Pill({ label, tone = 'muted', size = 'md', className }: PillProps) {
  const t = tones[tone];
  return (
    <View
      className={cn(
        'self-start rounded-full',
        size === 'md' ? 'px-3 py-1' : 'px-2 py-0.5',
        t.box,
        className,
      )}
    >
      <Text className={cn('font-sans-semibold', size === 'md' ? 'text-xs' : 'text-[10px]', t.text)}>
        {label}
      </Text>
    </View>
  );
}
