import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HexBadge } from '@/components/ui';
import { useStrings } from '@/lib/i18n';

/** Temporary tab content until the screen is built in step 4. */
export function ComingSoon({ title }: { title: string }) {
  const s = useStrings();
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-4 pt-3">
        <Text className="font-sans-extrabold text-[28px] text-ink" accessibilityRole="header">
          {title}
        </Text>
      </View>
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <HexBadge tone="blue" variant="outline" size={64} />
        <Text className="text-center font-sans text-sm text-muted">{s.common.comingSoon}</Text>
      </View>
    </SafeAreaView>
  );
}
