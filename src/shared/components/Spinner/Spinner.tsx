/**
 * LAYER    shared/components (reusable UI, promoted on the second need)
 * ROLE     Accessible loading indicator: role="status" + visually hidden translated label.
 * ANATOMY  Spinner.tsx (structure) + Spinner.module.css (presentation) + Spinner.data.json (i18n keys).
 *          No logic hook: nothing to compute.
 */
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import data from './Spinner.data.json';
import styles from './Spinner.module.css';

export function Spinner(): ReactElement {
  const { t } = useTranslation();
  return (
    <span className={styles.spinner} role="status">
      <span className={styles.visuallyHidden}>{t(data.labelKey)}</span>
    </span>
  );
}
