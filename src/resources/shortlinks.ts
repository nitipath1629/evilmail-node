import type { HttpClient } from '../client.js';
import type { CreateShortlinkParams, Shortlink } from '../types.js';

/**
 * Create short URLs for temporary email sessions and messages.
 *
 * Shortlinks are stored in Redis and expire with the session.
 */
export class ShortlinksResource {
  /** @internal */
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a shortlink for a temporary email session or message.
   *
   * @param params - Session token, link type, and optional message UID.
   * @returns The generated short code and full URL.
   *
   * @example
   * ```ts
   * const link = await client.shortlinks.create({
   *   token: session.sessionToken,
   *   type: 'read',
   *   uid: 1,
   * });
   * console.log(link.url);
   * ```
   */
  async create(params: CreateShortlinkParams): Promise<Shortlink> {
    const body: Record<string, unknown> = {
      token: params.token,
      type: params.type,
    };
    if (params.uid != null) body.uid = params.uid;

    return this.http.post<Shortlink>('/api/ext/shortlink', body);
  }
}
