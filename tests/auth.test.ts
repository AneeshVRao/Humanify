import dotenv from 'dotenv';
// Load environment variables immediately before importing any other modules
dotenv.config({ path: '.env.local' });

// Set ADMIN_EMAILS at the very top so it is read when the admin module initializes
process.env.ADMIN_EMAILS = 'admin-test@example.com';

import { test } from 'node:test';
import assert from 'node:assert';
import type { User } from '@supabase/supabase-js';

// Mock user objects
const mockRegularUser: User = {
  id: 'regular-user-uuid',
  email: 'user@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

// Mock global.fetch to intercept Supabase calls and return appropriate user profiles depending on the queried ID
const originalFetch = global.fetch;
global.fetch = async (input, init) => {
  if (typeof input === 'string' && input.includes('/rest/v1/users')) {
    const isMockAdmin = input.includes('eq.admin-user-uuid');
    return new Response(JSON.stringify({
      is_admin: false, // Force it to fall back to the email whitelist check
      email: isMockAdmin ? 'admin-test@example.com' : 'user@example.com'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return originalFetch(input, init);
};

test('checkCurrentUserIsAdmin returns false for regular user', async () => {
  const { checkCurrentUserIsAdmin } = await import('../lib/auth/admin');
  const result = await checkCurrentUserIsAdmin(mockRegularUser);
  assert.strictEqual(result.isAdmin, false);
  assert.strictEqual(result.user?.id, mockRegularUser.id);
});

test('requireAdmin throws error for regular user', async () => {
  const { requireAdmin } = await import('../lib/auth/admin');
  await assert.rejects(
    async () => {
      await requireAdmin(mockRegularUser);
    },
    (err: Error) => {
      return err.message.includes('Unauthorized: Admin access required');
    }
  );
});

test('checkCurrentUserIsAdmin returns true for whitelisted admin email', async () => {
  const mockAdminUser: User = {
    id: 'admin-user-uuid',
    email: 'admin-test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    phone: '',
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  };

  const { checkCurrentUserIsAdmin } = await import('../lib/auth/admin');
  const result = await checkCurrentUserIsAdmin(mockAdminUser);
  // Should evaluate to true due to the ADMIN_EMAILS whitelist fallback logic
  assert.strictEqual(result.isAdmin, true);
  assert.strictEqual(result.user?.id, mockAdminUser.id);
});
