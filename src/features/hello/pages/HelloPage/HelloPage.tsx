/**
 * LAYER    features/<name>/pages/<Thing>Page  (the ONLY default exports: routes lazy-load them)
 * ROLE     The hello template page: stack status, the name form (write path) and the greetings list
 *          (read path). Composition only - every behaviour lives in the components and feature hooks.
 * COPY     A new feature copies this folder's shape: page -> components -> hooks -> api -> apiClient.
 */
import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import data from './HelloPage.data.json';
import styles from './HelloPage.module.css';
import { GreetingForm } from '../../components/GreetingForm/GreetingForm';
import { GreetingList } from '../../components/GreetingList/GreetingList';
import { StatusPanel } from '../../components/StatusPanel/StatusPanel';

export default function HelloPage(): ReactElement {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t(data.titleKey)} - ${t(data.appNameKey)}`;
  }, [t]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t(data.titleKey)}</h1>
        <p className={styles.intro}>{t(data.introKey)}</p>
      </header>
      <StatusPanel />
      <div className={styles.card}>
        <GreetingForm />
      </div>
      <GreetingList />
    </div>
  );
}
