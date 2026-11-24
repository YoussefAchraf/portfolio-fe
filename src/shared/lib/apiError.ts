/**
 * LAYER    shared/lib
 * ROLE     The ONE error type every network failure becomes (built by apiClient.ts). Components and hooks
 *          read `code` (translated via common:errors.<CODE>) and `fields` (form errors), nothing else.
 */
import type { ErrorCode } from '../types/errorCodes';

export class ApiError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly status: number,
    message: string,
    /** VALIDATION_FAILED only: field -> i18n key (contract: details.fields). */
    readonly fields: Readonly<Record<string, string>> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}
