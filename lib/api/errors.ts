/** Error codes the API returns as `{ error: { code, message } }` (CLAUDE.md §2.2). */
export type ApiErrorCode =
  | 'INSUFFICIENT_BALANCE'
  | 'BELOW_MINIMUM'
  | 'ABOVE_DAILY_LIMIT'
  | 'WRONG_PIN'
  | 'EMAIL_NOT_CONFIRMED'
  | 'DUPLICATE_REFERENCE'
  | 'ALREADY_CLAIMED'
  | 'NO_ACTIVE_PACKAGE'
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'NOT_AVAILABLE';

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    /** Extra facts, e.g. `{ missing: 12000n }` for INSUFFICIENT_BALANCE. */
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

/** A fresh key for one money action, sent as `Idempotency-Key` (CLAUDE.md §5). */
export function newIdempotencyKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
}
