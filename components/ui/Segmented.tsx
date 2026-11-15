import { Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/cn';

export type SegmentOption<K extends string> = { key: K; label: string; accessibilityLabel?: string };

export type SegmentedProps<K extends string> = {
  options: SegmentOption<K>[];
  value: K;
  onChange: (key: K) => void;
  /** `sm` is the compact version used inside list rows (e.g. EN / SO). */
  size?: 'md' | 'sm';
  className?: string;
};

/** A row of options where exactly one is chosen (filters, periods, language). */
export function Segmented<K extends string>({ options, value, onChange, size = 'md', className }: SegmentedProps<K>) {
  return (
    <View
      accessibilityRole="tablist"
      className={cn('flex-row rounded-2xl border border-border bg-surface p-1', size === 'sm' && 'rounded-xl', className)}
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.accessibilityLabel ?? o.label}
            className={cn(
              'min-h-touch items-center justify-center rounded-xl',
              size === 'md' ? 'flex-1 px-2' : 'min-w-touch px-3',
              active ? 'bg-primary' : 'active:bg-border/50',
            )}
          >
            <Text
              numberOfLines={1}
              className={cn('font-sans-semibold', size === 'md' ? 'text-[13px]' : 'text-xs', active ? 'text-white' : 'text-muted')}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
