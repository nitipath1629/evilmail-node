import type { HttpClient } from '../client.js';
import type { VerificationCode, VerificationService } from '../types.js';

/** All services supported by the verification code extractor. */
const SUPPORTED_SERVICES: ReadonlySet<string> = new Set([
  'facebook', 'twitter', 'google', 'icloud',
  'instagram', 'tiktok', 'discord', 'linkedin',
]);

/**
 * Extract OTP verification codes from emails sent by popular services.
 *
 * The API uses regex-based extraction to parse verification codes from
 * the latest matching email in the target inbox.
 *
 * Requires a valid API key.
 */
export class VerificationResource {
  /** @internal */
  constructor(private readonly http: HttpClient) {}

  /**
   * Extract the latest verification code for a given service.
   *
   * @param service - Service name (e.g. `'google'`, `'facebook'`).
   * @param email   - Email address to search for verification emails.
   * @returns The extracted verification code and metadata.
   * @throws {@link import('../errors.js').NotFoundError} if no matching email is found.
   *
   * @example
   * ```ts
   * const result = await client.verification.getCode('google', 'user@yourdomain.com');
   * console.log(`Code: ${result.code}`);
   * ```
   */
  async getCode(service: VerificationService, email: string): Promise<VerificationCode> {
    this.http.requireApiKey();
    return this.http.get<VerificationCode>(
      `/api/regex/${encodeURIComponent(service)}`,
      { email },
    );
  }

  /**
   * Returns the list of supported service names.
   *
   * Useful for validating user input before making an API call.
   */
  static supportedServices(): VerificationService[] {
    return [...SUPPORTED_SERVICES] as VerificationService[];
  }

  /**
   * Check whether a service name is supported.
   *
   * @param service - Service name to validate.
   */
  static isSupported(service: string): service is VerificationService {
    return SUPPORTED_SERVICES.has(service);
  }
}
