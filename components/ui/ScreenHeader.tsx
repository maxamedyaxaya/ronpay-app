import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/lib/cn';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Optional element on the right (e.g. a button). */
  right?: ReactNode;
  className?: string;
};

/** Big screen title used at the top of every tab. */
export function ScreenHeader({ title, subtitle, right, className }: ScreenHeaderProps) {
  return (
    <View className={cn('flex-row items-center gap-3', className)}>
      <View className="flex-1 gap-0.5">
        <Text className="font-sans-extrabold text-[28px] text-ink" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text className="font-sans text-[13px] text-muted">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
