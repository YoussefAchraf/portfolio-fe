/** LAYER features/profile/api - typed public profile transport. */
import { apiClient } from '@/shared/lib/apiClient';

export type ProfileLocale = 'en' | 'fr';

export interface IPublicProfile {
  name: string;
  headline: string;
  pitch: string;
  about: string;
  availability: string;
  location: string;
  portrait: { url: string; alt: string };
}

export const profileApi = {
  async get(locale: ProfileLocale, signal: AbortSignal): Promise<IPublicProfile> {
    const response = await apiClient.get<IPublicProfile>('/v1/profile', { params: { lang: locale }, signal });
    return response.data;
  },
};
