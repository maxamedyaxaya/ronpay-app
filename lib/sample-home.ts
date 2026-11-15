import { sampleOwned, sampleSettings } from './sample-tabs';

/**
 * TEMPORARY example data copied from the design (page 9), so the Home screen
 * can be checked visually. Step 3 replaces this with the mock API through
 * React Query hooks — screens will then never import this file.
 * Amounts are display strings here only; real amounts will be integers in
 * $0.0001 units formatted by the money helpers.
 */
export const sampleHome = {
  member: { firstName: 'Maxamed', fullName: 'Maxamed Yaxaye', initials: 'MY' },
  unreadNotifications: true,
  balance: { available: '$12.30', totalEarned: '$22.30', pendingDeposits: '$5.00' },
  stats: { packages: '3', confirmedReferrals: '3', referralRewards: '$0.15', invited: '4' },
  dailyReward: { weeklyTotal: '$0.10', dailyAmount: '$0.0143', todayIndex: 2, claimedToday: false },
  // Same packages as the Packages/Team tabs, so every screen agrees.
  packages: sampleOwned.map((p) => ({
    id: p.id,
    tier: p.tier,
    price: p.price,
    slotsUsed: p.buyers.length,
    slotsTotal: sampleSettings.packageLinkSlots,
  })),
  inviteReward: '$0.05',
  activity: [
    { id: 'a1', kind: 'referral' as const, name: 'Sahra', time: '14:30', amount: '+$0.05' },
    { id: 'a2', kind: 'daily' as const, day: 2, amount: '+$0.0143' },
    { id: 'a3', kind: 'withdrawal' as const, method: 'Zaad', ref: 'TX123', date: '2 Nov', amount: '-$10.00' },
  ],
};
