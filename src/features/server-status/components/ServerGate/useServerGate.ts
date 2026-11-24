/**
 * LAYER    features/<name>/components  (logic of ServerGate.tsx)
 * ROLE     Decides what the gate renders: the app only once the backend is ready; the splash until its
 *          fade-out animation has finished (then it is removed from the DOM).
 */
import type { AnimationEvent } from 'react';
import { useState } from 'react';
import data from './ServerGate.data.json';
import { useServerReady } from '../../hooks/useServerReady';
import type { IServerTimings, ServerPhase } from '../../hooks/useServerReady';

export interface IServerGateState {
  phase: ServerPhase;
  showApp: boolean;
  showSplash: boolean;
  leaving: boolean;
  retry: () => void;
  onSplashAnimationEnd: (event: AnimationEvent<HTMLDivElement>) => void;
}

export function useServerGate(timings?: Partial<IServerTimings>): IServerGateState {
  const { phase, retry } = useServerReady({ ...data.timings, ...timings });
  const [splashGone, setSplashGone] = useState(false);
  const ready = phase === 'ready';

  return {
    phase,
    showApp: ready,
    showSplash: !splashGone,
    leaving: ready,
    retry,
    // Only the splash's own fade-out ends it (its children animate too and their events bubble here).
    onSplashAnimationEnd: (event) => {
      if (ready && event.target === event.currentTarget) setSplashGone(true);
    },
  };
}
