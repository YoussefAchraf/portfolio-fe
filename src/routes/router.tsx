/**
 * LAYER    routes
 * ROLE     The route tree: ServerGate -> layout -> lazily loaded pages (one JS chunk per page). ServerGate
 *          shows the wake-up splash until the backend and its database are ready (free hosting sleeps), so
 *          every page - present and future - mounts against a live backend. Guards (ProtectedRoute,
 *          GuestRoute) and layout slots are added here when the auth feature lands.
 * TRACKING Read this file (with app/App.tsx) to see every screen and how it is reached.
 */
import { createBrowserRouter } from 'react-router-dom';
import { paths } from './paths';
import { RouteError } from './RouteError';
import { ServerGate } from '@/features/server-status/components/ServerGate/ServerGate';
import { AppLayout } from '@/layouts/AppLayout/AppLayout';

export const router = createBrowserRouter([
  {
    path: paths.hello,
    element: (
      <ServerGate>
        <AppLayout />
      </ServerGate>
    ),
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/features/hello/pages/HelloPage/HelloPage')).default }),
      },
    ],
  },
]);
