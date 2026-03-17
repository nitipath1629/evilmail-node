import type { HttpClient } from '../client.js';
import type {
  CreateTempEmailOptions,
  Message,
  TempEmailInfo,
  TempEmailSession,
} from '../types.js';

/**
 * Manage temporary disposable email addresses.
 *
 * Temp emails are anonymous, require no API key, and expire automatically
 * after the configured TTL. Use the session token returned by {@link create}
 * to read messages and manage the session.
 */
export class TempEmailResource {
  /** @internal */
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a new temporary email address.
   *
   * @param options - Optional domain and TTL configuration.
   * @returns Session details including the email address and token.
   *
   * @example
   * ```ts
   * const session = await client.tempEmail.create({ domain: 'evilmail.pro', ttlMinutes: 60 });
   * console.log(session.email, session.sessionToken);
   * ```
   */
  async create(options?: CreateTempEmailOptions): Promise<TempEmailSession> {
    const body: Record<string, unknown> = {};
    if (options?.domain) body.domain = options.domain;
    if (options?.ttlMinutes) body.ttlMinutes = options.ttlMinutes;

    return this.http.post<TempEmailSession>('/api/ext/temp-email', body);
  }

  /**
   * Retrieve the current status of a temporary email session.
   *
   * @param token - Session token from {@link create}.
   * @returns Session information including email, domain, and expiry.
   */
  async getSession(token: string): Promise<TempEmailInfo> {
    return this.http.get<TempEmailInfo>('/api/ext/temp-email', { token });
  }

  /**
   * Read a specific message from a temporary email inbox.
   *
   * @param token - Session token from {@link create}.
   * @param uid   - Message UID (numeric identifier).
   * @returns Full message content including headers, text, and HTML body.
   */
  async getMessage(token: string, uid: number): Promise<Message> {
    return this.http.get<Message>(`/api/ext/message/${encodeURIComponent(uid)}`, { token });
  }

  /**
   * Permanently delete a temporary email session.
   *
   * This removes the mailbox and all associated messages. The session
   * token becomes invalid after deletion.
   *
   * @param token - Session token from {@link create}.
   */
  async delete(token: string): Promise<void> {
    await this.http.delete<unknown>('/api/ext/temp-email', { query: { token } });
  }
}
