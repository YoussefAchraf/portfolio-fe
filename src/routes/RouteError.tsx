/**
 * LAYER    routes
 * ROLE     Router error element: unknown URL -> 404 message; a crash while loading a route -> generic error
 *          with a way back. Text comes from common:errors.*.
 */
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { paths } from './paths';
import styles from './RouteError.module.css';

export function RouteError(): ReactElement {
  const { t } = useTranslation();
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <div className={styles.box} role="alert">
      <p>{t(notFound ? 'common:errors.NOT_FOUND' : 'common:errors.unexpected')}</p>
      <Link to={paths.hello}>{t('common:appName')}</Link>
    </div>
  );
}
