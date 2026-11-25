/** LAYER shared/ui - reusable motion. */
import { domAnimation, LazyMotion, m, useReducedMotion } from 'motion/react';
import type { ReactElement, ReactNode } from 'react';

interface IMotionProps { children: ReactNode }
const show = { y: [8, 0], opacity: [0.8, 1], transition: { duration: 0.24 } };

export function Reveal({ children }: IMotionProps): ReactElement {
  const reduced = useReducedMotion();
  return <m.div initial={false} whileInView={reduced ? undefined : show} viewport={{ once: true }}>{children}</m.div>;
}

export function Stagger({ children }: IMotionProps): ReactElement {
  const reduced = useReducedMotion();
  return <m.div initial={false} whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: reduced ? 0 : 0.06 } } }}>{children}</m.div>;
}

export function StaggerItem({ children }: IMotionProps): ReactElement {
  const reduced = useReducedMotion();
  return <m.div variants={{ show: reduced ? {} : show }}>{children}</m.div>;
}

export function PageTransition({ children }: IMotionProps): ReactElement {
  const reduced = useReducedMotion();
  return <LazyMotion features={domAnimation}><m.div initial={false} animate={reduced ? undefined : { opacity: [0.9, 1] }} transition={{ duration: 0.18 }}>{children}</m.div></LazyMotion>;
}
