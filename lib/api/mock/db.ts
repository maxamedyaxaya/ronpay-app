import { usd } from '@/lib/money';
import type { TierKey } from '@/lib/theme';

import type { CatalogItem, DepositAccounts, Leader, NotificationKind, Settings } from '../types';

/**
 * The mock server's memory. It lives only while the app runs (a reload starts fresh).
 * Names and numbers are made up — no real customer data. Account numbers are placeholders.
 */

export type LedgerType =
  | 'DEPOSIT'
  | 'PACKAGE_PURCHASE'
  | 'REFERRAL_REWARD'
  | 'PACKAGE_LINK_REWARD'
  | 'DAILY_REWARD'
  | 'WITHDRAWAL'
  | 'WITHDRAWAL_REVERSAL';

/** One row of the `transactions` ledger. The balance is always the sum of these (CLAUDE.md §4.2). */
export type LedgerEntry = {
  id: string;
  type: LedgerType;
  /** Signed, in $0.0001 units. */
  amount: bigint;
  at: Date;
  name?: string;
  tier?: TierKey;
  day?: number;
  refId?: string;
};

export type DepositRow = {
  id: string;
  method: string;
  methodName: string;
  amount: bigint;
  payer: string;
  reference: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  at: Date;
};

export type WithdrawalRow = {
  id: string;
  method: string;
  number: string;
  amount: bigint;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  payoutRef?: string;
  at: Date;
};

export type PackageRow = {
  id: string;
  tier: TierKey;
  price: bigint;
  boughtAt: Date;
  code: string;
  buyers: { name: string; initials: string; at: Date }[];
};

export type TeamRow = { id: string; name: string; initials: string; tier?: TierKey; joinedAt: Date; reward: bigint };

export type NotificationRow = {
  id: string;
  kind: NotificationKind;
  values: Record<string, string | number>;
  amount?: bigint;
  tier?: TierKey;
  at: Date;
  unread: boolean;
};

/** A time `days` ago at hh:mm (local time). */
export function ago(days: number, hh = 10, mm = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hh, mm, 0, 0);
  return d;
}

/** 0 = Monday … 6 = Sunday. */
export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7;
export const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

const settings: Settings = {
  // Starting value from the client's design ($1 → $0.90). Admin-editable later.
  packageLinkRewardPercent: 90,
  packageLinkSlots: 5,
  inviteReward: 500n, // $0.05
};

const catalog: CatalogItem[] = [
  { tier: 'bronze', price: usd(1) },
  { tier: 'silver', price: usd(5) },
  { tier: 'gold', price: usd(10) },
  { tier: 'platinum', price: usd(25) },
  { tier: 'diamond', price: usd(50) },
  { tier: 'royal', price: usd(100) },
];
const priceOf = (tier: TierKey) => catalog.find((c) => c.tier === tier)?.price ?? 0n;
const linkReward = (tier: TierKey) => (priceOf(tier) * BigInt(settings.packageLinkRewardPercent)) / 100n;

/** PLACEHOLDER numbers — the owner fills in the real ones in admin. */
const depositAccounts: DepositAccounts = {
  mobile: [
    { key: 'zaad', name: 'Zaad', merchant: '000 000', merchantName: 'Ronpay Ltd' },
    { key: 'evc', name: 'EVC Plus', merchant: '000 001', merchantName: 'Ronpay Ltd' },
    { key: 'edahab', name: 'eDahab', merchant: '000 002', merchantName: 'Ronpay Ltd' },
    { key: 'sahal', name: 'Sahal', merchant: '000 003', merchantName: 'Ronpay Ltd' },
  ],
  banks: [
    { key: 'salaam', name: 'Salaam Bank', short: 'SB', accountName: 'Ronpay Ltd', accountNumber: '0000 0000 0000', branch: 'Hargeisa main branch' },
    { key: 'other', name: 'Other bank', short: '+', accountName: 'Ronpay Ltd', accountNumber: '0000 0000 0001', branch: 'Hargeisa' },
  ],
};

