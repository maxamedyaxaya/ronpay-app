import type { TierKey } from '@/lib/theme';

/**
 * What the app receives from the API. The mock server (lib/api/mock) returns exactly these
 * shapes, so swapping in the real backend later does not change any screen.
 * Money is always bigint in $0.0001 units (CLAUDE.md §5). Times are ISO strings.
 */

export type Settings = {
  /** `package_link_reward_percent` (CLAUDE.md §4.5.2). */
  packageLinkRewardPercent: number;
  /** `package_link_slots`. */
  packageLinkSlots: number;
  /** `invite_reward_amount`. */
  inviteReward: bigint;
};

export type CatalogItem = { tier: TierKey; price: bigint };

export type MobileMethod = 'zaad' | 'evc' | 'edahab' | 'sahal';
export type DepositAccounts = {
  mobile: { key: MobileMethod; name: string; merchant: string; merchantName: string }[];
  banks: { key: string; name: string; short: string; accountName: string; accountNumber: string; branch: string }[];
};

export type WithdrawSettings = { minimum: bigint; dailyLimit: bigint };

export type Config = {
  settings: Settings;
  catalog: CatalogItem[];
  depositAccounts: DepositAccounts;
  withdraw: WithdrawSettings;
};

export type Profile = {
  name: string;
  initials: string;
  email: string;
  emailConfirmed: boolean;
  withdrawMethod: string;
  withdrawNumber: string;
};

export type OwnedPackage = {
  id: string;
  tier: TierKey;
  price: bigint;
  boughtAt: string;
  url: string;
  /** One buyer per used slot of the package link. */
  buyers: { name: string; initials: string; at: string }[];
};

export type TxKind = 'invite' | 'link' | 'daily' | 'purchase' | 'deposit' | 'withdrawal';
export type TxStatus = 'credited' | 'pending' | 'paid' | 'approved' | 'rejected';

/** One line in the wallet history. */
export type Tx = {
  id: string;
  kind: TxKind;
  /** Signed: money in > 0, money out < 0. */
  amount: bigint;
  status: TxStatus;
  at: string;
  name?: string;
  tier?: TierKey;
  day?: number;
  method?: string;
  ref?: string;
  number?: string;
};

export type Wallet = {
  /** Spendable now (ledger total). */
  available: bigint;
  /** Held by withdrawals that are not paid or rejected yet. */
  locked: bigint;
  pendingDeposits: bigint;
  inviteRewards: bigint;
  linkRewards: bigint;
  dailyRewards: bigint;
  withdrawn: bigint;
  history: Tx[];
};

export type DailyReward = {
  weeklyTotal: bigint;
  dailyAmount: bigint;
  /** 0 = Monday … 6 = Sunday. */
  todayIndex: number;
  claimedToday: boolean;
  /** Days of this week already claimed (0–6). */
  claimedDays: number[];
  /** Needs at least one active package (CLAUDE.md §4.6). */
  canClaim: boolean;
};

export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  /** Tier of the first package they bought, if any. */
  tier?: TierKey;
  joinedAt: string;
  reward: bigint;
};

export type Team = {
  members: TeamMember[];
  rank: { rank: number; toTop: number; top: number };
};

export type Home = {
  member: { fullName: string; initials: string };
  unreadNotifications: boolean;
  wallet: Pick<Wallet, 'available' | 'pendingDeposits'> & { totalEarned: bigint };
  stats: { packages: number; confirmedReferrals: number; referralRewards: bigint; invited: number };
  daily: DailyReward;
  packages: OwnedPackage[];
  activity: Tx[];
};

export type LeaderPeriod = 'week' | 'month' | 'all';
export type Leader = { rank: number; name: string; initials: string; tier: TierKey; invites: number; earned: bigint };
export type Leaderboard = { leaders: Leader[]; me: { rank: number; invites: number; earned: bigint; toTop: number } };

export type NotificationKind =
  | 'inviteReward'
  | 'linkSale'
  | 'dailyReady'
  | 'slotsLow'
  | 'rank'
  | 'withdrawalPaid'
  | 'withdrawalRequested'
  | 'depositApproved'
  | 'newLogin'
  | 'packageActive';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  /** Values for the message template in i18n `notifications.<kind>Body`. */
  values: Record<string, string | number>;
  amount?: bigint;
  tier?: TierKey;
  at: string;
  unread: boolean;
};

// ---- Requests ----

export type DepositRequest = {
  /** e.g. "mobile:zaad" or "bank:salaam". */
  method: string;
  amount: bigint;
  payer: string;
  reference: string;
  receiptUri?: string;
};

export type WithdrawRequest = { amount: bigint; pin: string };
