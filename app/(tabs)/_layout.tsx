import { Hexagon, Home, User, Users, Wallet } from 'lucide-react-native';
import { Tabs } from 'expo-router/tabs';

import { BottomTabBar, type TabItem } from '@/components/ui';
import { useStrings } from '@/lib/i18n';

export default function TabsLayout() {
  const s = useStrings();

  // Keys are the route file names in app/(tabs).
  const items: TabItem[] = [
    { key: 'index', label: s.tabs.home, icon: Home },
    { key: 'packages', label: s.tabs.packages, icon: Hexagon },
    { key: 'team', label: s.tabs.team, icon: Users },
    { key: 'wallet', label: s.tabs.wallet, icon: Wallet },
    { key: 'profile', label: s.tabs.profile, icon: User },
  ];

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigateToTab }) => {
        const active = state.routes[state.index]?.name ?? 'index';
        return (
          <BottomTabBar
            items={items}
            activeKey={active}
            onSelect={(name) => {
              const route = state.routes.find((r) => r.name === name);
              if (route) navigateToTab(route.key);
            }}
          />
        );
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="packages" />
      <Tabs.Screen name="team" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
