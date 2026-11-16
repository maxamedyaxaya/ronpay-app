import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';

import { Chip, QueryState, ScreenHeader } from '@/components/ui';
import { TxRow, useTxText } from '@/components/wallet/TxRow';
import { WalletBalanceCard } from '@/components/wallet/WalletBalanceCard';
import type { TxKind, Wallet } from '@/lib/api';
import { useWallet } from '@/lib/api/hooks';
import { useStrings } from '@/lib/i18n';
import { formatUsd } from '@/lib/money';
import { colors } from '@/lib/theme';

type Filter = 'all' | TxKind;

// Design reference: docs/RoonPay-UI-Design-v1.1.pdf, page 13 (left).
export default function WalletScreen() {
  const wallet = useWallet();
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <QueryState query={wallet}>{(w) => <WalletBody w={w} />}</QueryState>
    </SafeAreaView>
  );
}

function WalletBody({ w }: { w: Wallet }) {
  const s = useStrings();
  const router = useRouter();
  const texts = useTxText();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

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
            <TxRow key={t.id} tx={t} title={title} subtitle={subtitle} divider={i < rows.length - 1} />
          ))
        )}
      </View>
    </ScrollView>
  );
}
