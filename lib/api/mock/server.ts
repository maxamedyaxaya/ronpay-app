import type { TierKey } from '@/lib/theme';

import { ApiError } from '../errors';
import type {
  AppNotification,
  Config,
  DailyReward,
  DepositRequest,
  Home,
  LeaderPeriod,
  Leaderboard,
  OwnedPackage,
  Profile,
  Team,
  Tx,
  Wallet,
  WithdrawRequest,
} from '../types';
import { ago, db, dayKey, weekdayIndex, type LedgerEntry, type PackageRow, type WithdrawalRow } from './db';

/**
 * Pretend server. Each function follows the money rules of CLAUDE.md §4–§5 the same way the
 * real API will, so screens behave the same when the backend arrives:
 *  - the balance is the sum of the ledger, never a stored number;
 *  - every money action checks first, then writes all its changes together;
 *  - money actions take an Idempotency-Key and never run twice for the same key.
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Fake network delay so loading states can be seen. */
const delay = () => sleep(250 + Math.floor(Math.random() * 350));

const iso = (d: Date) => d.toISOString();
const sum = (xs: bigint[]) => xs.reduce((a, b) => a + b, 0n);

/** Ledger total = what the member can spend. Withdrawals are written when requested, so locked money is already out. */
const balance = () => sum(db.ledger.map((e) => e.amount));
const sumType = (type: LedgerEntry['type']) => sum(db.ledger.filter((e) => e.type === type).map((e) => e.amount));

/** Runs a money action at most once per Idempotency-Key (a repeated key returns the first result). */
async function once<T>(key: string, run: () => T): Promise<T> {
  const saved = db.idempotency.get(key) as Promise<T> | undefined;
  if (saved) return saved;
  const p = delay().then(run);
  db.idempotency.set(key, p);
  // A failed request may be tried again with the same key.
  p.catch(() => db.idempotency.delete(key));
  return p;
}

function notify(n: Omit<AppNotification, 'id' | 'at' | 'unread'>) {
  db.notifications.unshift({ ...n, id: db.nextId('n'), at: new Date(), unread: true });
}

function newCode(tier: TierKey) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = tier[0].toUpperCase();
  for (let i = 0; i < 5; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

// ---------- Mapping rows → API shapes ----------

const toPackage = (p: PackageRow): OwnedPackage => ({
  id: p.id,
  tier: p.tier,
  price: p.price,
  boughtAt: iso(p.boughtAt),
  // Placeholder domain until the real one is chosen.
  url: `https://roonpay.example/p/${p.code}`,
  buyers: p.buyers.map((b) => ({ name: b.name, initials: b.initials, at: iso(b.at) })),
});

const withdrawalStatus: Record<WithdrawalRow['status'], Tx['status']> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
  REJECTED: 'rejected',
};

function history(): Tx[] {
  const rows: (Tx & { sort: Date })[] = [];
  for (const e of db.ledger) {
    const base = { id: e.id, amount: e.amount, at: iso(e.at), sort: e.at };
    switch (e.type) {
      case 'DEPOSIT': {
        const d = db.deposits.find((x) => x.id === e.refId);
        rows.push({ ...base, kind: 'deposit', status: 'approved', method: d?.methodName, ref: d?.reference });
        break;
      }
      case 'PACKAGE_PURCHASE':
        rows.push({ ...base, kind: 'purchase', status: 'credited', tier: e.tier });
        break;
      case 'REFERRAL_REWARD':
        rows.push({ ...base, kind: 'invite', status: 'credited', name: e.name });
        break;
      case 'PACKAGE_LINK_REWARD':
        rows.push({ ...base, kind: 'link', status: 'credited', name: e.name?.split(' ')[0], tier: e.tier });
        break;
      case 'DAILY_REWARD':
        rows.push({ ...base, kind: 'daily', status: 'credited', day: e.day });
        break;
      case 'WITHDRAWAL': {
        const w = db.withdrawals.find((x) => x.id === e.refId);
        rows.push({
          ...base,
          kind: 'withdrawal',
          status: w ? withdrawalStatus[w.status] : 'pending',
          method: w?.method,
          ref: w?.payoutRef,
          number: w?.number,
        });
        break;
      }
      case 'WITHDRAWAL_REVERSAL':
        // Shown through the withdrawal line itself ("Rejected"), not as its own line.
        break;
    }
  }
  // Deposits that are not approved have no ledger entry yet, but the member still sees them.
  for (const d of db.deposits) {
    if (d.status === 'APPROVED') continue;
    rows.push({
      id: d.id,
      kind: 'deposit',
      amount: d.amount,
      status: d.status === 'PENDING' ? 'pending' : 'rejected',
      at: iso(d.at),
      sort: d.at,
      method: d.methodName,
      ref: d.reference,
    });
  }
  rows.sort((a, b) => b.sort.getTime() - a.sort.getTime());
  return rows.map(({ sort: _sort, ...tx }) => tx);
}

