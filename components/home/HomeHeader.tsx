import { Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';

import { IconButton } from '@/components/ui';
import { useStrings } from '@/lib/i18n';
import { colors } from '@/lib/theme';

export type HomeHeaderProps = {
  initials: string;
  name: string;
  unread: boolean;
  onNotifications?: () => void;
};

export function HomeHeader({ initials, name, unread, onNotifications }: HomeHeaderProps) {
  const s = useStrings();

  return (
    <View className="flex-row items-center gap-3">
      <View className="h-[46px] w-[46px] items-center justify-center rounded-2xl bg-border" accessibilityElementsHidden>
        <Text className="font-sans-bold text-[15px] text-blue">{initials}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-sans text-[13px] text-muted">{s.home.welcome}</Text>
        <Text className="font-sans-bold text-lg text-ink" numberOfLines={1}>
          {name}
        </Text>
      </View>
      <IconButton
        accessibilityLabel={unread ? s.home.notificationsUnread : s.home.notifications}
        onPress={onNotifications}
        badge={unread}
      >
        <Bell size={20} color={colors.ink} />
      </IconButton>
    </View>
  );
}
