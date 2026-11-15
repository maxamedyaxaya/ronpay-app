import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { useStrings } from '@/lib/i18n';
import { colors } from '@/lib/theme';

import { IconButton } from './IconButton';

export type BackHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
};

/** Header for stack screens (checkout, deposit, …): back button + title. */
export function BackHeader({ title, subtitle, right, className }: BackHeaderProps) {
  const s = useStrings();
  const router = useRouter();
  return (
    <View className={cn('flex-row items-center gap-3', className)}>
      <IconButton
        accessibilityLabel={s.common.back}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      >
        <ChevronLeft size={22} color={colors.ink} />
      </IconButton>
      <View className="flex-1">
        <Text className="font-sans-extrabold text-xl text-ink" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text className="font-sans text-xs text-muted">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
