/**
 * LAYER    features/<name>/hooks  (React Query wrapper - the components' only door to server data)
 * ROLE     Polls the backend until it is awake and turns elapsed time into a phase the splash can show:
 *          connecting -> waking (first "not yet") -> slow (after slowAfterMs) -> timeout (after timeoutMs,
 *          polling stops, retry() starts again) | ready (at any moment).
 */
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { serverStatusQueries } from '../api/serverStatusQueries';

export type ServerPhase = 'connecting' | 'waking' | 'slow' | 'timeout' | 'ready';

export interface IServerTimings {
  pollMs: number;
  slowAfterMs: number;
  timeoutMs: number;
}

export function useServerReady(timings: IServerTimings): { phase: ServerPhase; retry: () => void } {
  const [slow, setSlow] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const { data, refetch } = useQuery({
    ...serverStatusQueries.readiness(),
    refetchInterval: (query) => (timedOut || query.state.data === 'ready' ? false : timings.pollMs),
  });
  const ready = data === 'ready';

  useEffect(() => {
    if (ready || timedOut) return undefined;
    const slowTimer = setTimeout(() => setSlow(true), timings.slowAfterMs);
    const timeoutTimer = setTimeout(() => setTimedOut(true), timings.timeoutMs);
    return () => {
      clearTimeout(slowTimer);
      clearTimeout(timeoutTimer);
    };
  }, [ready, timedOut, timings.slowAfterMs, timings.timeoutMs]);

  const retry = useCallback(() => {
    setSlow(false);
    setTimedOut(false);
    void refetch();
  }, [refetch]);

  const phase: ServerPhase = ready ? 'ready' : timedOut ? 'timeout' : slow ? 'slow' : data === 'waking' ? 'waking' : 'connecting';
  return { phase, retry };
}
