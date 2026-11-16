import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDownLeft, ArrowUpRight, Clock, Gift, Hash, Hexagon, Link2, ShieldAlert, TriangleAlert, UserPlus, type LucideIcon } from 'lucide-react-native';

import { BackHeader, QueryState, type ActivityTone } from '@/components/ui';
import type { AppNotification, NotificationKind } from '@/lib/api';
import { useMarkAllRead, useMarkRead, useNotifications } from '@/lib/api/hooks';
import { isToday, shortDate, timeOf } from '@/lib/dates';
import { cn } from '@/lib/cn';
import { format, useStrings } from '@/lib/i18n';
import { formatUsd } from '@/lib/money';
import { colors } from '@/lib/theme';

const look: Record<NotificationKind, { icon: LucideIcon; tone: ActivityTone }> = {
  inviteReward: { icon: UserPlus, tone: 'success' },
  linkSale: { icon: Link2, tone: 'success' },
  dailyReady: { icon: Gift, tone: 'gold' },
  slotsLow: { icon: TriangleAlert, tone: 'gold' },
  rank: { icon: Hash, tone: 'violet' },
  withdrawalPaid: { icon: ArrowUpRight, tone: 'violet' },
  withdrawalRequested: { icon: Clock, tone: 'gold' },
  depositApproved: { icon: ArrowDownLeft, tone: 'success' },
  newLogin: { icon: ShieldAlert, tone: 'danger' },
  packageActive: { icon: Hexagon, tone: 'blue' },
};

const toneBox: Record<ActivityTone, { box: string; color: string }> = {
  blue: { box: 'bg-blue/15', color: colors.blue },
  gold: { box: 'bg-gold/15', color: colors.gold },
  violet: { box: 'bg-violet/20', color: colors.violet },
  success: { box: 'bg-success/15', color: colors.success },
  danger: { box: 'bg-danger/15', color: colors.danger },
};

// Design reference: docs/RoonPay-UI-Design-v1.1.pdf, page 14 (left). Messages are built from
// i18n templates (CLAUDE.md §4.9).
export default function NotificationsScreen() {
  const s = useStrings();
  const n = s.notifications;
  const query = useNotifications();
  const markOne = useMarkRead();
  const markAll = useMarkAllRead();
  const items = query.data ?? [];

  function text(item: AppNotification) {
    const values = {
      ...item.values,
      amount: item.amount !== undefined ? formatUsd(item.amount) : '',
      tier: item.tier ? s.tiers[item.tier] : '',
    };
    return { title: n[`${item.kind}Title`], body: format(n[`${item.kind}Body`], values) };
  }

  const markRead = (item: AppNotification) => {
    if (item.unread) markOne.mutate(item.id);
  };
  const anyUnread = items.some((i) => i.unread);

  const sections = [
    { title: n.today, list: items.filter((i) => isToday(i.at)) },
    { title: n.earlier, list: items.filter((i) => !isToday(i.at)) },
  ].filter((sec) => sec.list.length > 0);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="gap-4 px-4 pb-8 pt-3">
        <BackHeader
          title={n.title}
          right={
            anyUnread ? (
              <Pressable
                onPress={() => markAll.mutate()}
                accessibilityRole="button"
                className="min-h-touch justify-center"
              >
                <Text className="font-sans-semibold text-[13px] text-blue">{n.markAllRead}</Text>
              </Pressable>
            ) : null
          }
        />

        {query.data === undefined ? <QueryState query={query}>{() => null}</QueryState> : null}
        {query.data !== undefined && sections.length === 0 && <Text className="py-10 text-center font-sans text-sm text-muted">{n.empty}</Text>}

        {sections.map((sec) => (
          <View key={sec.title} className="gap-2.5">
            <Text className="px-1 font-sans-bold text-[11px] uppercase tracking-widest text-muted" accessibilityRole="header">
              {sec.title}
            </Text>
            {sec.list.map((item) => {
              const { title, body } = text(item);
              const l = look[item.kind];
              const t = toneBox[l.tone];
              const Icon = l.icon;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => markRead(item)}
                  accessibilityRole="button"
                  accessibilityLabel={[item.unread ? n.unread : '', title, body, (isToday(item.at) ? timeOf(item.at) : shortDate(item.at))].filter(Boolean).join(', ')}
                  className={cn(
                    'flex-row gap-3 rounded-2xl border p-3.5 active:opacity-80',
                    item.unread ? 'border-primary/40 bg-primary/10' : 'border-border bg-surface',
                  )}
                >
                  <View className={cn('h-10 w-10 items-center justify-center rounded-xl', t.box)}>
                    <Icon size={18} color={t.color} />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="font-sans-bold text-[15px] text-ink">{title}</Text>
                    <Text className="font-sans text-[13px] leading-[18px] text-muted">{body}</Text>
                    <Text className="mt-0.5 font-sans text-[11px] text-muted">{(isToday(item.at) ? timeOf(item.at) : shortDate(item.at))}</Text>
                  </View>
                  {item.unread && <View className="mt-1.5 h-2.5 w-2.5 rounded-full bg-blue" />}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
