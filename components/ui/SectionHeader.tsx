import { Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/cn';

export type SectionHeaderProps = {
  title: string;
  /** Small muted text after the title, e.g. "2 active". */
  note?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

/** "My packages · 2 active ……… See all" */
export function SectionHeader({ title, note, actionLabel, onAction, className }: SectionHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between', className)}>
      {/* Two separate Texts (not nested): nested Text with mixed sizes clips descenders on Android. */}
      <View className="flex-1 flex-row items-end" accessible accessibilityRole="header">
        <Text className="pb-1 font-sans-bold text-[17px] text-ink">{title}</Text>
        {note ? <Text className="pb-1 font-sans-medium text-sm text-muted">{` · ${note}`}</Text> : null}
      </View>
      {actionLabel && (
        <Pressable
          onPress={onAction}
          accessibilityRole="link"
          hitSlop={12}
          className="min-h-touch justify-center"
        >
          <Text className="font-sans-semibold text-sm text-blue">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
