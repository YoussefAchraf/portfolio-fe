/**
 * LAYER    shared/types
 * ROLE     Mirror of the backend error-code catalog (et-be src/domain/errors/errorCodes.ts, contract:
 *          contracts/conventions.md) plus the two client-only codes. The UI branches on these codes and
 *          renders t('common:errors.<CODE>') - never on HTTP statuses or message strings.
 * RULES    Change only together with the backend catalog. Every code needs a translation in every locale.
 */
export const ERROR_CODES = [
  'VALIDATION_FAILED',
  'UNAUTHENTICATED',
  'INVALID_CREDENTIALS',
  'FORBIDDEN',
  'CSRF_INVALID',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
  'NETWORK_ERROR',
  'TIMEOUT',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && (ERROR_CODES as readonly string[]).includes(value);
}
