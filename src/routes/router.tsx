/** LAYER routes - localized public routes behind the readiness splash. */
import type { ComponentType } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { paths } from './paths';
import { RouteError } from './RouteError';
import { ServerGate } from '@/features/server-status/components/ServerGate/ServerGate';

const loadHome = async (): Promise<{ Component: ComponentType }> => ({ Component: (await import('@/features/profile/pages/HomePage/HomePage')).default });

export const router = createBrowserRouter([
  {
    element: <ServerGate><Outlet /></ServerGate>,
    errorElement: <RouteError />,
    children: [
      { path: paths.home, lazy: loadHome },
      { path: paths.homeFr, lazy: loadHome },
    ],
  },
]);
