/**
 * LAYER    layouts/<Name>Layout  (page shell - never imports features)
 * ROLE     Header + main + footer around every routed page (<Outlet />). Feature UI (a user menu later)
 *          is passed in through slot props by routes/router.tsx, so layouts stay feature-agnostic.
 */
import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router-dom';
import data from './AppLayout.data.json';
import styles from './AppLayout.module.css';
import { paths } from '@/routes/paths';

export interface IAppLayoutProps {
  /** Slot for feature UI on the right of the header (e.g. a user menu). */
  headerEnd?: ReactNode;
}

export function AppLayout({ headerEnd }: IAppLayoutProps): ReactElement {
  const { t } = useTranslation();
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to={paths.hello} className={styles.brand}>
          {t(data.appNameKey)}
        </Link>
        {headerEnd}
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>{t(data.footerKey)}</footer>
    </div>
  );
}
