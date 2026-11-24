/**
 * LAYER    shared/lib
 * ROLE     TanStack Query defaults for the whole app: server state lives in the query cache, never in
 *          a global store. A 4xx is never retried (the request is wrong, retrying cannot help).
 */
import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './apiError';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => !(error instanceof ApiError && error.isClientError) && failureCount < 2,
      },
      mutations: { retry: false },
    },
  });
}

// Every query/mutation error IS an ApiError (apiClient converts all failures), so tell TanStack Query once:
// hooks and components get error.code / error.fields typed without casts.
declare module '@tanstack/react-query' {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- augmentation must reuse the library interface name
  interface Register {
    defaultError: ApiError;
  }
}
