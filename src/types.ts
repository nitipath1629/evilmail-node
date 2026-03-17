// ---------------------------------------------------------------------------
// Client configuration
// ---------------------------------------------------------------------------

/** Configuration options for the EvilMail client. */
export interface ClientOptions {
  /** Base URL for the EvilMail API. Defaults to `https://evilmail.pro`. */
  baseUrl?: string;
  /** Request timeout in milliseconds. Defaults to `30_000` (30 s). */
  timeout?: number;
  /** Optional {@link AbortSignal} to cancel all in-flight requests. */
  signal?: AbortSignal;
}

// ---------------------------------------------------------------------------
// Temp email
// ---------------------------------------------------------------------------

export interface CreateTempEmailOptions {
  /** Preferred domain for the disposable address. */
  domain?: string;
  /** Time-to-live in minutes (10, 30, 60, 360, or 1440). */
  ttlMinutes?: number;
}

export interface TempEmailSession {
  email: string;
  domain: string;
  sessionToken: string;
  ttlMinutes: number;
  expiresAt: string;
}

export interface TempEmailInfo {
  email: string;
  domain: string;
  ttlMinutes: number;
  expiresAt: string;
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export interface AddressObject {
  name?: string;
  address?: string;
}

export interface Message {
  uid: number;
  from: AddressObject[] | string;
  to: string[];
  subject: string;
  date: string;
  text: string;
  html: string;
  headers: Record<string, unknown>;
}

export interface InboxMessage {
  uid: number;
  from: string;
  subject: string;
  date: string;
  text?: string;
  html?: string;
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export interface Account {
  email: string;
  domain: string;
  createdAt: string;
}

export interface CreatedAccount {
  email: string;
}

export interface DeleteResult {
  deletedCount: number;
}

export interface CreateAccountParams {
  email: string;
  password: string;
}

export interface ChangePasswordParams {
  email: string;
  newPassword: string;
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

export interface VerificationCode {
  code: string;
  service: string;
  email: string;
  from: string;
  subject: string;
  date: string;
}

export type VerificationService =
  | 'facebook'
  | 'twitter'
  | 'google'
  | 'icloud'
  | 'instagram'
  | 'tiktok'
  | 'discord'
  | 'linkedin';

// ---------------------------------------------------------------------------
// Random email
// ---------------------------------------------------------------------------

export interface RandomEmailPreview {
  username: string;
  email: string;
  password: string;
  domain: string;
}

export interface RandomEmailEntry {
  email: string;
  password: string;
  note?: string;
}

export interface RandomEmailBatch {
  count: number;
  emails: RandomEmailEntry[];
  /** Present when the requested count was reduced due to plan quota limits. */
  note?: string;
}

export interface BatchCreateRandomEmailParams {
  domain: string;
  count?: number;
  passwordLength?: number;
}

// ---------------------------------------------------------------------------
// Domains
// ---------------------------------------------------------------------------

export interface PublicDomains {
  free: string[];
  premium: string[];
  ttlOptions: number[];
}

export interface CustomerDomains {
  free: string[];
  premium: string[];
  customer: string[];
  packageType: string | null;
  authenticated: boolean;
}

// ---------------------------------------------------------------------------
// Shortlinks
// ---------------------------------------------------------------------------

export interface CreateShortlinkParams {
  token: string;
  type: 'read' | 'open';
  uid?: number | null;
}

export interface Shortlink {
  code: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Internal HTTP types
// ---------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error' | 'not_found';
  data?: T;
  message?: string;
  messageKey?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method: HttpMethod;
  path: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}
