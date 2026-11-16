import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader, HexBadge, QueryState, Segmented } from '@/components/ui';
import type { Leader, Leaderboard, LeaderPeriod } from '@/lib/api';
import { useLeaderboard, useProfile } from '@/lib/api/hooks';
import { cn } from '@/lib/cn';
import { format, useStrings } from '@/lib/i18n';
import { formatUsd } from '@/lib/money';
import type { TierKey } from '@/lib/theme';

const tierText: Record<TierKey, string> = {
  bronze: 'border-tier-bronze',
  silver: 'border-tier-silver',
  gold: 'border-tier-gold',
  platinum: 'border-tier-platinum',
  diamond: 'border-tier-diamond',
  royal: 'border-tier-royal',
};
const tierDot: Record<TierKey, string> = {
  bronze: 'bg-tier-bronze',
  silver: 'bg-tier-silver',
  gold: 'bg-tier-gold',
  platinum: 'bg-tier-platinum',
  diamond: 'bg-tier-diamond',
  royal: 'bg-tier-royal',
};
/** Medal colors for places 1–3 (gold, silver, bronze). */
const medal: Record<number, TierKey> = { 1: 'gold', 2: 'silver', 3: 'bronze' };
/** Podium column heights (place 1 is tallest). */
const podiumHeight: Record<number, string> = { 1: 'h-32', 2: 'h-28', 3: 'h-24' };

// Money shown is what each member earned from invites (CLAUDE.md §4.8), sent by the API.

function Podium({ l }: { l: Leader }) {
  const s = useStrings();
  return (
    <View
      className="flex-1 items-center justify-end gap-2"
      accessible
      accessibilityLabel={format(s.leaderboard.rankA11y, { rank: l.rank, name: l.name, count: l.invites, amount: formatUsd(l.earned) })}
    >
      <View>
        <View className={cn('h-14 w-14 items-center justify-center rounded-2xl border-2 bg-surface', tierText[medal[l.rank]])}>
          <Text className="font-sans-extrabold text-base text-ink">{l.initials}</Text>
        </View>
        <View className="absolute -bottom-2 -right-2">
          <HexBadge tier={medal[l.rank]} variant="filled" size={24}>
            <Text className="font-sans-extrabold text-[11px] text-bg">{l.rank}</Text>
          </HexBadge>
        </View>
      </View>
      <Text className="font-sans-semibold text-[13px] text-ink" numberOfLines={1}>
        {l.name}
      </Text>
      <View
        className={cn(
          'w-full items-center justify-center rounded-t-2xl border border-b-0',
          podiumHeight[l.rank],
          l.rank === 1 ? 'border-primary/40 bg-primary/15' : 'border-border bg-surface',
        )}
      >
        <Text className="font-sans-extrabold text-2xl text-ink">{l.invites}</Text>
        <Text className="font-sans text-[11px] text-muted">{s.leaderboard.invitesLabel}</Text>
        <Text className="mt-0.5 font-sans-bold text-xs text-success">{formatUsd(l.earned)}</Text>
      </View>
    </View>
  );
}

// Design reference: docs/RoonPay-UI-Design-v1.1.pdf, page 11 (right).
export default function LeaderboardScreen() {
  const s = useStrings();
  const [period, setPeriod] = useState<LeaderPeriod>('month');
  const query = useLeaderboard(period);
  const initials = useProfile().data?.initials ?? '';

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <View className="gap-4 px-4 pt-3">
        <BackHeader title={s.leaderboard.title} subtitle={s.leaderboard.subtitle} />
        <Segmented<LeaderPeriod>
          value={period}
          onChange={setPeriod}
          options={[
            { key: 'week', label: s.leaderboard.week },
            { key: 'month', label: s.leaderboard.month },
            { key: 'all', label: s.leaderboard.all },
          ]}
        />
      </View>
      <QueryState query={query}>{(board) => <Board board={board} initials={initials} />}</QueryState>
    </SafeAreaView>
  );
}

function Board({ board, initials }: { board: Leaderboard; initials: string }) {
  const s = useStrings();
  const byRank = (r: number) => board.leaders.find((l) => l.rank === r);
  const top3 = [byRank(2), byRank(1), byRank(3)].filter((l): l is Leader => Boolean(l));
  const rest = board.leaders.filter((l) => l.rank > 3);

  return (
    <>
      <ScrollView contentContainerClassName="gap-4 px-4 pb-6 pt-4">
        <View className="mt-2 flex-row items-end gap-2.5">
          {top3.map((l) => (
            <Podium key={l.rank} l={l} />
          ))}
        </View>

        <View className="rounded-3xl border border-border bg-surface px-4">
          {rest.map((l, i) => (
            <View
              key={l.rank}
              className={cn('flex-row items-center gap-3 py-3', i < rest.length - 1 && 'border-b border-border')}
              accessible
              accessibilityLabel={format(s.leaderboard.rankA11y, { rank: l.rank, name: l.name, count: l.invites, amount: formatUsd(l.earned) })}
            >
              <Text className="w-6 text-center font-sans-bold text-[13px] text-muted">{l.rank}</Text>
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-border">
                <Text className="font-sans-bold text-[13px] text-ink">{l.initials}</Text>
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="font-sans-semibold text-[15px] text-ink" numberOfLines={1}>
                  {l.name}
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <View className={cn('h-2 w-2 rounded-full', tierDot[l.tier])} />
                  <Text className="font-sans text-xs text-muted">{s.tiers[l.tier]}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-sans-extrabold text-base text-ink">{l.invites}</Text>
                <Text className="font-sans-semibold text-xs text-success">{formatUsd(l.earned)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Your own place, always visible. */}
      <View className="px-4 pb-2 pt-1">
        <View
          className="flex-row items-center gap-3 rounded-2xl bg-primary px-4 py-3"
          accessible
          accessibilityLabel={`#${board.me.rank}, ${s.leaderboard.you}, ${format(s.leaderboard.youBody, { count: board.me.toTop, top: 20 })}, ${board.me.invites}, ${formatUsd(board.me.earned)}`}
        >
          <Text className="font-sans-extrabold text-[15px] text-white">#{board.me.rank}</Text>
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Text className="font-sans-bold text-[13px] text-white">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-sans-bold text-[15px] text-white">{s.leaderboard.you}</Text>
            <Text className="font-sans text-xs text-white/80">{format(s.leaderboard.youBody, { count: board.me.toTop, top: 20 })}</Text>
          </View>
          <View className="items-end">
            <Text className="font-sans-extrabold text-base text-white">{board.me.invites}</Text>
            <Text className="font-sans-semibold text-xs text-white/90">{formatUsd(board.me.earned)}</Text>
          </View>
        </View>
      </View>
    </>
  );
}
