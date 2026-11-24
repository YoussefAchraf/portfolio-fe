/** LAYER features/profile/hooks - localized profile query. */
import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import type { IPublicProfile, ProfileLocale } from '../api/profileApi';

export function useProfile(locale: ProfileLocale): UseQueryResult<IPublicProfile> {
  return useQuery({
    queryKey: ['profile', locale],
    queryFn: ({ signal }) => profileApi.get(locale, signal),
  });
}
