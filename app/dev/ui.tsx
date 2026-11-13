import { useState, type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DollarSign,
  Gift,
  Hexagon,
  Home,
  Lock,
  Phone,
  Plus,
  Receipt,
  User,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react-native';

import {
  BottomTabBar,
  Button,
  Card,
  HexBadge,
  Input,
  NoticeBox,
  PackageCard,
  Pill,
  StatBox,
  statusTone,
  type TabItem,
} from '@/components/ui';
import { format, useStrings } from '@/lib/i18n';
import { colors, TIERS, type TierKey } from '@/lib/theme';

// Sample prices for the kit only; real prices come from the API in step 3.
const SAMPLE_PRICES: Record<TierKey, string> = {
  bronze: '$1',
  silver: '$5',
  gold: '$10',
  platinum: '$25',
  diamond: '$50',
  royal: '$100',
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="font-sans-bold text-xs uppercase tracking-widest text-blue">{title}</Text>
      {children}
    </View>
  );
}

export default function UiKitScreen() {
  const s = useStrings();
  const ui = s.dev.ui;
  const [selectedTier, setSelectedTier] = useState<TierKey>('platinum');
  const [tab, setTab] = useState('home');
  const [phone, setPhone] = useState('');
  const [reference, setReference] = useState('REF-7K2Q9');
  const [password, setPassword] = useState('');

  const tabs: TabItem[] = [
    { key: 'home', label: s.tabs.home, icon: Home },
    { key: 'packages', label: s.tabs.packages, icon: Hexagon },
    { key: 'team', label: s.tabs.team, icon: Users },
    { key: 'wallet', label: s.tabs.wallet, icon: Wallet },
    { key: 'profile', label: s.tabs.profile, icon: User },
  ];

  const days = Object.values(s.daysShort);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView contentContainerClassName="gap-8 px-4 pb-8 pt-4">
        <View className="gap-1">
          <Text className="font-sans-extrabold text-[28px] text-ink">{ui.title}</Text>
          <Text className="font-sans text-sm text-muted">{ui.subtitle}</Text>
        </View>

        <Section title={ui.buttons}>
          <View className="flex-row gap-3">
            <Button label={ui.primary} />
            <Button label={ui.secondary} variant="secondary" />
          </View>
          <View className="flex-row gap-3 rounded-2xl bg-primary p-3">
            <Button label={ui.deposit} variant="light" icon={Plus} className="flex-1" />
            <Button label={ui.history} variant="glass" icon={Receipt} className="flex-1" />
          </View>
          <Button label={ui.claim} variant="gold" fullWidth />
          <View className="flex-row flex-wrap gap-3">
            <Button label={ui.ghost} variant="ghost" size="sm" />
            <Button label={ui.danger} variant="danger" size="sm" />
            <Button label={ui.disabled} size="sm" disabled />
            <Button label={ui.loadingLabel} size="sm" loading />
          </View>
        </Section>

        <Section title={ui.cards}>
          <Card>
            <Text className="font-sans-bold text-[15px] text-ink">{ui.cardTitle}</Text>
            <Text className="mt-1 font-sans text-sm text-muted">{ui.cardBody}</Text>
            <Text className="mt-3 font-mono text-base tracking-widest text-ink">REF-7K2Q9</Text>
          </Card>
          <Card variant="selected">
            <Text className="font-sans-bold text-[15px] text-ink">{ui.cardTitle}</Text>
            <Text className="mt-1 font-sans text-sm text-muted">{ui.cardBody}</Text>
          </Card>
        </Section>

        <Section title={ui.inputs}>
          <Input
            label={ui.phoneLabel}
            icon={Phone}
            keyboardType="phone-pad"
            placeholder={ui.phonePlaceholder}
            value={phone}
            onChangeText={setPhone}
          />
          <Input
            label={ui.refLabel}
            mono
            autoCapitalize="characters"
            placeholder={ui.refPlaceholder}
            value={reference}
            onChangeText={setReference}
            error={ui.refError}
          />
          <Input label={ui.passwordLabel} icon={Lock} password value={password} onChangeText={setPassword} />
        </Section>

        <Section title={ui.pills}>
          <View className="flex-row flex-wrap gap-2">
            {(Object.keys(statusTone) as (keyof typeof statusTone)[]).map((k) => (
              <Pill key={k} label={s.status[k]} tone={statusTone[k]} />
            ))}
          </View>
        </Section>

        <Section title={ui.hexes}>
          <View className="flex-row flex-wrap gap-3">
            {TIERS.map((t) => (
              <HexBadge key={t} tier={t} size={44} accessibilityLabel={s.tiers[t]} />
            ))}
          </View>
          <Card className="flex-row justify-between">
            {days.map((d, i) => (
              <View key={d} className="items-center gap-1">
                <HexBadge tone="gold" variant={i < 2 ? 'filled' : i === 2 ? 'outline' : 'empty'} size={34} />
                <Text className={i <= 2 ? 'font-sans-semibold text-[11px] text-gold' : 'font-sans text-[11px] text-muted'}>
                  {d}
                </Text>
              </View>
            ))}
          </Card>
          <View className="flex-row gap-3">
            {(['gold', 'silver', 'bronze'] as const).map((t, i) => (
              <HexBadge key={t} tier={t} variant="filled" size={44}>
                <Text className="font-sans-extrabold text-base text-bg">{i + 1}</Text>
              </HexBadge>
            ))}
            <HexBadge tone="violet" variant="outline" size={44}>
              <Gift size={18} color={colors.violet} />
            </HexBadge>
          </View>
        </Section>

        <Section title={ui.notices}>
          <NoticeBox tone="info" title={ui.noticeInfoTitle} body={ui.noticeInfoBody} />
          <NoticeBox tone="success" title={ui.noticeSuccessTitle} body={ui.noticeSuccessBody} />
          <NoticeBox tone="warning" title={ui.noticeWarnTitle} body={ui.noticeWarnBody} />
          <NoticeBox tone="danger" title={ui.noticeErrorTitle} body={ui.noticeErrorBody} />
        </Section>

        <Section title={ui.stats}>
          <View className="flex-row gap-3">
            <StatBox label={ui.statPackages} value="2" icon={Hexagon} tone="blue" />
            <StatBox label={ui.statConfirmed} value="3" icon={UserCheck} tone="violet" />
          </View>
          <View className="flex-row gap-3">
            <StatBox label={ui.statRewards} value="$0.15" icon={DollarSign} tone="success" />
            <StatBox label={ui.statInvited} value="4" icon={UserPlus} tone="gold" />
          </View>
        </Section>

        <Section title={ui.packages}>
          <PackageCard
            variant="owned"
            tier="gold"
            name={s.tiers.gold}
            price="$10"
            date="28 Oct"
            slots={{ used: 3, total: 5, label: s.home.slotsLabel, status: format(s.home.slotsLeft, { count: 2 }) }}
            activeLabel={s.status.active}
          />
          <PackageCard
            variant="owned"
            tier="bronze"
            name={s.tiers.bronze}
            price="$1"
            date="2 Nov"
            slots={{ used: 5, total: 5, label: s.home.slotsLabel, status: s.home.slotsFull }}
            activeLabel={s.status.active}
          />
          <View className="gap-2.5">
            {TIERS.map((t) => (
              <PackageCard
                key={t}
                tier={t}
                name={s.tiers[t]}
                price={SAMPLE_PRICES[t]}
                activeLabel={t === 'gold' ? s.status.active : undefined}
                selected={selectedTier === t}
                onPress={() => setSelectedTier(t)}
              />
            ))}
          </View>
        </Section>

        <Section title={ui.tabBar}>
          <View className="overflow-hidden rounded-2xl border border-border">
            <BottomTabBar items={tabs} activeKey={tab} onSelect={setTab} safeArea={false} className="border-t-0" />
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
