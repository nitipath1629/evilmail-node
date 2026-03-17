/**
 * Basic usage example for the EvilMail Node.js SDK.
 *
 * Usage:
 *   export EVILMAIL_API_KEY="your-api-key"
 *   npx tsx examples/basic.ts
 */

import { EvilMail, NotFoundError, isRateLimitError } from '../src/index.js';

const apiKey = process.env.EVILMAIL_API_KEY;
if (!apiKey) {
  console.error('Set EVILMAIL_API_KEY environment variable');
  process.exit(1);
}

const client = new EvilMail(apiKey, { timeout: 15_000 });

async function main() {
  // --- Public domains (no auth needed) ---
  console.log('=== Public Domains ===');
  const publicDomains = await client.domains.listPublic();
  console.log('Free:', publicDomains.free);
  console.log('TTL options:', publicDomains.ttlOptions);
  console.log();

  // --- Customer domains ---
  console.log('=== Customer Domains ===');
  const domains = await client.domains.list();
  console.log('Free:', domains.free);
  console.log('Premium:', domains.premium);
  console.log('Custom:', domains.customer);
  console.log('Package:', domains.packageType);
  console.log();

  // --- Temporary email ---
  console.log('=== Creating Temporary Email ===');
  const temp = await client.tempEmail.create({ ttlMinutes: 30 });
  console.log('Email:', temp.email);
  console.log('Token:', temp.sessionToken);
  console.log('Expires:', temp.expiresAt);
  console.log();

  // Check session status
  const session = await client.tempEmail.getSession(temp.sessionToken);
  console.log('Session active:', session.email, '(domain:', session.domain + ')');
  console.log();

  // --- Random email preview ---
  console.log('=== Random Email Preview ===');
  const preview = await client.randomEmail.preview();
  console.log('Username:', preview.username);
  console.log('Email:', preview.email);
  console.log('Password:', preview.password);
  console.log();

  // --- List accounts ---
  console.log('=== Accounts ===');
  const accounts = await client.accounts.list();
  for (const acct of accounts) {
    console.log(` ${acct.email} (${acct.domain}) — created ${acct.createdAt}`);
  }
  if (accounts.length === 0) console.log('  (no accounts)');
  console.log();

  // --- Read inbox (if accounts exist) ---
  if (accounts.length > 0) {
    const email = accounts[0].email;
    console.log(`=== Inbox: ${email} ===`);
    const messages = await client.inbox.list(email);
    for (const msg of messages) {
      console.log(`  [${msg.uid}] ${msg.from}: ${msg.subject}`);
    }
    if (messages.length === 0) console.log('  (empty inbox)');
    console.log();

    // Read the first message
    if (messages.length > 0) {
      console.log(`=== Reading Message ${messages[0].uid} ===`);
      const full = await client.inbox.getMessage(messages[0].uid, email);
      console.log('From:', full.from);
      console.log('Subject:', full.subject);
      console.log('Date:', full.date);
      console.log('Text:', full.text?.slice(0, 200));
      console.log();
    }

    // Try verification code extraction
    console.log(`=== Verification Code (Google) for ${email} ===`);
    try {
      const code = await client.verification.getCode('google', email);
      console.log('Code:', code.code, '(from:', code.from + ')');
    } catch (err) {
      if (err instanceof NotFoundError) {
        console.log('  No Google verification email found');
      } else if (isRateLimitError(err)) {
        console.log('  Rate limited — try again later');
      } else {
        throw err;
      }
    }
    console.log();
  }

  // --- Cleanup ---
  console.log('=== Deleting Temporary Email ===');
  await client.tempEmail.delete(temp.sessionToken);
  console.log('Deleted successfully');
}

main().catch(console.error);
