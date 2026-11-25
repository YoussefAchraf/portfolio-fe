/** LAYER routes - localized public routes behind the readiness splash. */
import type { ReactElement } from 'react';
import { createBrowserRouter, Outlet, useLocation } from 'react-router-dom';
import { paths } from './paths';
import { RouteError } from './RouteError';
import { useProfile } from '@/features/profile/hooks/useProfile';
import HomePage from '@/features/profile/pages/HomePage/HomePage';
import { ServerGate } from '@/features/server-status/components/ServerGate/ServerGate';

function PublicGate(): ReactElement {
  const { pathname } = useLocation();
  useProfile(pathname === paths.homeFr ? 'fr' : 'en');
  return <ServerGate><Outlet /></ServerGate>;
}

export const router = createBrowserRouter([
  {
    element: <PublicGate />,
    errorElement: <RouteError />,
    children: [
      { path: paths.home, Component: HomePage },
      { path: paths.homeFr, Component: HomePage },
    ],
  },
]);
