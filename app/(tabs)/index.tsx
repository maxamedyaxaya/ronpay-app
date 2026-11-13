import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowUpRight, DollarSign, Gift, Hexagon, UserCheck, UserPlus, Users } from 'lucide-react-native';

import { BalanceCard } from '@/components/home/BalanceCard';
import { DailyRewardCard } from '@/components/home/DailyRewardCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { InviteCard } from '@/components/home/InviteCard';
import { PackageSlider } from '@/components/home/PackageSlider';
import { ActivityRow, SectionHeader, StatBox } from '@/components/ui';
import { format, useStrings } from '@/lib/i18n';
import { sampleHome } from '@/lib/sample-home';

// Design reference: docs/RoonPay-UI-Design-v1.1.pdf, page 9.
// Data is the temporary example from lib/sample-home.ts until step 3 (mock API + React Query).
export default function HomeScreen() {
  const s = useStrings();
  const router = useRouter();
  const d = sampleHome;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 px-4 pb-8 pt-3" showsVerticalScrollIndicator={false}>
        <HomeHeader initials={d.member.initials} name={d.member.fullName} unread={d.unreadNotifications} />

        <BalanceCard
          available={d.balance.available}
          totalEarned={d.balance.totalEarned}
          totalWithdrawn={d.balance.totalWithdrawn}
        />

        <View className="flex-row gap-3">
          <StatBox label={s.home.statPackages} value={d.stats.packages} icon={Hexagon} tone="blue" />
          <StatBox label={s.home.statConfirmed} value={d.stats.confirmedReferrals} icon={UserCheck} tone="violet" />
        </View>
        <View className="flex-row gap-3">
          <StatBox label={s.home.statRewards} value={d.stats.referralRewards} icon={DollarSign} tone="success" />
          <StatBox label={s.home.statInvited} value={d.stats.invited} icon={UserPlus} tone="gold" />
        </View>

        <DailyRewardCard
          weeklyTotal={d.dailyReward.weeklyTotal}
          dailyAmount={d.dailyReward.dailyAmount}
          todayIndex={d.dailyReward.todayIndex}
          claimedToday={d.dailyReward.claimedToday}
        />

        <SectionHeader
          className="mt-2"
          title={s.home.myPackages}
          note={format(s.home.activeCount, { count: d.packages.length })}
          actionLabel={s.common.seeAll}
          onAction={() => router.navigate('/packages')}
        />
        <PackageSlider packages={d.packages} onBuyAnother={() => router.navigate('/packages')} />

        <InviteCard reward={d.inviteReward} onMyTeam={() => router.navigate('/team')} />

        <SectionHeader className="mt-2" title={s.home.recentActivity} actionLabel={s.common.seeAll} />
        <View className="rounded-3xl border border-border bg-surface px-4">
          {d.activity.map((a, i) => {
            const last = i === d.activity.length - 1;
            if (a.kind === 'referral') {
              return (
                <ActivityRow
                  key={a.id}
                  icon={Users}
                  tone="blue"
                  title={format(s.activity.referralReward, { name: a.name })}
                  subtitle={format(s.activity.referralRewardSub, { when: format(s.activity.today, { time: a.time }) })}
                  amount={a.amount}
                  direction="in"
                  divider={!last}
                />
              );
            }
            if (a.kind === 'daily') {
              return (
                <ActivityRow
                  key={a.id}
                  icon={Gift}
                  tone="gold"
                  title={s.activity.dailyReward}
                  subtitle={format(s.activity.dailyRewardSub, { day: a.day, when: s.activity.yesterday })}
                  amount={a.amount}
                  direction="in"
                  divider={!last}
                />
              );
            }
            return (
              <ActivityRow
                key={a.id}
                icon={ArrowUpRight}
                tone="violet"
                title={format(s.activity.withdrawal, { method: a.method })}
                subtitle={format(s.activity.withdrawalSub, { ref: a.ref, when: a.date })}
                amount={a.amount}
                direction="out"
                divider={!last}
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
