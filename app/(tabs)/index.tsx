import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { DollarSign, Hexagon, UserCheck, UserPlus } from 'lucide-react-native';

import { BalanceCard } from '@/components/home/BalanceCard';
import { DailyRewardCard } from '@/components/home/DailyRewardCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { InviteCard } from '@/components/home/InviteCard';
import { PackageSlider } from '@/components/home/PackageSlider';
import { NoticeBox, QueryState, SectionHeader, StatBox } from '@/components/ui';
import { TxRow, useTxText } from '@/components/wallet/TxRow';
import { isApiError, type Config, type Home } from '@/lib/api';
import { both, useClaimDaily, useConfig, useHome, useIdempotencyKey } from '@/lib/api/hooks';
import { format, useStrings } from '@/lib/i18n';
import { formatUsd } from '@/lib/money';

// Design reference: docs/RoonPay-UI-Design-v1.1.pdf, page 9.
export default function HomeScreen() {
  const home = useHome();
  const config = useConfig();
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <QueryState query={both(home, config)}>{([d, c]) => <HomeBody d={d} config={c} />}</QueryState>
    </SafeAreaView>
  );
}

function HomeBody({ d, config }: { d: Home; config: Config }) {
  const s = useStrings();
  const router = useRouter();
  const texts = useTxText();
  const claim = useClaimDaily();
  const claimKey = useIdempotencyKey();
  const { settings } = config;

  const onClaim = () =>
    claim.mutate({ key: claimKey.get() }, { onSuccess: claimKey.renew });

  return (
    <ScrollView contentContainerClassName="gap-4 px-4 pb-8 pt-3" showsVerticalScrollIndicator={false}>
      <HomeHeader
        initials={d.member.initials}
        name={d.member.fullName}
        unread={d.unreadNotifications}
        onNotifications={() => router.push('/notifications')}
      />

      <BalanceCard
        available={formatUsd(d.wallet.available)}
        totalEarned={formatUsd(d.wallet.totalEarned)}
        pendingDeposits={formatUsd(d.wallet.pendingDeposits)}
        onDeposit={() => router.push('/deposit')}
        onHistory={() => router.navigate('/wallet')}
      />

      <View className="flex-row gap-3">
        <StatBox label={s.home.statPackages} value={String(d.stats.packages)} icon={Hexagon} tone="blue" />
        <StatBox label={s.home.statConfirmed} value={String(d.stats.confirmedReferrals)} icon={UserCheck} tone="violet" />
      </View>
      <View className="flex-row gap-3">
        <StatBox label={s.home.statRewards} value={formatUsd(d.stats.referralRewards)} icon={DollarSign} tone="success" />
        <StatBox label={s.home.statInvited} value={String(d.stats.invited)} icon={UserPlus} tone="gold" />
      </View>

      <DailyRewardCard
        weeklyTotal={formatUsd(d.daily.weeklyTotal)}
        dailyAmount={formatUsd(d.daily.dailyAmount)}
        todayIndex={d.daily.todayIndex}
        claimedToday={d.daily.claimedToday}
        claimedDays={d.daily.claimedDays}
        canClaim={d.daily.canClaim}
        claiming={claim.isPending}
        onClaim={onClaim}
      />
      {claim.isError ? (
        <NoticeBox
          tone="danger"
          title={isApiError(claim.error) && claim.error.code === 'ALREADY_CLAIMED' ? s.home.claimed : s.common.errorGeneric}
        />
      ) : null}

      <SectionHeader
        className="mt-2"
        title={s.home.myPackages}
        note={format(s.home.activeCount, { count: d.packages.length })}
        actionLabel={s.common.seeAll}
        onAction={() => router.navigate('/packages')}
      />
      <PackageSlider
        packages={d.packages.map((p) => ({
          id: p.id,
          tier: p.tier,
          price: p.price,
          slotsUsed: p.buyers.length,
          slotsTotal: settings.packageLinkSlots,
        }))}
        rewardPercent={settings.packageLinkRewardPercent}
        onBuyAnother={() => router.navigate('/packages')}
        onOpen={(id) => router.push({ pathname: '/package/[id]', params: { id } })}
      />

      <InviteCard reward={formatUsd(settings.inviteReward)} onMyTeam={() => router.navigate('/team')} />

      <SectionHeader
        className="mt-2"
        title={s.home.recentActivity}
        actionLabel={s.common.seeAll}
        onAction={() => router.navigate('/wallet')}
      />
      <View className="rounded-3xl border border-border bg-surface px-4">
        {d.activity.map((t, i) => {
          const { title, subtitle } = texts(t);
          return <TxRow key={t.id} tx={t} title={title} subtitle={subtitle} divider={i < d.activity.length - 1} />;
        })}
      </View>
    </ScrollView>
  );
}
