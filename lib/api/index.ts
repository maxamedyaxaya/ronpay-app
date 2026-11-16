import * as mock from './mock/server';

/**
 * The one place screens get data from (through the hooks in ./hooks).
 * EXPO_PUBLIC_USE_MOCKS=true → the pretend server in ./mock. The real HTTP client will be
 * added here when the backend exists; it must return the same shapes (./types).
 */
if (process.env.EXPO_PUBLIC_USE_MOCKS !== 'true') {
  console.warn('EXPO_PUBLIC_USE_MOCKS is not "true", but there is no real API yet — using the mock API.');
}

export const api = {
  getConfig: mock.getConfig,
  getProfile: mock.getProfile,
  getHome: mock.getHome,
  getWallet: mock.getWallet,
  getPackages: mock.getPackages,
  getPackage: mock.getPackage,
  getDaily: mock.getDaily,
  getTeam: mock.getTeam,
  getLeaderboard: mock.getLeaderboard,
  getNotifications: mock.getNotifications,
  markNotificationRead: mock.markNotificationRead,
  markAllNotificationsRead: mock.markAllNotificationsRead,
  buyPackage: mock.buyPackage,
  submitDeposit: mock.submitDeposit,
  requestWithdrawal: mock.requestWithdrawal,
  claimDaily: mock.claimDaily,
};

export * from './errors';
export type * from './types';
