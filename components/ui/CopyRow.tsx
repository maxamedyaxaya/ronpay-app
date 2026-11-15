import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Check, Copy } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { format, useStrings } from '@/lib/i18n';
import { colors } from '@/lib/theme';

export type CopyRowProps = { label: string; value: string; mono?: boolean; divider?: boolean; numberOfLines?: number };

/** A label + value line with a Copy button (spaces are removed from what is copied). */
export function CopyRow({ label, value, mono, divider = true, numberOfLines }: CopyRowProps) {
  const s = useStrings();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <View className={cn('flex-row items-center gap-3 py-2.5', divider && 'border-b border-border')}>
      <View className="flex-1">
        <Text className="font-sans text-[11px] text-muted">{label}</Text>
        <Text className={cn('text-[15px] text-ink', mono ? 'font-mono-bold tracking-wider' : 'font-sans-bold')} numberOfLines={numberOfLines}>
          {value}
        </Text>
      </View>
      <Pressable
        onPress={() => {
          void Clipboard.setStringAsync(value.replace(/\s/g, ''));
          setCopied(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={format(s.common.copyValue, { label })}
        className="min-h-touch justify-center"
      >
        <View className="flex-row items-center gap-1.5 rounded-xl bg-border px-3 py-1.5">
          {copied ? <Check size={14} color={colors.success} /> : <Copy size={14} color={colors.ink} />}
          <Text className={cn('font-sans-semibold text-xs', copied ? 'text-success' : 'text-ink')}>
            {copied ? s.common.copied : s.common.copy}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
