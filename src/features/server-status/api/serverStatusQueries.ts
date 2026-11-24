/**
 * LAYER    features/<name>/api  (cache contract)
 * ROLE     Query key + options of the wake-up probe. Once the backend answered "ready" the answer is kept for
 *          the whole visit (staleTime/gcTime Infinity, no refetch on focus/reconnect): the gate opens once.
 */
import { queryOptions } from '@tanstack/react-query';
import { serverStatusApi } from './serverStatusApi';

export const serverStatusKeys = {
  all: ['server-status'] as const,
  readiness: () => [...serverStatusKeys.all, 'readiness'] as const,
};

export const serverStatusQueries = {
  readiness: () =>
    queryOptions({
      queryKey: serverStatusKeys.readiness(),
      queryFn: () => serverStatusApi.probe(),
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false, // probe() never throws; polling is driven by refetchInterval (hooks/useServerReady.ts)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
};
