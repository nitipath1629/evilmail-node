import type { HttpClient } from '../client.js';
import type { CustomerDomains, PublicDomains } from '../types.js';

/**
 * List available email domains.
 *
 * Provides access to both public domain listings (no auth required)
 * and authenticated customer domain listings.
 */
export class DomainsResource {
  /** @internal */
  constructor(private readonly http: HttpClient) {}

  /**
   * List all available domains for the authenticated customer.
   *
   * Returns free, premium, and custom domains grouped by tier,
   * along with the customer's package type.
   *
   * Requires a valid API key for full results. Without an API key,
   * returns only public domains with `authenticated: false`.
   *
   * @example
   * ```ts
   * const domains = await client.domains.list();
   * console.log('Free:', domains.free);
   * console.log('Premium:', domains.premium);
   * console.log('Custom:', domains.customer);
   * ```
   */
  async list(): Promise<CustomerDomains> {
    return this.http.get<CustomerDomains>('/api/ext/customer-domains');
  }

  /**
   * List publicly available domains (no authentication required).
   *
   * Returns free and premium domains along with supported TTL options
   * for temporary email creation.
   *
   * @example
   * ```ts
   * const pub = await client.domains.listPublic();
   * console.log('Domains:', pub.free);
   * console.log('TTL options:', pub.ttlOptions);
   * ```
   */
  async listPublic(): Promise<PublicDomains> {
    return this.http.get<PublicDomains>('/api/ext/domains');
  }
}
