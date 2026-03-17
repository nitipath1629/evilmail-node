import type { HttpClient } from '../client.js';
import type {
  BatchCreateRandomEmailParams,
  RandomEmailBatch,
  RandomEmailPreview,
} from '../types.js';

/**
 * Generate random email accounts with auto-generated credentials.
 *
 * Requires a valid API key.
 */
export class RandomEmailResource {
  /** @internal */
  constructor(private readonly http: HttpClient) {}

  /**
   * Preview a randomly generated email address without creating it.
   *
   * Returns a random username, email, and password that can be used
   * to decide whether to proceed with account creation.
   *
   * @param passwordLength - Optional length for the generated password.
   * @returns Preview with username, email, password, and domain.
   *
   * @example
   * ```ts
   * const preview = await client.randomEmail.preview();
   * console.log(preview.email, preview.password);
   * ```
   */
  async preview(passwordLength?: number): Promise<RandomEmailPreview> {
    this.http.requireApiKey();
    const query = passwordLength ? { passwordLength } : undefined;
    return this.http.get<RandomEmailPreview>('/api/random-email', query);
  }

  /**
   * Batch create random email accounts.
   *
   * @param params - Domain, count, and optional password length.
   * @returns Batch result with count and array of created credentials.
   *
   * @example
   * ```ts
   * const batch = await client.randomEmail.createBatch({
   *   domain: 'yourdomain.com',
   *   count: 5,
   *   passwordLength: 20,
   * });
   * for (const entry of batch.emails) {
   *   console.log(`${entry.email}: ${entry.password}`);
   * }
   * ```
   */
  async createBatch(params: BatchCreateRandomEmailParams): Promise<RandomEmailBatch> {
    this.http.requireApiKey();
    const body: Record<string, unknown> = { domain: params.domain };
    if (params.count != null) body.count = params.count;
    if (params.passwordLength != null) body.passwordLength = params.passwordLength;

    return this.http.post<RandomEmailBatch>('/api/random-email', body);
  }
}
