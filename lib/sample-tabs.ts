import { usd } from './money';
import type { TierKey } from './theme';

/**
 * TEMPORARY example data for the Packages, Team, Wallet and Profile tabs, so the
 * screens can be checked visually. Step 3 replaces this with the mock API through
 * React Query hooks. Amounts are bigint units of $0.0001 (CLAUDE.md §5).
 * Names and numbers are made up — no real customer data.
 */

export const sampleSettings = {
  /**
   * PLACEHOLDER — the owner has not chosen this yet (CLAUDE.md §4.5.2,
   * `package_link_reward_percent`). Only used to show example numbers.
   */
  packageLinkRewardPercent: 40,
  packageLinkSlots: 5,
  inviteReward: 500n, // $0.05
};

export const sampleCatalog: { tier: TierKey; price: bigint }[] = [
  { tier: 'bronze', price: usd(1) },
  { tier: 'silver', price: usd(5) },
  { tier: 'gold', price: usd(10) },
  { tier: 'platinum', price: usd(25) },
  { tier: 'diamond', price: usd(50) },
  { tier: 'royal', price: usd(100) },
];

export type OwnedPackage = {
  id: string;
  tier: TierKey;
  /** Price paid, in $0.0001 units. */
  price: bigint;
  boughtOn: string;
  url: string;
  /** People who bought through this package link — one per used slot (CLAUDE.md §4.5.2). */
  buyers: { name: string; initials: string; date: string }[];
};

const priceOf = (tier: TierKey) => sampleCatalog.find((p) => p.tier === tier)?.price ?? 0n;

/** Packages the sample member owns, each with its own package link. Placeholder domain until the real one is chosen. */
export const sampleOwned: OwnedPackage[] = [
  {
    id: 'p1',
    tier: 'gold',
    price: priceOf('gold'),
    boughtOn: '28 Oct',
    url: 'https://roonpay.example/p/G7K2Q9',
    buyers: [
      { name: 'Sahra Maxamuud', initials: 'SM', date: '5 Nov' },
      { name: 'Khadar Muuse', initials: 'KM', date: '7 Nov' },
      { name: 'Ifrah Nuur', initials: 'IN', date: '11 Nov' },
    ],
  },
  {
    id: 'p2',
    tier: 'bronze',
    price: priceOf('bronze'),
    boughtOn: '1 Nov',
    url: 'https://roonpay.example/p/B4M8X1',
    buyers: [{ name: 'Ahmed Cali', initials: 'AC', date: '3 Nov' }],
  },
  {
    id: 'p3',
    tier: 'silver',
    price: priceOf('silver'),
    boughtOn: '20 Oct',
    url: 'https://roonpay.example/p/S2D5W7',
    buyers: [
      { name: 'Farhan Cumar', initials: 'FC', date: '21 Oct' },
      { name: 'Najma Faarax', initials: 'NF', date: '23 Oct' },
      { name: 'Ubah Cilmi', initials: 'UC', date: '26 Oct' },
      { name: 'Bashiir Xuseen', initials: 'BX', date: '30 Oct' },
      { name: 'Mustafe Siciid', initials: 'MS', date: '2 Nov' },
    ],
  },
];

export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  /** Tier of the package they bought, if any. */
  tier?: TierKey;
  date: string;
  reward: bigint;
};

export const sampleTeam: TeamMember[] = [
  { id: 'm1', name: 'Sahra Maxamuud', initials: 'SM', tier: 'gold', date: '5 Nov', reward: 500n },
  { id: 'm2', name: 'Farhan Cumar', initials: 'FC', tier: 'silver', date: '3 Nov', reward: 500n },
  { id: 'm3', name: 'Ahmed Cali', initials: 'AC', tier: 'bronze', date: '1 Nov', reward: 500n },
  { id: 'm4', name: 'Layla Xasan', initials: 'LX', date: '4 Nov', reward: 0n },
];

export const sampleRank = { rank: 27, toTop: 3, top: 20 };

export type TxKind = 'invite' | 'link' | 'daily' | 'purchase' | 'deposit' | 'withdrawal';
export type TxStatus = 'credited' | 'pending' | 'paid' | 'approved' | 'rejected';

export type Tx = {
  id: string;
  kind: TxKind;
  /** Signed: money in > 0, money out < 0. */
  amount: bigint;
  status: TxStatus;
  when: string;
  name?: string;
  tier?: TierKey;
  day?: number;
  method?: string;
  ref?: string;
  number?: string;
};

