import { request as httpsRequest, type RequestOptions as HttpsOptions } from 'node:https';
import { request as httpRequest } from 'node:http';
import type { IncomingMessage } from 'node:http';
import type { ApiResponse, RequestOptions } from './types.js';
import {
  ApiError,
  AuthenticationError,
  ConfigError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
  ValidationError,
} from './errors.js';

const DEFAULT_BASE_URL = 'https://evilmail.pro';
const DEFAULT_TIMEOUT = 30_000;
const SDK_VERSION = '1.0.0';

/**
 * Low-level HTTP transport built on `node:https` / `node:http`.
 *
 * Handles request serialisation, response parsing, envelope unwrapping,
 * timeout management, keep-alive, and error mapping. All resource classes
 * delegate their network calls to a shared {@link HttpClient} instance.
 */
export class HttpClient {
  readonly baseUrl: string;
  readonly timeout: number;
  private readonly apiKey: string;
  private readonly signal?: AbortSignal;

  constructor(apiKey: string, baseUrl?: string, timeout?: number, signal?: AbortSignal) {
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeout = timeout ?? DEFAULT_TIMEOUT;
    this.signal = signal;
  }

  // -----------------------------------------------------------------------
  // Public convenience methods
  // -----------------------------------------------------------------------

  /** Sends a GET request and returns the unwrapped response data. */
  async get<T>(
    path: string,
    query?: Record<string, string | number | undefined>,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>({ method: 'GET', path, query, signal });
  }

  /** Sends a POST request and returns the unwrapped response data. */
  async post<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return this.request<T>({ method: 'POST', path, body, signal });
  }

  /** Sends a PUT request and returns the unwrapped response data. */
  async put<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body, signal });
  }

  /** Sends a DELETE request and returns the unwrapped response data. */
  async delete<T>(
    path: string,
    opts?: { body?: unknown; query?: Record<string, string | number | undefined> },
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      path,
      body: opts?.body,
      query: opts?.query,
      signal,
    });
  }

  // -----------------------------------------------------------------------
  // Core request handler
  // -----------------------------------------------------------------------

  /**
   * Executes an HTTP request, parses the JSON response, unwraps the
   * `{ status, data }` envelope, and returns the inner `data` payload.
   *
   * Throws typed errors for non-2xx responses, timeouts, and network failures.
   */
  async request<T>(opts: RequestOptions): Promise<T> {
    const url = this.buildUrl(opts.path, opts.query);
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';

    const payload = opts.body != null ? JSON.stringify(opts.body) : undefined;

    const reqOpts: HttpsOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: opts.method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': `evilmail-node/${SDK_VERSION}`,
        ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
        ...(payload != null
          ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
          : {}),
      },
      timeout: this.timeout,
    };

    const effectiveSignal = opts.signal ?? this.signal;

    return new Promise<T>((resolve, reject) => {
      if (effectiveSignal?.aborted) {
        reject(new ApiError('Request aborted', 0, ''));
        return;
      }

      // Guard against multiple settle calls (e.g. abort + error)
      let settled = false;
      const safeResolve = (value: T) => { if (!settled) { settled = true; resolve(value); } };
      const safeReject = (reason: unknown) => { if (!settled) { settled = true; reject(reason); } };

      const transport = isHttps ? httpsRequest : httpRequest;
      const req = transport(reqOpts, (res: IncomingMessage) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk: Buffer) => chunks.push(chunk));

        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8');
          const status = res.statusCode ?? 0;

          if (status >= 200 && status < 300) {
            // Handle empty body (e.g. 204 No Content or void endpoints)
            if (!body || body.trim().length === 0) {
              safeResolve(undefined as T);
              return;
            }

            try {
              const json = JSON.parse(body) as ApiResponse<T>;

              if (json.status === 'not_found') {
                safeReject(new NotFoundError(json.message ?? 'Not found', status, body, json.status));
                return;
              }

              if (json.status === 'error') {
                safeReject(this.mapError(status, body));
                return;
              }

              safeResolve(json.data as T);
            } catch {
              // Non-JSON 2xx response — return raw body as unknown
              safeResolve(body as unknown as T);
            }
          } else {
            safeReject(this.mapError(status, body));
          }
        });

        res.on('error', (err: Error) => {
          safeReject(new ApiError(`Response stream error: ${err.message}`, res.statusCode ?? 0, '', undefined));
        });
      });

      req.on('timeout', () => {
        req.destroy();
        safeReject(new TimeoutError(this.timeout));
      });

      req.on('error', (err: Error & { code?: string }) => {
        if (err.code === 'ABORT_ERR' || err.name === 'AbortError') {
          safeReject(new ApiError('Request aborted', 0, ''));
        } else {
          safeReject(new ApiError(`Network error: ${err.message}`, 0, '', undefined));
        }
      });

      if (effectiveSignal) {
        const onAbort = () => {
          req.destroy();
          safeReject(new ApiError('Request aborted', 0, ''));
        };
        effectiveSignal.addEventListener('abort', onAbort, { once: true });
        req.on('close', () => effectiveSignal.removeEventListener('abort', onAbort));
      }

      if (payload != null) {
        req.write(payload);
      }

      req.end();
    });
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  /** Throws a {@link ConfigError} if no API key was provided. */
  requireApiKey(): void {
    if (!this.apiKey) {
      throw new ConfigError('An API key is required for this operation. Pass it to the EvilMail constructor.');
    }
  }

  /** Builds a full URL from a path and optional query parameters. */
  private buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
    const url = new URL(path, this.baseUrl);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Maps an HTTP status code to the appropriate typed error.
   */
  private mapError(statusCode: number, body: string): ApiError {
    let message = `API error (${statusCode})`;
    let apiStatus: string | undefined;

    try {
      const json = JSON.parse(body) as ApiResponse;
      if (json.message) message = json.message;
      apiStatus = json.status;
    } catch {
      // Body is not JSON — use raw body as message if short enough
      if (body.length > 0 && body.length < 200) message = body;
    }

    switch (statusCode) {
      case 401:
      case 403:
        return new AuthenticationError(message, statusCode, body, apiStatus);
      case 404:
        return new NotFoundError(message, statusCode, body, apiStatus);
      case 429:
        return new RateLimitError(message, statusCode, body, apiStatus);
      case 400:
      case 422:
        return new ValidationError(message, statusCode, body, apiStatus);
      default:
        return new ApiError(message, statusCode, body, apiStatus);
    }
  }
}
