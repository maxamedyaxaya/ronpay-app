import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lock, Plus, WalletCards } from 'lucide-react-native';

import { BackHeader, Button, HexBadge, NoticeBox, QueryState } from '@/components/ui';
import { isApiError, type Config } from '@/lib/api';
import { both, useBuyPackage, useConfig, useIdempotencyKey, useWallet } from '@/lib/api/hooks';
import { cn } from '@/lib/cn';
import { format, useStrings } from '@/lib/i18n';
import { formatUsd, percentOf } from '@/lib/money';
import { colors, TIERS, type TierKey } from '@/lib/theme';

function Line({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: 'danger' | 'success' }) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className={cn('text-[13px]', strong ? 'font-sans-bold text-ink' : 'font-sans text-muted')}>{label}</Text>
      <Text
        className={cn(
          'font-sans-bold',
          strong ? 'text-base' : 'text-[13px]',
          tone === 'danger' ? 'text-danger' : tone === 'success' ? 'text-success' : 'text-ink',
        )}
      >
        {value}
      </Text>
    </View>
  );
}

// Design reference: docs/RoonPay-UI-Design-v1.1.pdf, page 10 (middle and right).
// Packages are paid only from the wallet (CLAUDE.md §4.4).
export default function CheckoutScreen() {
  const params = useLocalSearchParams<{ tier?: string }>();
  const tier: TierKey = TIERS.includes(params.tier as TierKey) ? (params.tier as TierKey) : 'bronze';
  const config = useConfig();
  const wallet = useWallet();
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <QueryState query={both(config, wallet)}>{([c, w]) => <CheckoutBody tier={tier} config={c} balance={w.available} />}</QueryState>
    </SafeAreaView>
  );
}

function CheckoutBody({ tier, config, balance: liveBalance }: { tier: TierKey; config: Config; balance: bigint }) {
  const s = useStrings();
  const router = useRouter();
  const pkg = config.catalog.find((p) => p.tier === tier) ?? config.catalog[0];
  const { packageLinkRewardPercent: percent, packageLinkSlots: slots } = config.settings;
  const buy = useBuyPackage();
  const key = useIdempotencyKey();
  const paid = buy.isSuccess;

  // After paying, keep showing the balance from the moment of payment so the lines still add up.
  const [paidFrom, setPaidFrom] = useState<bigint | null>(null);
  const balance = paid && paidFrom !== null ? paidFrom : liveBalance;
  const enough = balance >= pkg.price;
  const missing = enough ? 0n : pkg.price - balance;
  // Progress = how much of the price the balance covers, in whole percent (bigint math).
  const covered = Number(enough ? 100n : (balance * 100n) / pkg.price);
  const price = formatUsd(pkg.price);

  const serverMissing =
    isApiError(buy.error) && buy.error.code === 'INSUFFICIENT_BALANCE' ? (buy.error.details.missing as bigint) : null;

  return (
    <>
      <ScrollView contentContainerClassName="gap-4 px-4 pb-6 pt-3">
        <BackHeader title={s.checkout.title} />

        <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <HexBadge tier={tier} size={44} />
          <View className="flex-1">
            <Text className="font-sans-bold text-base text-ink">{format(s.checkout.packageName, { name: s.tiers[tier] })}</Text>
            <Text className="font-sans text-xs text-muted">
              {format(s.checkout.packageSub, { slots, amount: formatUsd(percentOf(pkg.price, percent)) })}
            </Text>
          </View>
          <Text className="font-sans-extrabold text-xl text-ink">{formatUsd(pkg.price, { whole: true })}</Text>
        </View>

        <View className="rounded-2xl border border-border bg-surface p-4">
          <View className="mb-3 flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue/15">
              <WalletCards size={18} color={colors.blue} />
            </View>
            <View className="flex-1">
              <Text className="font-sans-bold text-[15px] text-ink">{s.checkout.payFromWallet}</Text>
              <Text className="font-sans text-xs text-muted">{s.checkout.payFromWalletBody}</Text>
            </View>
          </View>
          <Line label={s.checkout.walletBalance} value={formatUsd(balance)} />
          <Line label={s.checkout.packagePrice} value={`-${price}`} />
          <View className="my-1.5 h-px bg-border" />
          {enough ? (
            <Line label={s.checkout.balanceAfter} value={formatUsd(balance - pkg.price)} strong tone="success" />
          ) : (
            <Line label={s.checkout.missing} value={formatUsd(missing)} strong tone="danger" />
          )}
          <View className="mt-3 h-2 overflow-hidden rounded-full bg-border">
            {/* Width is a runtime percentage. */}
            <View className={cn('h-full rounded-full', enough ? 'bg-success' : 'bg-gold')} style={{ width: `${covered}%` }} />
          </View>
        </View>

        {paid ? (
          <NoticeBox
            tone="success"
            title={format(s.checkout.successTitle, { name: s.tiers[tier] })}
            body={format(s.checkout.successBody, { slots })}
          />
        ) : !enough || serverMissing !== null ? (
          <NoticeBox
            tone="danger"
            title={s.checkout.notEnoughTitle}
            body={format(s.checkout.notEnoughBody, { amount: formatUsd(serverMissing ?? missing) })}
          />
        ) : buy.isError ? (
          <NoticeBox tone="danger" title={s.common.errorGeneric} />
        ) : null}
      </ScrollView>

      <View className="border-t border-border px-4 py-3">
        {paid ? (
          <Button label={s.common.backHome} fullWidth onPress={() => router.replace('/')} />
        ) : enough && serverMissing === null ? (
          <Button
            label={format(s.checkout.pay, { amount: price })}
            icon={Lock}
            fullWidth
            loading={buy.isPending}
            onPress={() => {
              setPaidFrom(liveBalance);
              buy.mutate({ tier, key: key.get() }, { onSuccess: key.renew });
            }}
          />
        ) : (
          <Button label={s.checkout.makeDeposit} icon={Plus} fullWidth onPress={() => router.push('/deposit')} />
        )}
      </View>
    </>
  );
}
