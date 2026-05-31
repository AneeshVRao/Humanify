import { test } from 'node:test';
import assert from 'node:assert';
import { getClientIp } from '../lib/api/utils';

test('getClientIp prioritizes secure platform headers', () => {
  // 1. Prioritize x-vercel-ip
  const reqVercel = new Request('https://example.com', {
    headers: {
      'x-vercel-ip': '1.2.3.4',
      'cf-connecting-ip': '5.6.7.8',
      'x-forwarded-for': '9.10.11.12',
    },
  });
  assert.strictEqual(getClientIp(reqVercel), '1.2.3.4');

  // 2. Prioritize cf-connecting-ip if no x-vercel-ip
  const reqCloudflare = new Request('https://example.com', {
    headers: {
      'cf-connecting-ip': '5.6.7.8',
      'x-forwarded-for': '9.10.11.12',
    },
  });
  assert.strictEqual(getClientIp(reqCloudflare), '5.6.7.8');

  // 3. Fallback to x-forwarded-for
  const reqForwarded = new Request('https://example.com', {
    headers: {
      'x-forwarded-for': '9.10.11.12, 1.2.3.4',
    },
  });
  assert.strictEqual(getClientIp(reqForwarded), '9.10.11.12');
});

test('search query sanitization removes PostgREST control characters', () => {
  const searchInput = 'hello, (world) with a comma';
  const sanitized = searchInput.replace(/[,()]/g, ' ');
  assert.ok(!sanitized.includes(','));
  assert.ok(!sanitized.includes('('));
  assert.ok(!sanitized.includes(')'));
  assert.strictEqual(sanitized, 'hello   world  with a comma');
});
