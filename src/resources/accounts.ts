import type { HttpClient } from '../client.js';
import type {
  Account,
  ChangePasswordParams,
  CreateAccountParams,
  CreatedAccount,
  DeleteResult,
} from '../types.js';

/**
 * Manage persistent email accounts on your custom domains.
 *
 * All methods require a valid API key.
 */
export class AccountsResource {
  /** @internal */
  constructor(private readonly http: HttpClient) {}

  /**
   * List all email accounts belonging to the authenticated customer.
   *
   * @returns Array of account objects with email, domain, and creation date.
   *
   * @example
   * ```ts
   * const accounts = await client.accounts.list();
   * for (const acct of accounts) {
   *   console.log(acct.email, acct.domain);
   * }
   * ```
   */
  async list(): Promise<Account[]> {
    this.http.requireApiKey();
    return this.http.get<Account[]>('/api/accounts');
  }

  /**
   * Create a new email account on a verified custom domain.
   *
   * @param params - Email address and password for the new account.
   * @returns The created account's email address.
   */
  async create(params: CreateAccountParams): Promise<CreatedAccount> {
    this.http.requireApiKey();
    return this.http.post<CreatedAccount>('/api/accounts', {
      email: params.email,
      password: params.password,
    });
  }

  /**
   * Delete one or more email accounts.
   *
   * @param emails - Array of email addresses to delete.
   * @returns The number of accounts that were deleted.
   */
  async delete(emails: string[]): Promise<DeleteResult> {
    this.http.requireApiKey();
    return this.http.delete<DeleteResult>('/api/accounts', {
      body: { emails },
    });
  }

  /**
   * Change the password for an existing email account.
   *
   * @param params - Email address and new password.
   */
  async changePassword(params: ChangePasswordParams): Promise<void> {
    this.http.requireApiKey();
    await this.http.put<unknown>('/api/accounts/password', {
      email: params.email,
      newPassword: params.newPassword,
    });
  }
}
