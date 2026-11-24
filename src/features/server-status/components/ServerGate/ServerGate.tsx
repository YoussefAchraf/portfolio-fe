/**
 * LAYER    features/<name>/components
 * ROLE     Splash screen in front of the whole app (routes/router.tsx wraps the root layout with it).
 *          On free hosting the backend sleeps when idle and needs up to a minute to wake: the splash says
 *          so with an animation, and the app (pages, forms, their queries) mounts only once the backend
 *          and its database are ready - then the splash fades out.
 * ANATOMY  ServerGate.tsx (structure) + ServerGate.module.css (presentation) + ServerGate.data.json (i18n
 *          keys, timings) + useServerGate.ts (logic). `timings` overrides the data.json values (tests).
 * A11Y     Messages live in a polite status region; the timeout is an alert with a Retry button. While
 *          fading out the splash is inert and hidden from assistive technology.
 */
import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import data from './ServerGate.data.json';
import styles from './ServerGate.module.css';
import { useServerGate } from './useServerGate';
import type { IServerTimings } from '../../hooks/useServerReady';

interface IServerGateProps {
  children: ReactNode;
  timings?: Partial<IServerTimings>;
}

export function ServerGate({ children, timings }: IServerGateProps): ReactElement {
  const { t } = useTranslation();
  const gate = useServerGate(timings);
  const timedOut = gate.phase === 'timeout';

  return (
    <>
      {gate.showApp && children}
      {gate.showSplash && (
        <div
          className={gate.leaving ? `${styles.splash} ${styles.leaving}` : styles.splash}
          onAnimationEnd={gate.onSplashAnimationEnd}
          aria-hidden={gate.leaving || undefined}
          inert={gate.leaving}
          data-testid="server-splash"
        >
          <div className={styles.content}>
            <div className={timedOut ? `${styles.pulse} ${styles.stopped}` : styles.pulse} aria-hidden="true">
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
            <p className={styles.appName}>{t(data.appNameKey)}</p>
            {timedOut ? (
              <div role="alert" className={styles.message}>
                <p className={styles.title}>{t(data.messageKeys.timeout)}</p>
                <button type="button" className={styles.retry} onClick={gate.retry}>
                  {t(data.retryKey)}
                </button>
              </div>
            ) : (
              <div role="status" className={styles.message}>
                <p className={styles.title}>{gate.phase === 'ready' ? '' : t(data.messageKeys[gate.phase])}</p>
                <p className={styles.hint}>{t(data.hintKey)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
