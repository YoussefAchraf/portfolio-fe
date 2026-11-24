/**
 * LAYER    features/<name>/api  (cache contract)
 * ROLE     Query keys + queryOptions + mutation options in ONE place, so every hook and every invalidation
 *          uses the same keys. Hooks wrap these; components never call helloApi directly.
 */
import { queryOptions } from '@tanstack/react-query';
import { helloApi } from './helloApi';

export const helloKeys = {
  all: ['hello'] as const,
  list: (limit: number) => [...helloKeys.all, 'list', limit] as const,
  readiness: () => [...helloKeys.all, 'readiness'] as const,
};

export const helloQueries = {
  list: (limit: number) => queryOptions({ queryKey: helloKeys.list(limit), queryFn: () => helloApi.show(limit) }),
  readiness: () =>
    queryOptions({ queryKey: helloKeys.readiness(), queryFn: () => helloApi.readiness(), refetchInterval: 30_000 }),
};

export const helloMutations = {
  create: { mutationFn: (name: string) => helloApi.create(name) },
};
