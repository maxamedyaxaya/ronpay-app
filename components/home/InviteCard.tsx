import { Pressable, Text, View } from 'react-native';
import { QrCode, Share2 } from 'lucide-react-native';

import { Button } from '@/components/ui';
import { useStrings } from '@/lib/i18n';

export type InviteCardProps = {
  reward: string;
  onShare?: () => void;
  onShowQr?: () => void;
  onMyTeam?: () => void;
};

export function InviteCard({ reward, onShare, onShowQr, onMyTeam }: InviteCardProps) {
  const s = useStrings();
  return (
    <View className="rounded-3xl border border-border bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-bold text-base text-ink" accessibilityRole="header">
          {s.home.inviteTitle}
        </Text>
        <Pressable onPress={onMyTeam} accessibilityRole="link" hitSlop={12} className="min-h-touch justify-center">
          <Text className="font-sans-semibold text-sm text-blue">{s.home.myTeam}</Text>
        </Pressable>
      </View>

      <View className="mt-1 flex-row items-center gap-4 rounded-2xl border border-success/30 bg-success/10 px-4 py-3.5">
        <Text className="font-sans-extrabold text-[22px] text-success">{reward}</Text>
        <Text className="flex-1 font-sans text-[13px] leading-[18px] text-ink/85">{s.home.inviteBody}</Text>
      </View>

      <View className="mt-4 flex-row gap-3">
        <Button label={s.home.shareLink} icon={Share2} className="flex-1" onPress={onShare} />
        <Button label={s.home.showQr} icon={QrCode} variant="outline" className="flex-1" onPress={onShowQr} />
      </View>
    </View>
  );
}
