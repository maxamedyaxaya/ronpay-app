import { ArrowUpRight, Gift, Hexagon, Link2, Plus, UserPlus, type LucideIcon } from 'lucide-react-native';

import { ActivityRow, type ActivityRowProps, type ActivityTone } from '@/components/ui';
import type { Tx, TxKind, TxStatus } from '@/lib/api';
import { relativeDate } from '@/lib/dates';
import { format, useStrings } from '@/lib/i18n';
import { formatUsd } from '@/lib/money';

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

/** Title and subtitle of one history line (also used by the Wallet search). */
export function useTxText() {
  const s = useStrings();
  return (t: Tx) => {
    const tier = t.tier ? s.tiers[t.tier] : '';
    const when = relativeDate(t.at);
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
        return {
          title: format(s.wallet.txDeposit, { method: t.method ?? '' }),
          subtitle: format(s.wallet.txDepositSub, { ref: t.ref ?? '', when }),
        };
      case 'withdrawal':
        return {
          title: format(s.wallet.txWithdrawal, { method: t.method ?? '' }),
          subtitle: t.ref
            ? format(s.wallet.txWithdrawalSub, { number: t.number ?? '', ref: t.ref, when })
            : format(s.wallet.txWithdrawalSubNoRef, { number: t.number ?? '', when }),
        };
    }
  };
}

export type TxRowProps = { tx: Tx; title: string; subtitle: string; divider?: boolean };

export function TxRow({ tx, title, subtitle, divider }: TxRowProps) {
  const s = useStrings();
  const statusLabel: Record<TxStatus, string> = {
    credited: s.wallet.credited,
    approved: s.status.approved,
    paid: s.status.paid,
    pending: s.status.pending,
    rejected: s.status.rejected,
  };
  return (
    <ActivityRow
      icon={look[tx.kind].icon}
      tone={look[tx.kind].tone}
      title={title}
      subtitle={subtitle}
      amount={formatUsd(tx.amount, { sign: true })}
      direction={tx.amount > 0n ? 'in' : 'out'}
      status={tx.kind === 'purchase' ? undefined : statusLabel[tx.status]}
      statusTone={statusTone[tx.status]}
      divider={divider}
    />
  );
}
