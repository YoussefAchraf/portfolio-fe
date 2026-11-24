/**
 * LAYER    features/<name>/components (trivial logic -> no use<Thing>.ts; reads a feature hook directly)
 * ROLE     Proves the stack is wired on page load: Frontend (this rendered), Backend API (/api/ready
 *          answered through nginx/Vite proxy), Database (the backend's postgres probe is ok).
 */
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import data from './StatusPanel.data.json';
import styles from './StatusPanel.module.css';
import { useReadiness } from '../../hooks/useHello';

type State = 'ok' | 'down' | 'checking';

export function StatusPanel(): ReactElement {
  const { t } = useTranslation();
  const readiness = useReadiness();
  const api: State = readiness.isPending ? 'checking' : readiness.isSuccess ? 'ok' : 'down';
  const database: State = api === 'checking' ? 'checking' : readiness.data?.checks['postgres'] === 'ok' ? 'ok' : 'down';
  const rows: { labelKey: string; state: State }[] = [
    { labelKey: data.frontendKey, state: 'ok' },
    { labelKey: data.apiKey, state: api },
    { labelKey: data.databaseKey, state: database },
  ];

  return (
    <section className={styles.panel} aria-labelledby="stack-status-title">
      <h2 id="stack-status-title" className={styles.title}>
        {t(data.titleKey)}
      </h2>
      <ul className={styles.list}>
        {rows.map((row) => (
          <li key={row.labelKey} className={styles.item}>
            <span>{t(row.labelKey)}</span>
            <span className={styles[row.state]} data-testid={`status-${row.labelKey}`}>
              {t(data.stateKeys[row.state])}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