function daily(): DailyReward {
  const now = new Date();
  const todayIndex = weekdayIndex(now);
  const claimedDays: number[] = [];
  for (let i = 0; i <= todayIndex; i++) if (db.dailyClaims.includes(dayKey(ago(todayIndex - i)))) claimedDays.push(i);
  return {
    weeklyTotal: db.weeklyTotal,
    dailyAmount: db.dailyAmount,
    todayIndex,
    claimedToday: db.dailyClaims.includes(dayKey(now)),
    claimedDays,
    canClaim: db.packages.length > 0,
  };
}

function wallet(): Wallet {
  const open = db.withdrawals.filter((w) => w.status === 'PENDING' || w.status === 'APPROVED');
  return {
    available: balance(),
    locked: sum(open.map((w) => w.amount)),
    pendingDeposits: sum(db.deposits.filter((d) => d.status === 'PENDING').map((d) => d.amount)),
    inviteRewards: sumType('REFERRAL_REWARD'),
    linkRewards: sumType('PACKAGE_LINK_REWARD'),
    dailyRewards: sumType('DAILY_REWARD'),
    withdrawn: sum(db.withdrawals.filter((w) => w.status === 'PAID').map((w) => w.amount)),
    history: history(),
  };
}

// ---------- Reads ----------

export async function getConfig(): Promise<Config> {
  await delay();
  return { settings: db.settings, catalog: db.catalog, depositAccounts: db.depositAccounts, withdraw: db.withdraw };
}

export async function getProfile(): Promise<Profile> {
  await delay();
  const { pin: _pin, ...profile } = db.profile;
  return profile;
}

export async function getWallet(): Promise<Wallet> {
  await delay();
  return wallet();
}

export async function getPackages(): Promise<OwnedPackage[]> {
  await delay();
  return [...db.packages].sort((a, b) => b.boughtAt.getTime() - a.boughtAt.getTime()).map(toPackage);
}

export async function getPackage(id: string): Promise<OwnedPackage> {
  await delay();
  const p = db.packages.find((x) => x.id === id);
  if (!p) throw new ApiError('NOT_FOUND', 'Package not found');
  return toPackage(p);
}

export async function getDaily(): Promise<DailyReward> {
  await delay();
  return daily();
}

export async function getHome(): Promise<Home> {
  await delay();
  const w = wallet();
  return {
    member: { fullName: db.profile.name, initials: db.profile.initials },
    unreadNotifications: db.notifications.some((n) => n.unread),
    wallet: {
      available: w.available,
      pendingDeposits: w.pendingDeposits,
      totalEarned: w.inviteRewards + w.linkRewards + w.dailyRewards,
    },
    stats: {
      packages: db.packages.length,
      confirmedReferrals: db.team.filter((m) => m.tier).length,
      referralRewards: w.inviteRewards,
      invited: db.team.length,
    },
    daily: daily(),
    packages: [...db.packages].sort((a, b) => b.boughtAt.getTime() - a.boughtAt.getTime()).map(toPackage),
    activity: w.history.slice(0, 3),
  };
}

export async function getTeam(): Promise<Team> {
  await delay();
  return {
    members: [...db.team]
      .sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime())
      .map((m) => ({ id: m.id, name: m.name, initials: m.initials, tier: m.tier, joinedAt: iso(m.joinedAt), reward: m.reward })),
    rank: { rank: 27, toTop: 3, top: 20 },
  };
}

