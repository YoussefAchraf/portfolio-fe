/**
 * LAYER    app
 * ROLE     Providers, outermost first: ErrorBoundary -> QueryClientProvider -> RouterProvider.
 * TRACKING Read this file (with routes/router.tsx) to see the whole app wiring - every provider and
 *          every screen meet here; no need to open the features.
 */
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { router } from '@/routes/router';
import { createQueryClient } from '@/shared/lib/queryClient';

const queryClient = createQueryClient();

export function App(): ReactElement {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
