import { HttpClient } from './client.js';
import type { ClientOptions } from './types.js';
import { AccountsResource } from './resources/accounts.js';
import { DomainsResource } from './resources/domains.js';
import { InboxResource } from './resources/inbox.js';
import { RandomEmailResource } from './resources/random-email.js';
import { ShortlinksResource } from './resources/shortlinks.js';
import { TempEmailResource } from './resources/temp-email.js';
import { VerificationResource } from './resources/verification.js';

/**
 * EvilMail Node.js SDK client.
 *
 * Provides a clean, typed interface for every EvilMail API endpoint:
 * temporary email, accounts, inbox, verification codes, random email
 * generation, domain management, and shortlinks.
 *
 * Built on `node:https` with zero external dependencies.
 *
 * @example
 * ```ts
 * import { EvilMail } from 'evilmail';
 *
 * const client = new EvilMail('your-api-key');
 *
 * // Create a temporary email
 * const temp = await client.tempEmail.create({ ttlMinutes: 60 });
 * console.log(temp.email);
 *
 * // Extract a verification code
 * const code = await client.verification.getCode('google', 'user@yourdomain.com');
 * console.log(code.code);
 * ```
 */
export class EvilMail {
  /** @internal */
  private readonly http: HttpClient;

  /** Manage temporary disposable email addresses. */
  readonly tempEmail: TempEmailResource;

  /** Manage persistent email accounts on custom domains. */
  readonly accounts: AccountsResource;

  /** Read messages from persistent email account inboxes. */
  readonly inbox: InboxResource;

  /** Extract OTP verification codes from popular service emails. */
  readonly verification: VerificationResource;

  /** Generate random email accounts with auto-generated credentials. */
  readonly randomEmail: RandomEmailResource;

  /** List available email domains (free, premium, custom). */
  readonly domains: DomainsResource;

  /** Create short URLs for temporary email sessions. */
  readonly shortlinks: ShortlinksResource;

  /**
   * Create a new EvilMail client.
   *
   * @param apiKey  - Your EvilMail API key. Required for authenticated
   *                  endpoints (accounts, inbox, verification, random email).
   *                  Can be empty for public-only usage (temp email, domains).
   * @param options - Optional client configuration.
   */
  constructor(apiKey: string, options?: ClientOptions) {
    this.http = new HttpClient(
      apiKey,
      options?.baseUrl,
      options?.timeout,
      options?.signal,
    );

    this.tempEmail = new TempEmailResource(this.http);
    this.accounts = new AccountsResource(this.http);
    this.inbox = new InboxResource(this.http);
    this.verification = new VerificationResource(this.http);
    this.randomEmail = new RandomEmailResource(this.http);
    this.domains = new DomainsResource(this.http);
    this.shortlinks = new ShortlinksResource(this.http);
  }

  /** The base URL this client is configured to use. */
  get baseUrl(): string {
    return this.http.baseUrl;
  }

  /** The request timeout in milliseconds. */
  get timeout(): number {
    return this.http.timeout;
  }
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

// Client
export { HttpClient } from './client.js';
export type { ClientOptions } from './types.js';

// Types
export type {
  // Temp email
  CreateTempEmailOptions,
  TempEmailSession,
  TempEmailInfo,
  // Messages
  AddressObject,
  Message,
  InboxMessage,
  // Accounts
  Account,
  CreatedAccount,
  DeleteResult,
  CreateAccountParams,
  ChangePasswordParams,
  // Verification
  VerificationCode,
  VerificationService,
  // Random email
  RandomEmailPreview,
  RandomEmailEntry,
  RandomEmailBatch,
  BatchCreateRandomEmailParams,
  // Domains
  PublicDomains,
  CustomerDomains,
  // Shortlinks
  CreateShortlinkParams,
  Shortlink,
  // HTTP internals (advanced)
  ApiResponse,
  HttpMethod,
  RequestOptions,
} from './types.js';

// Errors
export {
  EvilMailError,
  ApiError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  TimeoutError,
  ConfigError,
  // Predicates
  isEvilMailError,
  isApiError,
  isAuthError,
  isNotFoundError,
  isRateLimitError,
  isValidationError,
  isTimeoutError,
} from './errors.js';

// Resources (for advanced usage / extension)
export { TempEmailResource } from './resources/temp-email.js';
export { AccountsResource } from './resources/accounts.js';
export { InboxResource } from './resources/inbox.js';
export { VerificationResource } from './resources/verification.js';
export { RandomEmailResource } from './resources/random-email.js';
export { DomainsResource } from './resources/domains.js';
export { ShortlinksResource } from './resources/shortlinks.js';
