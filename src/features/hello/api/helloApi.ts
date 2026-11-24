/**
 * LAYER    features/<name>/api  (transport - the ONLY layer allowed to import apiClient)
 * ROLE     Typed calls for the hello feature. Types mirror the backend contract exactly
 *          (et-be docs/openapi.json: showHello, createHello; /ready is the backend readiness probe).
 * PATTERN  `export const <feature>Api = { async verb(): Promise<T> }` - named export, no React here.
 * RULES    Never invent fields: a type changes only when the contract changes.
 */
import { apiClient } from '@/shared/lib/apiClient';

export interface IGreeting {
  id: string;
  name: string;
  createdAt: string;
}

export interface IHelloResponse {
  message: string;
  users: { id: string; firstname: string; lastname: string; roleName: 'admin' | 'member'; createdAt: string }[];
  greetings: IGreeting[];
}

export interface ISaidHelloResponse {
  message: string;
  greeting: IGreeting;
}

export interface IReadiness {
  status: 'ready' | 'not_ready';
  checks: Record<string, 'ok' | 'down'>;
}

export const helloApi = {
  async show(limit: number): Promise<IHelloResponse> {
    const { data } = await apiClient.get<IHelloResponse>('/v1/hello', { params: { limit } });
    return data;
  },

  async create(name: string): Promise<ISaidHelloResponse> {
    const { data } = await apiClient.post<ISaidHelloResponse>('/v1/hello', { name });
    return data;
  },

  /** Backend readiness (Postgres reachable). 503 is an answer here, not an error. */
  async readiness(): Promise<IReadiness> {
    const { data } = await apiClient.get<IReadiness>('/ready', { validateStatus: (s) => s === 200 || s === 503 });
    return data;
  },
};
