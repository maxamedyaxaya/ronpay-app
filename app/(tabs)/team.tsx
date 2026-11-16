import { useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, DollarSign, Hexagon, Share2, Trophy, UserCheck, UserPlus } from 'lucide-react-native';

import { HexBadge, IconButton, Pill, QueryState, ScreenHeader, Segmented, SlotBar, StatBox } from '@/components/ui';
import type { Config, OwnedPackage, Team, TeamMember } from '@/lib/api';
import { both, useConfig, usePackages, useTeam } from '@/lib/api/hooks';
import { shortDate } from '@/lib/dates';
import { cn } from '@/lib/cn';
import { format, useStrings } from '@/lib/i18n';
import { formatUsd } from '@/lib/money';
import { colors, type TierKey } from '@/lib/theme';

const tierDot: Record<TierKey, string> = {
  bronze: 'bg-tier-bronze',
  silver: 'bg-tier-silver',
  gold: 'bg-tier-gold',
  platinum: 'bg-tier-platinum',
  diamond: 'bg-tier-diamond',
  royal: 'bg-tier-royal',
};

type Filter = 'all' | 'bought' | 'notYet';

function MemberRow({ m }: { m: TeamMember }) {
  const s = useStrings();
  const bought = Boolean(m.tier);
  const sub = m.tier ? format(s.team.boughtTier, { tier: s.tiers[m.tier], date: shortDate(m.joinedAt) }) : format(s.team.joinedOn, { date: shortDate(m.joinedAt) });
  const amount = m.reward > 0n ? formatUsd(m.reward, { sign: true }) : '—';

  return (
    <View
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3"
      accessible
      accessibilityLabel={[m.name, sub, amount].join(', ')}
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-border">
        <Text className="font-sans-bold text-[13px] text-ink">{m.initials}</Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-sans-semibold text-[15px] text-ink" numberOfLines={1}>
          {m.name}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <View className={cn('h-2 w-2 rounded-full', m.tier ? tierDot[m.tier] : 'bg-border')} />
          <Text className="font-sans text-xs text-muted">{sub}</Text>
        </View>
      </View>
      <View className="items-end gap-1">
        <Text className={cn('font-sans-bold text-[15px]', bought ? 'text-success' : 'text-muted')}>{amount}</Text>
        <Pill size="sm" label={bought ? s.team.bought : s.team.noPackageYet} tone={bought ? 'success' : 'gold'} />
      </View>
    </View>
  );
}

// Design reference: docs/RoonPay-UI-Design-v1.1.pdf, page 11 (left), plus a "My package links"
// section for CLAUDE.md §4.5.2.
export default function TeamScreen() {
  const team = useTeam();
  const packages = usePackages();
  const config = useConfig();
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <QueryState query={both(both(team, packages), config)}>
        {([[t, p], c]) => <TeamBody team={t} owned={p} config={c} />}
      </QueryState>
    </SafeAreaView>
  );
}

function TeamBody({ team, owned, config }: { team: Team; owned: OwnedPackage[]; config: Config }) {
  const s = useStrings();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const total = config.settings.packageLinkSlots;
  const rank = team.rank;

  const boughtCount = team.members.filter((m) => m.tier).length;
  const earned = team.members.reduce((sum, m) => sum + m.reward, 0n);
  const slotsLeft = owned.reduce((sum, p) => sum + Math.max(0, total - p.buyers.length), 0);
  const members = team.members.filter((m) => (filter === 'all' ? true : filter === 'bought' ? m.tier : !m.tier));

  const share = (tier: TierKey, url: string) =>
    Share.share({ message: format(s.team.shareMessage, { name: s.tiers[tier], url }) }).catch(() => undefined);

  return (
    <ScrollView contentContainerClassName="gap-4 px-4 pb-8 pt-3" showsVerticalScrollIndicator={false}>
        <ScreenHeader title={s.team.title} subtitle={s.team.subtitle} />

        <View className="flex-row gap-3">
          <StatBox label={s.team.statBought} value={String(boughtCount)} icon={UserCheck} tone="violet" />
          <StatBox label={s.team.statEarned} value={formatUsd(earned)} icon={DollarSign} tone="success" />
        </View>
        <View className="flex-row gap-3">
          <StatBox label={s.team.statSignups} value={String(team.members.length)} icon={UserPlus} tone="gold" />
          <StatBox
            label={s.team.statSlotsLeft}
            value={format(s.team.slotsOf, { left: slotsLeft, total: total * owned.length })}
            icon={Hexagon}
            tone="blue"
          />
        </View>

        <Pressable
          onPress={() => router.push('/leaderboard')}
          accessibilityRole="button"
          className="min-h-touch flex-row items-center gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 active:opacity-80"
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-gold/20">
            <Trophy size={18} color={colors.gold} />
          </View>
          <View className="flex-1">
            <Text className="font-sans-bold text-[15px] text-ink">{format(s.team.rankTitle, { rank: rank.rank })}</Text>
            <Text className="font-sans text-xs text-muted">
              {format(s.team.rankBody, { count: rank.toTop, top: rank.top })}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.muted} />
        </Pressable>

        <Text className="mt-2 font-sans-bold text-[17px] text-ink" accessibilityRole="header">
          {s.team.linksTitle}
        </Text>
        {owned.map((p) => {
          const used = p.buyers.length;
          const full = used >= total;
          return (
            <Pressable
              key={p.id}
              onPress={() => router.push({ pathname: '/package/[id]', params: { id: p.id } })}
              accessibilityRole="button"
              accessibilityLabel={format(s.packageDetail.open, { tier: s.tiers[p.tier] })}
              className="gap-3 rounded-2xl border border-border bg-surface p-4 active:opacity-80"
            >
              <View className="flex-row items-center gap-3">
                <HexBadge tier={p.tier} size={36} />
                <View className="flex-1">
                  <Text className="font-sans-bold text-[15px] text-ink">{s.tiers[p.tier]}</Text>
                  <Text className="font-mono text-xs text-muted" numberOfLines={1}>
                    {p.url.replace('https://', '')}
                  </Text>
                </View>
                {!full && (
                  <IconButton
                    accessibilityLabel={format(s.team.shareLink, { name: s.tiers[p.tier] })}
                    onPress={() => share(p.tier, p.url)}
                  >
                    <Share2 size={18} color={colors.blue} />
                  </IconButton>
                )}
              </View>
              <SlotBar
                tier={p.tier}
                used={used}
                total={total}
                label={s.home.slotsLabel}
                status={full ? s.home.slotsFull : format(s.home.slotsLeft, { count: total - used })}
              />
              {full && <Text className="font-sans text-xs text-muted">{format(s.team.linkFull, { name: s.tiers[p.tier] })}</Text>}
            </Pressable>
          );
        })}

        <Segmented
          className="mt-2"
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: format(s.team.filterAll, { count: team.members.length }) },
            { key: 'bought', label: format(s.team.filterBought, { count: boughtCount }) },
            { key: 'notYet', label: format(s.team.filterNotYet, { count: team.members.length - boughtCount }) },
          ]}
        />

        <View className="gap-2.5">
          {members.length === 0 ? (
            <Text className="py-6 text-center font-sans text-sm text-muted">{s.team.empty}</Text>
          ) : (
            members.map((m) => <MemberRow key={m.id} m={m} />)
          )}
        </View>
    </ScrollView>
  );
}
