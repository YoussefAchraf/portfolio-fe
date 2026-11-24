/**
 * LAYER    app
 * ROLE     Last line of defense for render crashes outside the router: logs (console.error is allowed) and
 *          shows a reload button instead of a white screen.
 */
import { Component } from 'react';
import type { ErrorInfo, ReactElement, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';
import { i18n } from '@/shared/i18n';

interface IProps {
  children: ReactNode;
}
interface IState {
  failed: boolean;
}

export class ErrorBoundary extends Component<IProps, IState> {
  state: IState = { failed: false };

  static getDerivedStateFromError(): IState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('render.failed', error, info.componentStack);
  }

  render(): ReactNode | ReactElement {
    if (!this.state.failed) return this.props.children;
    return (
      <div className={styles.box} role="alert">
        <p>{i18n.t('common:errors.unexpected')}</p>
        <button type="button" onClick={() => window.location.reload()}>
          {i18n.t('common:errors.reload')}
        </button>
      </div>
    );
  }
}
