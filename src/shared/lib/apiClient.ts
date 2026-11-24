/**
 * LAYER    shared/lib
 * ROLE     The single HTTP client and the ONLY file that imports axios (lint). Base URL /api: the Vite dev
 *          proxy and nginx forward it to the backend and strip the prefix (/api/v1/hello -> /v1/hello).
 *          Every failure is converted to ApiError here, so no other file ever sees an axios error.
 * USED BY  features/<name>/api/*.ts ONLY (lint forbids hooks, components, pages, routes, app).
 * LATER    The auth feature adds here: X-CSRF-Token on unsafe methods and one shared 401 refresh.
 */
import axios from 'axios';
import { ApiError } from './apiError';
import { env } from './env';
import { isErrorCode } from '../types/errorCodes';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10_000,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

interface IErrorEnvelope {
  error?: unknown;
  code?: unknown;
  details?: { fields?: Record<string, string> };
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!axios.isAxiosError(error)) return new ApiError('INTERNAL_ERROR', 0, 'Unexpected client error');
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return new ApiError('TIMEOUT', 0, 'The server took too long to answer');
  if (!error.response) return new ApiError('NETWORK_ERROR', 0, 'The server could not be reached');

  const { status, data } = error.response as { status: number; data: IErrorEnvelope | undefined };
  const code = isErrorCode(data?.code) ? data.code : status >= 500 ? 'INTERNAL_ERROR' : 'VALIDATION_FAILED';
  const message = typeof data?.error === 'string' ? data.error : `Request failed (${status})`;
  return new ApiError(code, status, message, data?.details?.fields ?? {});
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
