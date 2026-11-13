import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';

export type IconButtonProps = {
  /** Required: icon-only buttons must say what they do. */
  accessibilityLabel: string;
  onPress?: () => void;
  children: ReactNode;
  /** Small dot in the top-right corner (e.g. unread notifications). */
  badge?: boolean;
  className?: string;
};

/** Square 46×46 button used in screen headers (language, notifications, back). */
export function IconButton({ accessibilityLabel, onPress, children, badge = false, className }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'h-[46px] w-[46px] items-center justify-center rounded-2xl border border-border bg-surface active:opacity-80',
        className,
      )}
    >
      {children}
      {badge && <View className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-gold" />}
    </Pressable>
  );
}
