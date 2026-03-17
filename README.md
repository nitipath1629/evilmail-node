<p align="center">
  <a href="https://evilmail.pro">
    <img src="https://avatars.githubusercontent.com/u/267867069?v=4" alt="EvilMail Logo" width="120" height="120" style="border-radius: 20px;">
  </a>
</p>

<h1 align="center">EvilMail Node.js SDK</h1>

<p align="center">
  <strong>Official Node.js / TypeScript client library for the <a href="https://evilmail.pro">EvilMail</a> disposable email API</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/evilmail"><img src="https://img.shields.io/npm/v/evilmail.svg?style=flat-square&color=blue" alt="npm Version"></a>
  <a href="https://www.npmjs.com/package/evilmail"><img src="https://img.shields.io/npm/dm/evilmail.svg?style=flat-square&color=green" alt="Monthly Downloads"></a>
  <a href="https://www.npmjs.com/package/evilmail"><img src="https://img.shields.io/node/v/evilmail.svg?style=flat-square" alt="Node.js Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-strict-blue.svg?style=flat-square" alt="TypeScript"></a>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#error-handling">Error Handling</a> •
  <a href="https://evilmail.pro/docs">Documentation</a>
</p>

---

The **EvilMail Node.js SDK** provides a modern, fully-typed TypeScript interface for integrating temporary email, disposable email addresses, email verification code extraction, inbox management, and custom domain email services into your Node.js applications. **Zero runtime dependencies** — built entirely on `node:https` and the Node.js standard library.

## Features

- **Zero Dependencies** — No runtime dependencies, built on `node:https` only
- **Full TypeScript** — Strict mode, complete type definitions, source maps, declaration maps
- **ESM + CommonJS** — Dual-package output with proper `exports` map for both module systems
- **Temporary Email** — Create anonymous disposable email addresses with configurable TTL
- **Email Verification Codes** — Auto-extract OTP codes from Google, Facebook, Instagram, TikTok, Discord, Twitter, LinkedIn, iCloud
- **Account Management** — Full CRUD for persistent email accounts on custom domains
- **Inbox Access** — Read emails, list messages, fetch full HTML & plain text content
- **Random Email Generator** — Batch create random email accounts with auto-generated passwords
- **Domain Management** — List free, premium, and custom email domains
- **Shortlink Creation** — Generate short URLs for temporary email sessions
- **AbortSignal Support** — Cancel any in-flight request using native `AbortController`
- **Typed Errors** — Granular error classes with `instanceof` checks and predicate helpers
- **Keep-Alive** — Efficient HTTP connection reuse via Node.js agent

## Requirements

