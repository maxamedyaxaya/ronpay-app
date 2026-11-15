import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ChevronDown } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/lib/theme';

export type SelectOption<K extends string> = {
  key: K;
  label: string;
  /** Short text in the small square on the left (e.g. "Z" or "SB"). */
  badge?: string;
  /** Options with the same group are listed together under that heading. */
  group?: string;
};

export type SelectProps<K extends string> = {
  label: string;
  value: K;
  options: SelectOption<K>[];
  onChange: (key: K) => void;
  /** Title of the sheet that opens (defaults to `label`). */
  sheetTitle?: string;
  className?: string;
};

function Badge({ text, active }: { text: string; active: boolean }) {
  return (
    <View className={cn('h-8 w-8 items-center justify-center rounded-lg', active ? 'bg-success/20' : 'bg-border')}>
      <Text className={cn('font-sans-extrabold text-[11px]', active ? 'text-success' : 'text-muted')}>{text}</Text>
    </View>
  );
}

/** A field that shows the chosen option; tapping it opens a bottom sheet with the full list. */
export function Select<K extends string>({ label, value, options, onChange, sheetTitle, className }: SelectProps<K>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.key === value) ?? options[0];

  // Keep the order of first appearance for group headings.
  const groups: { title?: string; items: SelectOption<K>[] }[] = [];
  for (const o of options) {
    const g = groups.find((x) => x.title === o.group);
    if (g) g.items.push(o);
    else groups.push({ title: o.group, items: [o] });
  }

  return (
    <View className={cn('gap-1.5', className)}>
      <Text className="font-sans-semibold text-xs text-muted">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current?.label ?? ''}`}
        className="min-h-touch flex-row items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-2.5 active:opacity-80"
      >
        {current?.badge && <Badge text={current.badge} active />}
        <View className="flex-1">
          <Text className="font-sans-bold text-[15px] text-ink" numberOfLines={1}>
            {current?.label}
          </Text>
          {current?.group && <Text className="font-sans text-xs text-muted">{current.group}</Text>}
        </View>
        <ChevronDown size={18} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-black/60" onPress={() => setOpen(false)} accessibilityLabel={label} />
          <SafeAreaView edges={['bottom']} className="max-h-[80%] rounded-t-3xl border border-b-0 border-border bg-surface">
            <View className="items-center pt-2.5">
              <View className="h-1 w-10 rounded-full bg-border" />
            </View>
            <Text className="px-5 pb-2 pt-3 font-sans-bold text-[17px] text-ink" accessibilityRole="header">
              {sheetTitle ?? label}
            </Text>
            <ScrollView contentContainerClassName="gap-3 px-4 pb-4" accessibilityRole="radiogroup">
              {groups.map((g) => (
                <View key={g.title ?? '_'} className="gap-1.5">
                  {g.title && (
                    <Text className="px-1 font-sans-bold text-[11px] uppercase tracking-widest text-muted">{g.title}</Text>
                  )}
                  {g.items.map((o) => {
                    const selected = o.key === value;
                    return (
                      <Pressable
                        key={o.key}
                        onPress={() => {
                          onChange(o.key);
                          setOpen(false);
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        accessibilityLabel={o.label}
                        className={cn(
                          'min-h-touch flex-row items-center gap-3 rounded-2xl border px-3.5 py-2.5 active:opacity-80',
                          selected ? 'border-primary bg-primary/10' : 'border-border bg-bg',
                        )}
                      >
                        {o.badge && <Badge text={o.badge} active={selected} />}
                        <Text className="flex-1 font-sans-semibold text-[15px] text-ink" numberOfLines={1}>
                          {o.label}
                        </Text>
                        {selected && <Check size={18} color={colors.blue} />}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
