import type { ReactNode } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/lib/theme';

/** "ACCOUNT & SECURITY" label + a rounded box that holds ListRows. */
export function ListGroup({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <View className={cn('gap-2', className)}>
      {title ? (
        <Text className="px-1 font-sans-bold text-[11px] uppercase tracking-widest text-muted" accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-3xl border border-border bg-surface">{children}</View>
    </View>
  );
}

export type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  onPress?: () => void;
  /** Custom element on the right; a chevron is shown by default when the row is pressable. */
  right?: ReactNode;
  divider?: boolean;
};

/** One line in a settings list. */
export function ListRow({ title, subtitle, icon: Icon, onPress, right, divider = true }: ListRowProps) {
  const body = (
    <>
      {Icon ? (
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-border/60">
          <Icon size={17} color={colors.muted} />
        </View>
      ) : null}
      <View className="flex-1 gap-0.5">
        <Text className="font-sans-semibold text-[15px] text-ink">{title}</Text>
        {subtitle ? <Text className="font-sans text-xs text-muted">{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <ChevronRight size={18} color={colors.muted} /> : null)}
    </>
  );
  const rowClass = cn('min-h-[56px] flex-row items-center gap-3 px-4 py-3', divider && 'border-b border-border');

  if (!onPress) return <View className={rowClass}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, subtitle].filter(Boolean).join(', ')}
      className={cn(rowClass, 'active:bg-border/40')}
    >
      {body}
    </Pressable>
  );
}

export type ToggleRowProps = Omit<ListRowProps, 'onPress' | 'right'> & {
  value: boolean;
  onValueChange: (v: boolean) => void;
};

/** A ListRow with an on/off switch. */
export function ToggleRow({ value, onValueChange, ...row }: ToggleRowProps) {
  return (
    <ListRow
      {...row}
      right={
        <Switch
          value={value}
          onValueChange={onValueChange}
          accessibilityLabel={row.title}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.white}
        />
      }
    />
  );
}