- **Node.js 18** or later
- An EvilMail API key — [Get yours free](https://evilmail.pro)

## Installation

```bash
npm install evilmail
```

```bash
yarn add evilmail
```

```bash
pnpm add evilmail
```

## Quick Start

```typescript
import { EvilMail } from 'evilmail';

const client = new EvilMail('your-api-key');

// Create a temporary disposable email address
const temp = await client.tempEmail.create({ domain: 'evilmail.pro', ttlMinutes: 60 });
console.log(`Email: ${temp.email}`);
console.log(`Token: ${temp.sessionToken}`);

// Check session status
const session = await client.tempEmail.getSession(temp.sessionToken);
console.log(`Expires: ${session.expiresAt}`);

// Read a specific message from temp inbox
const message = await client.tempEmail.getMessage(temp.sessionToken, 1);
console.log(`Subject: ${message.subject}`);

// Extract a Google verification code
const code = await client.verification.getCode('google', 'user@yourdomain.com');
console.log(`OTP Code: ${code.code}`);

// List all email accounts
const accounts = await client.accounts.list();
for (const acct of accounts) {
  console.log(`${acct.email} (${acct.domain})`);
}

// Batch create random email accounts
const batch = await client.randomEmail.createBatch({
  domain: 'yourdomain.com',
  count: 5,
  passwordLength: 20,
});
for (const entry of batch.emails) {
  console.log(`${entry.email}: ${entry.password}`);
}

// Clean up
await client.tempEmail.delete(temp.sessionToken);
```

### CommonJS Usage

```javascript
const { EvilMail } = require('evilmail');

const client = new EvilMail('your-api-key');

async function main() {
  const temp = await client.tempEmail.create({ ttlMinutes: 30 });
  console.log(temp.email);
}

main();
```

## Configuration

```typescript
import { EvilMail } from 'evilmail';

// Basic
const client = new EvilMail('your-api-key');

// Custom settings
const client = new EvilMail('your-api-key', {
  baseUrl: 'https://evilmail.pro',  // default
  timeout: 60_000,                   // milliseconds, default 30_000
});

// With AbortController for cancellation
const controller = new AbortController();
const client = new EvilMail('your-api-key', {
  signal: controller.signal,
});

// Cancel all in-flight requests
controller.abort();
```

---

## API Reference

### Temporary Email

Create anonymous, disposable email addresses with automatic expiration. Perfect for sign-up verification, automated testing, and privacy protection.

#### `client.tempEmail.create(options?)`

Create a new temporary email address.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options.domain` | `string` | No | Preferred domain for the disposable address |
| `options.ttlMinutes` | `number` | No | Time-to-live in minutes (10, 30, 60, 360, 1440) |

Returns: `Promise<TempEmailSession>` — `email`, `domain`, `sessionToken`, `ttlMinutes`, `expiresAt`

#### `client.tempEmail.getSession(token)`

Check if a temporary email session is still active and retrieve session details.

#### `client.tempEmail.getMessage(token, uid)`

Read a specific message from a temporary email inbox.

#### `client.tempEmail.delete(token)`

Permanently delete a temporary email session and all associated messages.

---

### Accounts

Manage persistent email accounts on your custom domains. Requires API key.

#### `client.accounts.list()`

Returns: `Promise<Account[]>` — `email`, `domain`, `createdAt`

#### `client.accounts.create({ email, password })`

Returns: `Promise<CreatedAccount>` — `email`

#### `client.accounts.delete(emails)`

Returns: `Promise<DeleteResult>` — `deletedCount`

#### `client.accounts.changePassword({ email, newPassword })`

---

### Inbox

Read emails from persistent account inboxes. Requires API key.

#### `client.inbox.list(email)`

Returns: `Promise<InboxMessage[]>` — `uid`, `from`, `subject`, `date`, `text`, `html`

#### `client.inbox.getMessage(uid, email)`

Returns: `Promise<Message>` — `uid`, `from`, `to`, `subject`, `date`, `text`, `html`, `headers`

---

### Verification Codes

Automatically extract OTP verification codes from emails sent by popular services. Requires API key.

#### `client.verification.getCode(service, email)`

| Service | Constant |
|---------|----------|
| Facebook | `'facebook'` |
| Twitter / X | `'twitter'` |
| Google | `'google'` |
| iCloud | `'icloud'` |
| Instagram | `'instagram'` |
| TikTok | `'tiktok'` |
| Discord | `'discord'` |
| LinkedIn | `'linkedin'` |

Returns: `Promise<VerificationCode>` — `code`, `service`, `email`, `from`, `subject`, `date`

#### `VerificationResource.supportedServices()`

Static method returning all supported service names.

#### `VerificationResource.isSupported(service)`

Static type guard for validating service names.

---

### Random Email

Generate random email accounts with secure auto-generated credentials. Requires API key.

#### `client.randomEmail.preview(passwordLength?)`

Returns: `Promise<RandomEmailPreview>` — `username`, `email`, `password`, `domain`

#### `client.randomEmail.createBatch(params)`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params.domain` | `string` | Yes | Domain for the new email accounts |
| `params.count` | `number` | No | Number of accounts to create |
| `params.passwordLength` | `number` | No | Length of generated passwords |

Returns: `Promise<RandomEmailBatch>` — `count`, `emails`, `note?`

---

### Domains

List available email domains by tier.

#### `client.domains.list()`

Returns: `Promise<CustomerDomains>` — `free`, `premium`, `customer`, `packageType`, `authenticated`

#### `client.domains.listPublic()`

Returns: `Promise<PublicDomains>` — `free`, `premium`, `ttlOptions`

---

### Shortlinks

Generate short URLs for temporary email sessions and messages.

#### `client.shortlinks.create(params)`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params.token` | `string` | Yes | Session token |
| `params.type` | `'read' \| 'open'` | Yes | Link type |
| `params.uid` | `number` | No | Message UID |

Returns: `Promise<Shortlink>` — `code`, `url`

---

## Error Handling

The SDK provides a structured error hierarchy with typed exception classes:

```typescript
import {
  EvilMail,
  EvilMailError,       // Base class for all SDK errors
  ApiError,            // Non-2xx HTTP response
  AuthenticationError, // 401 / 403 — invalid API key
  NotFoundError,       // 404 — resource not found
  RateLimitError,      // 429 — too many requests
  ValidationError,     // 400 / 422 — invalid parameters
  TimeoutError,        // Request timeout exceeded
  ConfigError,         // Client misconfiguration (e.g. missing API key)
} from 'evilmail';

const client = new EvilMail('your-api-key');

try {
  const code = await client.verification.getCode('google', 'user@yourdomain.com');
  console.log(`Code: ${code.code}`);
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log('No verification email found yet');
  } else if (err instanceof RateLimitError) {
    console.log('Too many requests — slow down');
  } else if (err instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (err instanceof ApiError) {
    console.log(`API error ${err.statusCode}: ${err.message}`);
    console.log('Is server error:', err.isServerError);
  } else if (err instanceof TimeoutError) {
    console.log('Request timed out');
  }
}
```

### Predicate Helpers

For functional error checking without `instanceof`:

```typescript
import { isNotFoundError, isRateLimitError, isApiError } from 'evilmail';

try {
  await client.inbox.getMessage(999, 'user@yourdomain.com');
} catch (err) {
  if (isNotFoundError(err)) console.log('Not found');
  if (isRateLimitError(err)) console.log('Rate limited');
  if (isApiError(err)) console.log(`Status: ${err.statusCode}`);
}
```

### ApiError Properties

| Property | Type | Description |
|----------|------|-------------|
| `statusCode` | `number` | HTTP status code |
| `body` | `string` | Raw response body |
| `apiStatus` | `string?` | Parsed API status field |
| `isUnauthorized` | `boolean` | `true` for 401 |
| `isForbidden` | `boolean` | `true` for 403 |
| `isNotFound` | `boolean` | `true` for 404 |
| `isRateLimited` | `boolean` | `true` for 429 |
| `isServerError` | `boolean` | `true` for 5xx |

---

## AbortController Support

Cancel any in-flight request using the native `AbortController`:

```typescript
const controller = new AbortController();

// Global abort signal — cancels all requests
const client = new EvilMail('your-api-key', {
  signal: controller.signal,
});

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const temp = await client.tempEmail.create({ ttlMinutes: 60 });
} catch (err) {
  if (err instanceof ApiError && err.message === 'Request aborted') {
    console.log('Request was cancelled');
  }
}
```

---

## TypeScript

The SDK ships with complete TypeScript declarations for both ESM and CommonJS. All types are exported from the main entry point:

```typescript
import type {
  TempEmailSession,
  TempEmailInfo,
  Message,
  InboxMessage,
  Account,
  CreatedAccount,
  DeleteResult,
  VerificationCode,
  VerificationService,
  RandomEmailPreview,
  RandomEmailBatch,
  PublicDomains,
  CustomerDomains,
  Shortlink,
  ClientOptions,
} from 'evilmail';
```

---

## Use Cases

- **Automated Testing & QA** — Generate disposable email addresses for Playwright, Puppeteer, Cypress, and Selenium test suites
- **Web Scraping & Automation** — Create temp emails for sign-up verification in automation pipelines
- **Email Verification Bots** — Automatically extract OTP codes from Google, Facebook, Instagram, and more
- **Account Provisioning** — Bulk create and manage email accounts for SaaS platforms
- **Privacy & Anonymity** — Use anonymous disposable email addresses to protect user identity
- **CI/CD Pipelines** — Integrate email testing into GitHub Actions, GitLab CI, or Jenkins workflows
- **Serverless Functions** — Lightweight zero-dependency client for AWS Lambda, Vercel, Cloudflare Workers
- **CLI Tools** — Build email automation scripts and command-line utilities with Node.js
- **Backend Services** — Native TypeScript support for Express, Fastify, NestJS, and Koa backends
- **Real-time Applications** — AbortController support for WebSocket-driven or event-based architectures

---

## Related SDKs

| Language | Package | Repository |
|----------|---------|------------|
| **Node.js** | `evilmail` | [Evil-Mail/evilmail-node](https://github.com/Evil-Mail/evilmail-node) |
| **PHP** | `evilmail/evilmail-php` | [Evil-Mail/evilmail-php](https://github.com/Evil-Mail/evilmail-php) |
| **Python** | `evilmail` | [Evil-Mail/evilmail-python](https://github.com/Evil-Mail/evilmail-python) |
| **Go** | `evilmail-go` | [Evil-Mail/evilmail-go](https://github.com/Evil-Mail/evilmail-go) |

## Links

- [EvilMail Website](https://evilmail.pro) — Temporary & custom domain email platform
- [API Documentation](https://evilmail.pro/docs) — Full REST API reference
- [Chrome Extension](https://github.com/Evil-Mail/evilmail-chrome) — Disposable temp email in your browser
- [Firefox Add-on](https://github.com/Evil-Mail/evilmail-firefox) — Temp email for Firefox
- [Mobile App](https://github.com/Evil-Mail/evilmail-mobile) — Privacy-first email on Android

## License

[MIT](LICENSE)

## Support

- Issues: [github.com/Evil-Mail/evilmail-node/issues](https://github.com/Evil-Mail/evilmail-node/issues)
- Email: support@evilmail.pro
- Website: [evilmail.pro](https://evilmail.pro)
