/** LAYER shared/ui - reusable portfolio controls and surfaces. */
import { animate, m, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './PortfolioUi.module.css';

interface IContent { children: ReactNode; className?: string }

export function Container({ children, className }: IContent): ReactElement {
  return <div className={[styles.container, className].filter(Boolean).join(' ')}>{children}</div>;
}

export function Section({ children, id, className }: IContent & { id: string }): ReactElement {
  return <section id={id} aria-labelledby={`${id}-title`} className={[styles.section, className].filter(Boolean).join(' ')}>{children}</section>;
}

export function Badge({ children }: IContent): ReactElement {
  return <span className={styles.badge}>{children}</span>;
}

export function Tag({ children }: IContent): ReactElement {
  return <Badge>{children}</Badge>;
}

export function Card({ children, className }: IContent): ReactElement {
  const reduced = useReducedMotion();
  return <m.div className={[styles.card, className].filter(Boolean).join(' ')} whileHover={reduced ? undefined : { y: -4, rotate: 0.5 }} transition={{ duration: 0.2 }}>{children}</m.div>;
}

export function Button({ children, href, onClick, variant = 'primary' }: IContent & { href?: string; onClick?: () => void; variant?: 'primary' | 'ghost' }): ReactElement {
  const reduced = useReducedMotion();
  const className = variant === 'primary' ? styles.primary : styles.ghost;
  if (!href) return <button className={className} type="button" onClick={onClick}>{children}</button>;
  return <a href={href} className={className} onPointerMove={(event) => {
    if (reduced || variant !== 'primary' || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    void animate(event.currentTarget, { x: (event.clientX - rect.left - rect.width / 2) * 0.08, y: (event.clientY - rect.top - rect.height / 2) * 0.08 }, { duration: 0.2 });
  }} onPointerLeave={(event) => { if (!reduced && variant === 'primary') void animate(event.currentTarget, { x: 0, y: 0 }, { duration: 0.2 }); }}>{children}</a>;
}

export function ThemeToggle({ label, theme, onToggle }: { label: string; theme: string; onToggle: () => void }): ReactElement {
  return <button className={styles.icon} type="button" aria-label={label} title={label} onClick={onToggle}>
    <span aria-hidden="true">{theme === 'light' ? '\u2600' : theme === 'system' ? '\u25d0' : '\u263e'}</span>
  </button>;
}

export function LanguageSwitch({ to, lang, children }: IContent & { to: string; lang: string }): ReactElement {
  return <Link className={styles.ghost} to={to} lang={lang} hrefLang={lang}>{children}</Link>;
}

export function Navbar({ label, menuLabel, brand, children, controls }: IContent & { label: string; menuLabel: string; brand: ReactNode; controls: ReactNode }): ReactElement {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return <header className={styles.header} onKeyDown={(event) => {
    if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); }
  }}><Container className={styles.navbar}>
    {brand}
    <div className={styles.controls}>{controls}<button ref={toggle} className={styles.menu} type="button" aria-expanded={open} aria-controls="portfolio-navigation" onClick={() => setOpen((isOpen) => !isOpen)}>{menuLabel}</button></div>
    <nav id="portfolio-navigation" aria-label={label} className={styles.links} data-open={open} onClick={() => setOpen(false)}>{children}</nav>
  </Container></header>;
}
