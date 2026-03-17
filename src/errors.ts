/**
 * Base error class for all EvilMail SDK errors.
 *
 * Every error thrown by this library extends {@link EvilMailError},
 * making it possible to catch all SDK errors in a single handler.
 */
export class EvilMailError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'EvilMailError';
  }
}

/**
 * Thrown when the API returns a non-2xx HTTP response.
 *
 * Provides the HTTP status code, raw response body, and convenience
 * predicates for common status codes.
 */
export class ApiError extends EvilMailError {
  constructor(
    message: string,
    /** HTTP status code returned by the server. */
    readonly statusCode: number,
    /** Raw response body string. */
    readonly body: string,
    /** Parsed `status` field from the JSON response, if available. */
    readonly apiStatus?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** `true` when the server returned HTTP 401. */
  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  /** `true` when the server returned HTTP 403. */
  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  /** `true` when the server returned HTTP 404. */
  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  /** `true` when the server returned HTTP 429. */
  get isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  /** `true` when the server returned a 5xx status. */
  get isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }
}

/**
 * Thrown for HTTP 401 and 403 responses.
 *
 * Indicates an invalid, expired, or missing API key.
 */
export class AuthenticationError extends ApiError {
  constructor(message: string, statusCode: number, body: string, apiStatus?: string) {
    super(message, statusCode, body, apiStatus);
    this.name = 'AuthenticationError';
  }
}

/**
 * Thrown for HTTP 404 responses.
 *
 * The requested resource (account, message, session, etc.) was not found.
 */
export class NotFoundError extends ApiError {
  constructor(message: string, statusCode: number, body: string, apiStatus?: string) {
    super(message, statusCode, body, apiStatus);
    this.name = 'NotFoundError';
  }
}

/**
 * Thrown for HTTP 429 responses.
 *
 * Too many requests — back off and retry after a delay.
 */
export class RateLimitError extends ApiError {
  constructor(message: string, statusCode: number, body: string, apiStatus?: string) {
    super(message, statusCode, body, apiStatus);
    this.name = 'RateLimitError';
  }
}

/**
 * Thrown for HTTP 400 and 422 responses.
 *
 * The request contained invalid parameters.
 */
export class ValidationError extends ApiError {
  constructor(message: string, statusCode: number, body: string, apiStatus?: string) {
    super(message, statusCode, body, apiStatus);
    this.name = 'ValidationError';
  }
}

/**
 * Thrown when a request exceeds the configured timeout.
 */
export class TimeoutError extends EvilMailError {
  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Thrown when client-side validation fails before the request is sent.
 *
 * For example, calling a method that requires an API key without one.
 */
export class ConfigError extends EvilMailError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

// ---------------------------------------------------------------------------
// Helper predicates for `errors.is*` pattern
// ---------------------------------------------------------------------------

/** Returns `true` if the error is any {@link EvilMailError}. */
export function isEvilMailError(err: unknown): err is EvilMailError {
  return err instanceof EvilMailError;
}

/** Returns `true` if the error is an {@link ApiError}. */
export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

/** Returns `true` if the error is an {@link AuthenticationError}. */
export function isAuthError(err: unknown): err is AuthenticationError {
  return err instanceof AuthenticationError;
}

/** Returns `true` if the error is a {@link NotFoundError}. */
export function isNotFoundError(err: unknown): err is NotFoundError {
  return err instanceof NotFoundError;
}

/** Returns `true` if the error is a {@link RateLimitError}. */
export function isRateLimitError(err: unknown): err is RateLimitError {
  return err instanceof RateLimitError;
}

/** Returns `true` if the error is a {@link ValidationError}. */
export function isValidationError(err: unknown): err is ValidationError {
  return err instanceof ValidationError;
}

/** Returns `true` if the error is a {@link TimeoutError}. */
export function isTimeoutError(err: unknown): err is TimeoutError {
  return err instanceof TimeoutError;
}