export async function getLeaderboard(period: LeaderPeriod): Promise<Leaderboard> {
  await delay();
  // Sample only: week and all-time reuse the month list with other counts.
  const scale = (n: number) => (period === 'week' ? Math.max(1, Math.round(n / 4)) : period === 'all' ? n * 5 : n);
  const reward = db.settings.inviteReward;
  const leaders = db.leaders.map((l) => {
    const invites = scale(l.invites);
    return { ...l, invites, earned: BigInt(invites) * reward };
  });
  const confirmed = db.team.filter((m) => m.tier).length;
  const mine = period === 'week' ? 1 : confirmed;
  const me = { week: { rank: 41, toTop: 2 }, month: { rank: 27, toTop: 3 }, all: { rank: 88, toTop: 51 } }[period];
  return { leaders, me: { ...me, invites: mine, earned: BigInt(mine) * reward } };
}

export async function getNotifications(): Promise<AppNotification[]> {
  await delay();
  return db.notifications.map((n) => ({ ...n, at: iso(n.at) }));
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay();
  const n = db.notifications.find((x) => x.id === id);
  if (n) n.unread = false;
}

export async function markAllNotificationsRead(): Promise<void> {
  await delay();
  for (const n of db.notifications) n.unread = false;
}

// ---------- Money actions ----------

/** Buy a package from the wallet (CLAUDE.md §4.4). */
export function buyPackage(tier: TierKey, idempotencyKey: string): Promise<OwnedPackage> {
  return once(idempotencyKey, () => {
    const item = db.catalog.find((c) => c.tier === tier);
    if (!item) throw new ApiError('NOT_FOUND', 'Package not found');
    const available = balance();
    if (available < item.price) {
      throw new ApiError('INSUFFICIENT_BALANCE', 'Not enough balance', { missing: item.price - available });
    }
    const now = new Date();
    const row: PackageRow = { id: db.nextId('p'), tier, price: item.price, boughtAt: now, code: newCode(tier), buyers: [] };
    // Purchase, new package (with its 5-slot link) and notification are written together.
    db.ledger.push({ id: db.nextId('l'), type: 'PACKAGE_PURCHASE', amount: -item.price, at: now, tier, refId: row.id });
    db.packages.push(row);
    notify({ kind: 'packageActive', values: {}, tier });
    return toPackage(row);
  });
}

/** Send a deposit for review (CLAUDE.md §4.3). It stays PENDING until an admin approves it. */
export function submitDeposit(req: DepositRequest, idempotencyKey: string): Promise<{ id: string }> {
  return once(idempotencyKey, () => {
    const reference = req.reference.trim().toUpperCase();
    if (req.amount <= 0n || !req.payer.trim() || !reference) throw new ApiError('INVALID_INPUT', 'Missing details');
    // (method, reference) is unique, so one payment can never be credited twice.
    if (db.deposits.some((d) => d.method === req.method && d.reference === reference)) {
      throw new ApiError('DUPLICATE_REFERENCE', 'This reference was already sent');
    }
    const [group, key] = req.method.split(':');
    const accounts = group === 'bank' ? db.depositAccounts.banks : db.depositAccounts.mobile;
    const methodName = accounts.find((a) => a.key === key)?.name ?? req.method;
    const id = db.nextId('d');
    db.deposits.push({ id, method: req.method, methodName, amount: req.amount, payer: req.payer.trim(), reference, status: 'PENDING', at: new Date() });
    return { id };
  });
}

