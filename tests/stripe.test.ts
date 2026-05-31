import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config({ path: '.env.local' });

// Ensure a dummy STRIPE_SECRET_KEY is defined if missing
if (!process.env.STRIPE_SECRET_KEY) {
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
}

import { test } from 'node:test';
import assert from 'node:assert';

test('Stripe config uses corrected apiVersion format', async () => {
  const { stripe } = await import('../lib/stripe');
  // Check that the apiVersion does not contain the clover suffix
  // @ts-ignore - Stripe API configuration field check
  const apiVersion = stripe._api.version;
  assert.strictEqual(apiVersion, '2025-11-17');
});

test('mapSubscriptionStatus returns correctly mapped database status values', async () => {
  const { mapSubscriptionStatus } = await import('../lib/stripe');
  assert.strictEqual(mapSubscriptionStatus('active'), 'active');
  assert.strictEqual(mapSubscriptionStatus('canceled'), 'cancelled');
  assert.strictEqual(mapSubscriptionStatus('past_due'), 'past_due');
  assert.strictEqual(mapSubscriptionStatus('unpaid'), 'expired');
  assert.strictEqual(mapSubscriptionStatus('trialing'), 'active');
});
