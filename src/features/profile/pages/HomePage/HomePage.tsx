/** LAYER features/profile/pages - public hero and About page. */
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import data from './HomePage.data.json';
import styles from './HomePage.module.css';
import { useTheme } from './useTheme';
import { useProfile } from '../../hooks/useProfile';
import { paths } from '@/routes/paths';

export default function HomePage(): ReactElement {
  const { pathname } = useLocation();
  const locale = pathname === paths.homeFr ? 'fr' : 'en';
  const { t } = useTranslation('profile', { lng: locale });
  const profile = useProfile(locale);
  const { theme, setTheme } = useTheme();

  return (
    <>
      <header className={styles.header}>
        <nav aria-label={t(data.navigation)} className={styles.navigation}>
          <a href="#about">{t(data.about)}</a>
          <Link to={locale === 'en' ? paths.homeFr : paths.home} lang={locale === 'en' ? 'fr' : 'en'}>
            {t(data.language)}
          </Link>
          <label className={styles.theme}>
            {t(data.theme)}
            <select value={theme} onChange={(event) => setTheme(event.currentTarget.value)}>
              <option value="dark">{t(data.dark)}</option>
              <option value="light">{t(data.light)}</option>
              <option value="system">{t(data.system)}</option>
            </select>
          </label>
        </nav>
      </header>
      <main className={styles.main}>
        {profile.isPending && <p role="status">{t(data.loading)}</p>}
        {profile.isError && (
          <div role="alert">
            <p>{t(data.error)}</p>
            <button type="button" onClick={() => void profile.refetch()}>{t(data.retry)}</button>
          </div>
        )}
        {profile.data && (
          <>
            <section className={styles.hero} aria-labelledby="home-title">
              <p className={styles.availability}>{profile.data.availability}</p>
              <h1 id="home-title">{profile.data.name}</h1>
              <p className={styles.headline}>{profile.data.headline}</p>
              <p>{profile.data.pitch}</p>
              <a className={styles.action} href="#about">{t(data.about)}</a>
            </section>
            <section className={styles.about} id="about" aria-labelledby="about-title">
              <div>
                <h2 id="about-title">{t(data.about)}</h2>
                <p>{profile.data.about}</p>
                <p>{profile.data.location}</p>
              </div>
              <img src={profile.data.portrait.url} alt={profile.data.portrait.alt} width="240" height="240" loading="lazy" />
            </section>
          </>
        )}
      </main>
    </>
  );
}
