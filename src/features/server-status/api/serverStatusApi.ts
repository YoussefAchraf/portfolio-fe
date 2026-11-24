/**
 * LAYER    features/<name>/api  (transport - the ONLY layer allowed to import apiClient)
 * ROLE     Is the backend awake? Asks the backend readiness probe (et-be GET /ready: the API answers and
 *          every dependency check - Postgres - is ok).
 * RULES    Never throws: on free hosting the backend SLEEPS, so a timeout, a network error, a 502 from the
 *          proxy or a 503 "not_ready" all mean the same thing here - "still waking up, ask again".
 */
import { apiClient } from '@/shared/lib/apiClient';

export type ServerReadiness = 'ready' | 'waking';

interface IReadinessBody {
  status: 'ready' | 'not_ready';
  checks: Record<string, 'ok' | 'down'>;
}

export const serverStatusApi = {
  async probe(): Promise<ServerReadiness> {
    try {
      const { data } = await apiClient.get<IReadinessBody>('/ready', { validateStatus: (s) => s === 200 || s === 503 });
      const allOk = data.status === 'ready' && Object.values(data.checks).every((check) => check === 'ok');
      return allOk ? 'ready' : 'waking';
    } catch {
      return 'waking';
    }
  },
};