export const sampleWallet = {
  available: 123000n, // $12.30
  locked: 0n,
  inviteRewards: 1500n, // $0.15
  dailyRewards: 3000n, // $0.30
  withdrawn: 100000n, // $10.00
  history: [
    { id: 't1', kind: 'invite', amount: 500n, status: 'credited', when: 'Today 14:30', name: 'Sahra' },
    { id: 't2', kind: 'deposit', amount: 50000n, status: 'pending', when: 'Today 11:05', method: 'EVC Plus', ref: 'EV82K1' },
    { id: 't3', kind: 'daily', amount: 143n, status: 'credited', when: 'Today 09:12', day: 3 },
    { id: 't4', kind: 'link', amount: 40000n, status: 'credited', when: '4 Nov', name: 'Cabdi', tier: 'gold' },
    { id: 't5', kind: 'invite', amount: 500n, status: 'credited', when: '3 Nov', name: 'Farhan' },
    { id: 't6', kind: 'withdrawal', amount: -100000n, status: 'paid', when: '2 Nov', method: 'Zaad', ref: 'TX123', number: '063 ••• 7781' },
    { id: 't7', kind: 'purchase', amount: -10000n, status: 'credited', when: '2 Nov', tier: 'bronze' },
    { id: 't8', kind: 'invite', amount: 500n, status: 'credited', when: '1 Nov', name: 'Ahmed' },
    { id: 't9', kind: 'purchase', amount: -100000n, status: 'credited', when: '28 Oct', tier: 'gold' },
    { id: 't10', kind: 'deposit', amount: 250000n, status: 'approved', when: '27 Oct', method: 'Zaad', ref: 'ZD55P0' },
  ] satisfies Tx[] as Tx[],
};

export const sampleProfile = {
  name: 'Maxamed Yaxaye',
  initials: 'MY',
  // Made-up address on a reserved test domain — not a real person.
  email: 'maxamed@roonpay.example',
  withdrawalNumber: 'Zaad · 063 412 7781',
};

/** Where members send deposits (CLAUDE.md §4.3). PLACEHOLDER numbers — the owner fills in the real ones in admin. */
export type MobileMethod = 'zaad' | 'evc' | 'edahab' | 'sahal';
export const sampleDepositAccounts = {
  mobile: [
    { key: 'zaad', name: 'Zaad', merchant: '000 000', merchantName: 'RoonPay Ltd' },
    { key: 'evc', name: 'EVC Plus', merchant: '000 001', merchantName: 'RoonPay Ltd' },
    { key: 'edahab', name: 'eDahab', merchant: '000 002', merchantName: 'RoonPay Ltd' },
    { key: 'sahal', name: 'Sahal', merchant: '000 003', merchantName: 'RoonPay Ltd' },
  ] satisfies { key: MobileMethod; name: string; merchant: string; merchantName: string }[],
  banks: [
    { key: 'salaam', name: 'Salaam Bank', short: 'SB', accountName: 'RoonPay Ltd', accountNumber: '0000 0000 0000', branch: 'Hargeisa main branch' },
    { key: 'other', name: 'Other bank', short: '+', accountName: 'RoonPay Ltd', accountNumber: '0000 0000 0001', branch: 'Hargeisa' },
  ],
};

/** Withdrawal settings (CLAUDE.md §4.7) — admin-editable, sample values from the design. */
export const sampleWithdrawSettings = {
  minimum: usd(10),
  dailyLimit: usd(200),
  method: 'Zaad',
  number: '063 412 7781',
};

export type LeaderPeriod = 'week' | 'month' | 'all';
export type Leader = { rank: number; name: string; initials: string; tier: TierKey; invites: number };

const monthLeaders: Leader[] = [
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

/** Sample only: week and all-time reuse the month list with other counts. */
export const sampleLeaderboard: Record<LeaderPeriod, { leaders: Leader[]; me: { rank: number; invites: number; toTop: number } }> = {
  week: { leaders: monthLeaders.map((l) => ({ ...l, invites: Math.max(1, Math.round(l.invites / 4)) })), me: { rank: 41, invites: 1, toTop: 2 } },
  month: { leaders: monthLeaders, me: { rank: 27, invites: 3, toTop: 3 } },
  all: { leaders: monthLeaders.map((l) => ({ ...l, invites: l.invites * 5 })), me: { rank: 88, invites: 4, toTop: 51 } },
};

export type NotificationKind = 'inviteReward' | 'linkSale' | 'dailyReady' | 'slotsLow' | 'rank' | 'withdrawalPaid' | 'newLogin' | 'packageActive';
export type SampleNotification = {
  id: string;
  kind: NotificationKind;
  /** Values for the message template in i18n `notifications.<kind>Body`. */
  values: Record<string, string | number>;
  /** Amount values in $0.0001 units, formatted on screen. */
  amount?: bigint;
  tier?: TierKey;
  time: string;
  today: boolean;
  unread: boolean;
};

export const sampleNotifications: SampleNotification[] = [
  { id: 'n1', kind: 'inviteReward', values: { name: 'Sahra' }, amount: 500n, time: '14:30', today: true, unread: true },
  { id: 'n2', kind: 'dailyReady', values: {}, amount: 143n, time: '09:00', today: true, unread: true },
  { id: 'n3', kind: 'slotsLow', values: { count: 2 }, tier: 'gold', time: '14:31', today: true, unread: false },
  { id: 'n4', kind: 'rank', values: { rank: 27 }, time: '14:32', today: true, unread: false },
  { id: 'n5', kind: 'linkSale', values: { name: 'Cabdi' }, amount: 40000n, tier: 'gold', time: '4 Nov', today: false, unread: false },
  { id: 'n6', kind: 'withdrawalPaid', values: { number: '063 ••• 7781', ref: 'TX123' }, amount: 100000n, time: '2 Nov', today: false, unread: false },
  { id: 'n7', kind: 'newLogin', values: { device: 'Samsung A54' }, time: '30 Oct', today: false, unread: false },
  { id: 'n8', kind: 'packageActive', values: {}, tier: 'gold', time: '28 Oct', today: false, unread: false },
];