const leaders: Omit<Leader, 'earned'>[] = [
  { rank: 1, name: 'Cabdi', initials: 'CR', tier: 'royal', invites: 31 },
  { rank: 2, name: 'Hodan', initials: 'HJ', tier: 'diamond', invites: 26 },
  { rank: 3, name: 'Yuusuf', initials: 'YA', tier: 'platinum', invites: 22 },
  { rank: 4, name: 'Ifrah Nuur', initials: 'IN', tier: 'gold', invites: 18 },
  { rank: 5, name: 'Khadar Muuse', initials: 'KM', tier: 'gold', invites: 17 },
  { rank: 6, name: 'Najma Faarax', initials: 'NF', tier: 'silver', invites: 15 },
  { rank: 7, name: 'Bashiir Xuseen', initials: 'BX', tier: 'platinum', invites: 14 },
  { rank: 8, name: 'Ubah Cilmi', initials: 'UC', tier: 'bronze', invites: 12 },
  { rank: 9, name: 'Mustafe Siciid', initials: 'MS', tier: 'silver', invites: 11 },
];

function seed() {
  let n = 0;
  const id = (p: string) => `${p}${++n}`;

  const packages: PackageRow[] = [
    {
      id: 'p1',
      tier: 'silver',
      price: priceOf('silver'),
      boughtAt: ago(26, 9, 40),
      code: 'S2D5W7',
      buyers: [
        { name: 'Najma Faarax', initials: 'NF', at: ago(25, 12, 5) },
        { name: 'Ubah Cilmi', initials: 'UC', at: ago(23, 16, 20) },
        { name: 'Bashiir Xuseen', initials: 'BX', at: ago(20, 11, 0) },
        { name: 'Mustafe Siciid', initials: 'MS', at: ago(17, 19, 45) },
        { name: 'Cabdi Rooble', initials: 'CR', at: ago(14, 8, 30) },
      ],
    },
    {
      id: 'p2',
      tier: 'gold',
      price: priceOf('gold'),
      boughtAt: ago(19, 13, 10),
      code: 'G7K2Q9',
      buyers: [
        { name: 'Khadar Muuse', initials: 'KM', at: ago(11, 10, 15) },
        { name: 'Ifrah Nuur', initials: 'IN', at: ago(9, 18, 2) },
        { name: 'Hodan Jaamac', initials: 'HJ', at: ago(5, 14, 31) },
      ],
    },
    {
      id: 'p3',
      tier: 'bronze',
      price: priceOf('bronze'),
      boughtAt: ago(15, 17, 0),
      code: 'B4M8X1',
      buyers: [{ name: 'Yuusuf Aadan', initials: 'YA', at: ago(13, 9, 50) }],
    },
  ];

  const team: TeamRow[] = [
    { id: 'm1', name: 'Sahra Maxamuud', initials: 'SM', tier: 'gold', joinedAt: ago(2, 14, 30), reward: settings.inviteReward },
    { id: 'm2', name: 'Farhan Cumar', initials: 'FC', tier: 'silver', joinedAt: ago(13, 15, 0), reward: settings.inviteReward },
    { id: 'm3', name: 'Ahmed Cali', initials: 'AC', tier: 'bronze', joinedAt: ago(15, 11, 0), reward: settings.inviteReward },
    { id: 'm4', name: 'Layla Xasan', initials: 'LX', joinedAt: ago(1, 20, 10), reward: 0n },
  ];

  const deposits: DepositRow[] = [
    { id: 'd1', method: 'mobile:evc', methodName: 'EVC Plus', amount: usd(5), payer: '061 000 0000', reference: 'EV11A2', status: 'APPROVED', at: ago(27, 18, 0) },
    { id: 'd2', method: 'mobile:zaad', methodName: 'Zaad', amount: usd(25), payer: '063 000 0000', reference: 'ZD55P0', status: 'APPROVED', at: ago(20, 9, 0) },
    { id: 'd3', method: 'mobile:evc', methodName: 'EVC Plus', amount: usd(5), payer: '061 000 0000', reference: 'EV82K1', status: 'PENDING', at: ago(0, 11, 5) },
  ];

  const withdrawals: WithdrawalRow[] = [
    { id: 'w1', method: 'Zaad', number: '063 ••• 7781', amount: usd(10), status: 'PAID', payoutRef: 'TX123', at: ago(12, 16, 40) },
    // Chosen so the ledger adds up to the brief's sample balance of $12.30 (plus any daily rewards this week).
    { id: 'w2', method: 'Zaad', number: '063 ••• 7781', amount: 422500n, status: 'PAID', payoutRef: 'TX131', at: ago(7, 12, 0) },
  ];

  const ledger: LedgerEntry[] = [];
  const add = (e: Omit<LedgerEntry, 'id'>) => ledger.push({ id: id('l'), ...e });

  for (const d of deposits) if (d.status === 'APPROVED') add({ type: 'DEPOSIT', amount: d.amount, at: d.at, refId: d.id });
  for (const p of packages) {
    add({ type: 'PACKAGE_PURCHASE', amount: -p.price, at: p.boughtAt, tier: p.tier, refId: p.id });
    for (const b of p.buyers) add({ type: 'PACKAGE_LINK_REWARD', amount: linkReward(p.tier), at: b.at, name: b.name, tier: p.tier, refId: p.id });
  }
  for (const m of team) if (m.tier) add({ type: 'REFERRAL_REWARD', amount: m.reward, at: m.joinedAt, name: m.name.split(' ')[0] });
  for (const w of withdrawals) add({ type: 'WITHDRAWAL', amount: -w.amount, at: w.at, refId: w.id });

  // Daily reward: every earlier day of this week was claimed (today is still open).
  const weeklyTotal = 1000n; // $0.10
  const dailyAmount = (weeklyTotal * 2n + 7n) / 14n; // ÷ 7, rounded to 4 decimals → 143 ($0.0143)
  const today = weekdayIndex(new Date());
  const dailyClaims: string[] = [];
  for (let i = 0; i < today; i++) {
    const at = ago(today - i, 8, 15);
    dailyClaims.push(dayKey(at));
    add({ type: 'DAILY_REWARD', amount: dailyAmount, at, day: i + 1 });
  }

  const notifications: NotificationRow[] = [
    { id: 'n1', kind: 'inviteReward', values: { name: 'Sahra' }, amount: settings.inviteReward, at: ago(2, 14, 30), unread: true },
    { id: 'n2', kind: 'dailyReady', values: {}, amount: dailyAmount, at: ago(0, 9, 0), unread: true },
    { id: 'n3', kind: 'slotsLow', values: { count: 2 }, tier: 'gold', at: ago(5, 14, 31), unread: false },
    { id: 'n4', kind: 'linkSale', values: { name: 'Hodan' }, amount: linkReward('gold'), tier: 'gold', at: ago(5, 14, 31), unread: false },
    { id: 'n5', kind: 'withdrawalPaid', values: { number: '063 ••• 7781', ref: 'TX123' }, amount: usd(10), at: ago(12, 16, 40), unread: false },
    { id: 'n6', kind: 'packageActive', values: {}, tier: 'gold', at: ago(19, 13, 10), unread: false },
  ];

  return {
    settings,
    catalog,
    depositAccounts,
    withdraw: { minimum: usd(10), dailyLimit: usd(200) },
    weeklyTotal,
    dailyAmount,
    profile: {
      name: 'Maxamed Yaxaye',
      initials: 'MY',
      // Made-up address on a reserved test domain — not a real person.
      email: 'maxamed@roonpay.example',
      emailConfirmed: true,
      withdrawMethod: 'Zaad',
      withdrawNumber: '063 412 7781',
      /** Mock only: the real PIN is checked by the server and never stored in the app. */
      pin: '1234',
    },
    ledger,
    deposits,
    withdrawals,
    packages,
    team,
    dailyClaims,
    notifications,
    leaders,
    /** Idempotency-Key → saved result, so a repeated request never runs twice (CLAUDE.md §5). */
    idempotency: new Map<string, unknown>(),
    nextId: (p: string) => id(p),
  };
}

export type Db = ReturnType<typeof seed>;
export const db: Db = seed();