/** Ask for a withdrawal (CLAUDE.md §4.7). The amount leaves the available balance at once (locked). */
export function requestWithdrawal(req: WithdrawRequest, idempotencyKey: string): Promise<{ id: string }> {
  return once(idempotencyKey, () => {
    if (!db.profile.emailConfirmed) throw new ApiError('EMAIL_NOT_CONFIRMED', 'Confirm your email first');
    if (req.pin !== db.profile.pin) throw new ApiError('WRONG_PIN', 'Wrong PIN');
    if (req.amount < db.withdraw.minimum) throw new ApiError('BELOW_MINIMUM', 'Below the minimum', { minimum: db.withdraw.minimum });
    const today = dayKey(new Date());
    const usedToday = sum(
      db.withdrawals.filter((w) => w.status !== 'REJECTED' && dayKey(w.at) === today).map((w) => w.amount),
    );
    if (usedToday + req.amount > db.withdraw.dailyLimit) {
      throw new ApiError('ABOVE_DAILY_LIMIT', 'Above the daily limit', { left: db.withdraw.dailyLimit - usedToday });
    }
    const available = balance();
    if (available < req.amount) {
      throw new ApiError('INSUFFICIENT_BALANCE', 'Not enough balance', { missing: req.amount - available });
    }
    const now = new Date();
    const id = db.nextId('w');
    const last4 = db.profile.withdrawNumber.replace(/\D/g, '').slice(-4);
    db.withdrawals.push({ id, method: db.profile.withdrawMethod, number: `••• ${last4}`, amount: req.amount, status: 'PENDING', at: now });
    db.ledger.push({ id: db.nextId('l'), type: 'WITHDRAWAL', amount: -req.amount, at: now, refId: id });
    notify({ kind: 'withdrawalRequested', values: { method: db.profile.withdrawMethod }, amount: req.amount });
    return { id };
  });
}

/** Claim today's daily reward (CLAUDE.md §4.6): one per member per calendar day. */
export function claimDaily(idempotencyKey: string): Promise<{ amount: bigint }> {
  return once(idempotencyKey, () => {
    if (db.packages.length === 0) throw new ApiError('NO_ACTIVE_PACKAGE', 'Buy a package first');
    const now = new Date();
    const key = dayKey(now);
    if (db.dailyClaims.includes(key)) throw new ApiError('ALREADY_CLAIMED', 'Already claimed today');
    db.dailyClaims.push(key);
    db.ledger.push({ id: db.nextId('l'), type: 'DAILY_REWARD', amount: db.dailyAmount, at: now, day: weekdayIndex(now) + 1 });
    return { amount: db.dailyAmount };
  });
}

// ---------- Pretend admin (for trying flows in the app; not part of the member API) ----------

export const mockAdmin = {
  /** Approving credits the wallet (DEPOSIT ledger entry) in the same step as the status change. */
  approveDeposit(id: string) {
    const d = db.deposits.find((x) => x.id === id && x.status === 'PENDING');
    if (!d) return;
    d.status = 'APPROVED';
    db.ledger.push({ id: db.nextId('l'), type: 'DEPOSIT', amount: d.amount, at: new Date(), refId: d.id });
    notify({ kind: 'depositApproved', values: { method: d.methodName }, amount: d.amount });
  },
  rejectDeposit(id: string) {
    const d = db.deposits.find((x) => x.id === id && x.status === 'PENDING');
    if (d) d.status = 'REJECTED';
  },
  payWithdrawal(id: string, payoutRef: string) {
    const w = db.withdrawals.find((x) => x.id === id && (x.status === 'PENDING' || x.status === 'APPROVED'));
    if (!w) return;
    w.status = 'PAID';
    w.payoutRef = payoutRef;
    notify({ kind: 'withdrawalPaid', values: { number: w.number, ref: payoutRef }, amount: w.amount });
  },
  /** Rejecting unlocks the money with a WITHDRAWAL_REVERSAL entry. */
  rejectWithdrawal(id: string) {
    const w = db.withdrawals.find((x) => x.id === id && (x.status === 'PENDING' || x.status === 'APPROVED'));
    if (!w) return;
    w.status = 'REJECTED';
    db.ledger.push({ id: db.nextId('l'), type: 'WITHDRAWAL_REVERSAL', amount: w.amount, at: new Date(), refId: w.id });
  },
  pendingDeposits: () => db.deposits.filter((d) => d.status === 'PENDING').map((d) => d.id),
  openWithdrawals: () => db.withdrawals.filter((w) => w.status === 'PENDING' || w.status === 'APPROVED').map((w) => w.id),
};
