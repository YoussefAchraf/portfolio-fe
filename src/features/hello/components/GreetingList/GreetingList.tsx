/**
 * LAYER    features/<name>/components (trivial logic -> no use<Thing>.ts)
 * ROLE     The read side: the latest greetings as stored in PostgreSQL (GET /v1/hello), refreshed after
 *          every successful submit (useSayHello invalidates the query).
 */
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import data from './GreetingList.data.json';
import styles from './GreetingList.module.css';
import { useHello } from '../../hooks/useHello';
import { Spinner } from '@/shared/components/Spinner/Spinner';

export function GreetingList(): ReactElement {
  const { t, i18n } = useTranslation();
  const hello = useHello();
  const time = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <section className={styles.section} aria-labelledby="greeting-list-title">
      <h2 id="greeting-list-title" className={styles.title}>
        {t(data.titleKey)}
      </h2>
      {hello.isPending ? <Spinner /> : null}
      {hello.isError ? <p className={styles.error}>{t(`common:errors.${hello.error.code}`)}</p> : null}
      {hello.isSuccess && hello.data.greetings.length === 0 ? <p className={styles.muted}>{t(data.emptyKey)}</p> : null}
      {hello.isSuccess && hello.data.greetings.length > 0 ? (
        <ul className={styles.list}>
          {hello.data.greetings.map((greeting) => (
            <li key={greeting.id} className={styles.item}>
              <span className={styles.name}>{greeting.name}</span>
              <time className={styles.muted} dateTime={greeting.createdAt}>
                {time.format(new Date(greeting.createdAt))}
              </time>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
