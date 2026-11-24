/**
 * LAYER    features/<name>/hooks
 * ROLE     The write hook: POST the name, then invalidate every hello query so the list re-reads the
 *          database (the server stays the source of truth - no optimistic copy kept in a store).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ISaidHelloResponse } from '../api/helloApi';
import { helloKeys, helloMutations } from '../api/helloQueries';
import type { ApiError } from '@/shared/lib/apiError';

export function useSayHello(): UseMutationResult<ISaidHelloResponse, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation<ISaidHelloResponse, ApiError, string>({
    ...helloMutations.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: helloKeys.all }),
  });
}
