import type { HttpClient } from '../client.js';
import type { InboxMessage, Message } from '../types.js';

/**
 * Read messages from persistent email account inboxes.
 *
 * All methods require a valid API key and the email address must belong
 * to a verified custom domain owned by the authenticated customer.
 */
export class InboxResource {
  /** @internal */
  constructor(private readonly http: HttpClient) {}

  /**
   * List all messages in an account's inbox.
   *
   * @param email - Email address to fetch the inbox for.
   * @returns Array of inbox messages with sender, subject, date, and preview.
   *
   * @example
   * ```ts
   * const messages = await client.inbox.list('user@yourdomain.com');
   * for (const msg of messages) {
   *   console.log(`[${msg.uid}] ${msg.from}: ${msg.subject}`);
   * }
   * ```
   */
  async list(email: string): Promise<InboxMessage[]> {
    this.http.requireApiKey();
    return this.http.get<InboxMessage[]>('/api/ext/accounts/inbox', { email });
  }

  /**
   * Read the full content of a specific message.
   *
   * @param uid   - Message UID (numeric identifier).
   * @param email - Email address the message belongs to.
   * @returns Full message with text body, HTML body, headers, and metadata.
   */
  async getMessage(uid: number, email: string): Promise<Message> {
    this.http.requireApiKey();
    return this.http.get<Message>(
      `/api/ext/accounts/message/${encodeURIComponent(uid)}`,
      { email },
    );
  }
}
