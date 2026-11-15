import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowUpRight, Gift, Hexagon, Link2, Plus, Search, UserPlus, type LucideIcon } from 'lucide-react-native';

import { ActivityRow, Chip, ScreenHeader, type ActivityTone, type ActivityRowProps } from '@/components/ui';
import { WalletBalanceCard } from '@/components/wallet/WalletBalanceCard';
import { format, useStrings } from '@/lib/i18n';
import { formatUsd } from '@/lib/money';
import { sampleWallet, type Tx, type TxKind, type TxStatus } from '@/lib/sample-tabs';
import { colors } from '@/lib/theme';

type Filter = 'all' | TxKind;

const look: Record<TxKind, { icon: LucideIcon; tone: ActivityTone }> = {
  invite: { icon: UserPlus, tone: 'blue' },
  link: { icon: Link2, tone: 'success' },
  daily: { icon: Gift, tone: 'gold' },
  purchase: { icon: Hexagon, tone: 'violet' },
  deposit: { icon: Plus, tone: 'success' },
  withdrawal: { icon: ArrowUpRight, tone: 'violet' },
};

const statusTone: Record<TxStatus, NonNullable<ActivityRowProps['statusTone']>> = {
  credited: 'success',
  approved: 'success',
  paid: 'success',
  pending: 'gold',
  rejected: 'danger',
};

// Design reference: docs/RoonPay-UI-Design-v1.1.pdf, page 13 (left). Data is temporary (lib/sample-tabs.ts).
export default function WalletScreen() {
  const s = useStrings();
  const router = useRouter();
  const w = sampleWallet;
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  function texts(t: Tx) {
    const tier = t.tier ? s.tiers[t.tier] : '';
    const when = t.when;
    switch (t.kind) {
      case 'invite':
        return { title: format(s.wallet.txInvite, { name: t.name ?? '' }), subtitle: format(s.wallet.txInviteSub, { when }) };
      case 'link':
        return { title: format(s.wallet.txLink, { name: t.name ?? '' }), subtitle: format(s.wallet.txLinkSub, { tier, when }) };
      case 'daily':
        return { title: s.wallet.txDaily, subtitle: format(s.wallet.txDailySub, { day: t.day ?? 1, when }) };
      case 'purchase':
        return { title: format(s.wallet.txPurchase, { tier }), subtitle: format(s.wallet.txPurchaseSub, { when }) };
      case 'deposit':
        return { title: format(s.wallet.txDeposit, { method: t.method ?? '' }), subtitle: format(s.wallet.txDepositSub, { ref: t.ref ?? '', when }) };
      case 'withdrawal':
        return {
          title: format(s.wallet.txWithdrawal, { method: t.method ?? '' }),
          subtitle: format(s.wallet.txWithdrawalSub, { number: t.number ?? '', ref: t.ref ?? '', when }),
        };
    }
  }

  const statusLabel: Record<TxStatus, string> = {
    credited: s.wallet.credited,
    approved: s.status.approved,
    paid: s.status.paid,
    pending: s.status.pending,
    rejected: s.status.rejected,
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: s.wallet.filterAll },
    { key: 'invite', label: s.wallet.filterInvite },
    { key: 'link', label: s.wallet.filterLink },
    { key: 'daily', label: s.wallet.filterDaily },
    { key: 'purchase', label: s.wallet.filterPurchases },
    { key: 'deposit', label: s.wallet.filterDeposits },
    { key: 'withdrawal', label: s.wallet.filterWithdrawals },
  ];

  const q = query.trim().toLowerCase();
  const rows = w.history
    .filter((t) => filter === 'all' || t.kind === filter)
    .map((t) => ({ t, ...texts(t) }))
    .filter((r) => !q || `${r.title} ${r.subtitle}`.toLowerCase().includes(q));

  const mini = [
    { label: s.wallet.statInvite, value: formatUsd(w.inviteRewards) },
    { label: s.wallet.statDaily, value: formatUsd(w.dailyRewards) },
    { label: s.wallet.statWithdrawn, value: formatUsd(w.withdrawn) },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-4 pb-8 pt-3" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title={s.tabs.wallet} />

        <WalletBalanceCard
          available={formatUsd(w.available)}
          locked={formatUsd(w.locked)}
          onDeposit={() => router.push('/deposit')}
          onWithdraw={() => router.push('/withdraw')}
        />

        <View className="flex-row gap-2.5">
          {mini.map((m) => (
            <View key={m.label} className="flex-1 rounded-2xl border border-border bg-surface px-3 py-2.5" accessible>
              <Text className="font-sans text-[11px] text-muted" numberOfLines={1}>
                {m.label}
              </Text>
              <Text className="mt-0.5 font-sans-bold text-[15px] text-ink">{m.value}</Text>
            </View>
          ))}
        </View>

        <View className="min-h-touch flex-row items-center gap-2.5 rounded-2xl border border-border bg-surface px-3.5">
          <Search size={17} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={s.wallet.search}
            placeholderTextColor={colors.muted}
            accessibilityLabel={s.wallet.search}
            className="h-12 flex-1 font-sans text-sm text-ink"
            returnKeyType="search"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4" className="-mx-4 -my-1">
          {filters.map((f) => (
            <Chip key={f.key} label={f.label} selected={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </ScrollView>

        <View className="rounded-3xl border border-border bg-surface px-4">
          {rows.length === 0 ? (
            <Text className="py-8 text-center font-sans text-sm text-muted">{s.wallet.empty}</Text>
          ) : (
            rows.map(({ t, title, subtitle }, i) => (
              <ActivityRow
                key={t.id}
                icon={look[t.kind].icon}
                tone={look[t.kind].tone}
                title={title}
                subtitle={subtitle}
                amount={formatUsd(t.amount, { sign: true })}
                direction={t.amount > 0n ? 'in' : 'out'}
                status={t.kind === 'purchase' ? undefined : statusLabel[t.status]}
                statusTone={statusTone[t.status]}
                divider={i < rows.length - 1}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
