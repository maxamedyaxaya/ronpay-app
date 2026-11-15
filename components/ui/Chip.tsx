import { Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/cn';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

/** Small round filter button. The pressable area is 44px tall even though the pill looks smaller. */
export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="min-h-touch justify-center active:opacity-80"
    >
      <View className={cn('rounded-full border px-3.5 py-2', selected ? 'border-primary bg-primary' : 'border-border bg-surface')}>
        <Text className={cn('font-sans-semibold text-[13px]', selected ? 'text-white' : 'text-muted')}>{label}</Text>
      </View>
    </Pressable>
  );
}
