import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LucideIcon } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/lib/theme';

export type TabItem = {
  key: string;
  label: string;
  icon: LucideIcon;
};

export type BottomTabBarProps = {
  items: TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  /** Adds the bottom safe-area padding (off when the bar is shown inside a page, like /dev/ui). */
  safeArea?: boolean;
  className?: string;
};

/**
 * Presentational tab bar. In step 4 the (tabs) layout passes Expo Router's
 * state into it through the Tabs `tabBar` prop.
 */
export function BottomTabBar({ items, activeKey, onSelect, safeArea = true, className }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      className={cn('flex-row border-t border-border bg-bg px-2 pt-2', className)}
      // Safe-area padding is a runtime value, so it can't be a className.
      style={{ paddingBottom: safeArea ? Math.max(insets.bottom, 8) : 8 }}
    >
      {items.map(({ key, label, icon: Icon }) => {
        const active = key === activeKey;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
            className="min-h-touch flex-1 items-center justify-center gap-1 py-1"
          >
            <Icon size={22} color={active ? colors.blue : colors.muted} strokeWidth={active ? 2.4 : 2} />
            <Text className={cn('font-sans-semibold text-[11px]', active ? 'text-blue' : 'text-muted')}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
