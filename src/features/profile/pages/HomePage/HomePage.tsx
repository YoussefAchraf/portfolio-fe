/** LAYER features/profile/pages - localized public home. */
import { useInView } from 'motion/react';
import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styles from './HomePage.module.css';
import { useTheme } from './useTheme';
import { useProfile } from '../../hooks/useProfile';
import { paths } from '@/routes/paths';
import { PageTransition, Reveal, Stagger, StaggerItem } from '@/shared/ui/portfolio/Motion';
import { Badge, Button, Card, Container, LanguageSwitch, Navbar, Section } from '@/shared/ui/portfolio/PortfolioUi';
import { ThemeToggle } from '@/shared/ui/portfolio/PortfolioUi';

export default function HomePage(): ReactElement {
  const { pathname } = useLocation();
  const locale = pathname === paths.homeFr ? 'fr' : 'en';
  const { t } = useTranslation('profile', { lng: locale });
  const { data, isPending, isError, refetch } = useProfile(locale);
  const { theme, setTheme } = useTheme();
  const hero = useRef<HTMLElement>(null);
  const visible = useInView(hero);

  useEffect(() => { document.documentElement.lang = locale; }, [locale]);

  return <>
    <Navbar label={t('navigation')} menuLabel={t('menu')} brand={<a className={styles.brand} href={pathname}>AY<span aria-hidden="true">.</span></a>} controls={<>
      <LanguageSwitch to={locale === 'en' ? paths.homeFr : paths.home} lang={locale === 'en' ? 'fr' : 'en'}>{t('language')}</LanguageSwitch>
      <ThemeToggle label={t('themeCurrent', { theme: t(theme) })} theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')} />
    </>}>
      <a href="#about">{t('about')}</a><a href="#projects">{t('projects')}</a><a href="#contact">{t('contact')}</a>
    </Navbar>
    <main>
      {isPending && <Container><p role="status">{t('loading')}</p></Container>}
      {isError && <Container><div role="alert"><p>{t('error')}</p><Button onClick={() => void refetch()}>{t('retry')}</Button></div></Container>}
      {data && <PageTransition key={locale}>
        <section ref={hero} className={styles.hero} aria-labelledby="home-title">
          <div className={styles.mesh} aria-hidden="true" data-active={visible} />
          <Container className={styles.heroContent}>
            <Badge>{data.availability}</Badge>
            <h1 id="home-title">{data.name}</h1>
            <p className={styles.headline}>{data.headline}</p>
            <p className={styles.pitch}>{data.pitch}</p>
            <div className={styles.actions}>
              <Button href="#projects">{t('explore')} <span aria-hidden="true">&nbsp;&rarr;</span></Button>
              <Button href="#contact" variant="ghost">{t('contact')}</Button>
            </div>
            <a href="#about" className={styles.scroll}>{t('about')} <span aria-hidden="true">&darr;</span></a>
          </Container>
        </section>
        <Container>
          <Section id="about" className={styles.about}>
            <Reveal><h2 id="about-title">{t('about')}</h2><p>{data.about}</p><Badge>{data.location}</Badge></Reveal>
            <Card className={styles.portrait}><img src={data.portrait.url} alt={data.portrait.alt} width="240" height="240" loading="lazy" /></Card>
          </Section>
          <Stagger>
            <StaggerItem><Section id="projects"><h2 id="projects-title">{t('projects')}</h2><p>{t('projectsPending')}</p></Section></StaggerItem>
            <StaggerItem><Section id="contact"><h2 id="contact-title">{t('contact')}</h2><p>{t('contactPending')}</p></Section></StaggerItem>
          </Stagger>
        </Container>
      </PageTransition>}
    </main>
  </>;
}
