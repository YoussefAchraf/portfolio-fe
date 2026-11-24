/**
 * LAYER    features/<name>/hooks  (React Query wrappers - the components' only door to server data)
 * ROLE     Read hooks for the hello page: recent greetings (+ seeded users) and backend readiness.
 */
import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { IHelloResponse, IReadiness } from '../api/helloApi';
import { helloQueries } from '../api/helloQueries';

export const HELLO_LIST_LIMIT = 10;

export function useHello(): UseQueryResult<IHelloResponse> {
  return useQuery(helloQueries.list(HELLO_LIST_LIMIT));
}

export function useReadiness(): UseQueryResult<IReadiness> {
  return useQuery(helloQueries.readiness());
}
