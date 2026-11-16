import { useCallback, useRef } from 'react';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { TierKey } from '@/lib/theme';

import { api, newIdempotencyKey } from './index';
import type { DepositRequest, LeaderPeriod, WithdrawRequest } from './types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    // Money actions are never retried automatically; the member decides.
    mutations: { retry: 0 },
  },
});

// ---------- Reads ----------

export const useConfig = () => useQuery({ queryKey: ['config'], queryFn: api.getConfig, staleTime: 5 * 60_000 });
export const useProfile = () => useQuery({ queryKey: ['profile'], queryFn: api.getProfile });
export const useHome = () => useQuery({ queryKey: ['home'], queryFn: api.getHome });
export const useWallet = () => useQuery({ queryKey: ['wallet'], queryFn: api.getWallet });
export const usePackages = () => useQuery({ queryKey: ['packages'], queryFn: api.getPackages });
export const usePackage = (id: string) => useQuery({ queryKey: ['packages', id], queryFn: () => api.getPackage(id) });
export const useTeam = () => useQuery({ queryKey: ['team'], queryFn: api.getTeam });
export const useLeaderboard = (period: LeaderPeriod) =>
  useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => api.getLeaderboard(period),
    // Keep the old list on screen while another period loads.
    placeholderData: (previous) => previous,
  });
export const useNotifications = () => useQuery({ queryKey: ['notifications'], queryFn: api.getNotifications });

// ---------- Money actions ----------

/**
 * One Idempotency-Key per member action: tapping twice (or a retry after a network error)
 * reuses the same key, so the server runs the action once. `renew()` after it succeeds.
 */
export function useIdempotencyKey() {
  const ref = useRef(newIdempotencyKey());
  const renew = useCallback(() => {
    ref.current = newIdempotencyKey();
  }, []);
  return { get: () => ref.current, renew };
}

/** After a money action every screen may show other numbers, so all data is fetched again. */
function useRefreshAll() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}

export function useBuyPackage() {
  const refresh = useRefreshAll();
  return useMutation({
    mutationFn: ({ tier, key }: { tier: TierKey; key: string }) => api.buyPackage(tier, key),
    onSuccess: refresh,
  });
}

export function useSubmitDeposit() {
  const refresh = useRefreshAll();
  return useMutation({
    mutationFn: ({ req, key }: { req: DepositRequest; key: string }) => api.submitDeposit(req, key),
    onSuccess: refresh,
  });
}

export function useRequestWithdrawal() {
  const refresh = useRefreshAll();
  return useMutation({
    mutationFn: ({ req, key }: { req: WithdrawRequest; key: string }) => api.requestWithdrawal(req, key),
    onSuccess: refresh,
  });
}

export function useClaimDaily() {
  const refresh = useRefreshAll();
  return useMutation({
    mutationFn: ({ key }: { key: string }) => api.claimDaily(key),
    onSuccess: refresh,
  });
}

export function useMarkRead() {
  const refresh = useRefreshAll();
  return useMutation({ mutationFn: (id: string) => api.markNotificationRead(id), onSuccess: refresh });
}

export function useMarkAllRead() {
  const refresh = useRefreshAll();
  return useMutation({ mutationFn: api.markAllNotificationsRead, onSuccess: refresh });
}

// ---------- Helpers ----------

type Loadable<T> = { data: T | undefined; isPending: boolean; isError: boolean; refetch: () => Promise<unknown> };

/** Two queries as one, for <QueryState>: data only when both have loaded. */
export function both<A, B>(a: Loadable<A>, b: Loadable<B>): Loadable<[A, B]> {
  return {
    data: a.data !== undefined && b.data !== undefined ? [a.data, b.data] : undefined,
    isPending: a.isPending || b.isPending,
    isError: a.isError || b.isError,
    refetch: () => Promise.all([a.refetch(), b.refetch()]),
  };
}
