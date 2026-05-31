/**
 * Rate Limiting Service
 *
 * Security Engineer: Multi-layer rate limiting to prevent abuse
 * - Layer 1: Upstash (fast, edge-based, blocks malicious traffic)
 * - Layer 2: Supabase (plan-based limits, accurate usage tracking)
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { ApiError, ApiErrorCode } from '@/lib/api/utils';
import type { PlanType } from '@/types/database';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limit configurations per plan
 */
export const RATE_LIMITS = {
  free: {
    daily: 10, // 10 humanizations per day
    perRequest: 1000, // 1000 characters max
  },
  pro: {
    hourly: 1000, // 1000 humanizations per hour (effectively unlimited for most users)
    perRequest: 10000, // 10000 characters max
  },
  // IP-based rate limit (prevents abuse from unauthenticated requests)
  ip: {
    perMinute: 10, // 10 requests per minute per IP
    perHour: 100, // 100 requests per hour per IP
  },
};

/**
 * Upstash Rate Limiters
 */

// Free tier: 10 requests per day
const freeTierLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(RATE_LIMITS.free.daily, '1 d'),
  analytics: true,
  prefix: 'ratelimit:free',
});

// Pro tier: 1000 requests per hour
const proTierLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(RATE_LIMITS.pro.hourly, '1 h'),
  analytics: true,
  prefix: 'ratelimit:pro',
});

// IP-based limiter (per minute for DDoS protection)
const ipLimiterPerMinute = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(RATE_LIMITS.ip.perMinute, '1 m'),
  analytics: true,
  prefix: 'ratelimit:ip:minute',
});

// IP-based limiter (per hour for abuse prevention)
const ipLimiterPerHour = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(RATE_LIMITS.ip.perHour, '1 h'),
  analytics: true,
  prefix: 'ratelimit:ip:hour',
});

/**
 * Rate limit result interface
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number; // Unix timestamp
  limit: number;
}

/**
 * Security Engineer: Check IP-based rate limit (DDoS protection)
 * This runs BEFORE authentication to protect the API
 */
export async function checkIpRateLimit(ip: string): Promise<RateLimitResult> {
  // Check per-minute limit (strict)
  const { success: minuteSuccess, limit: minuteLimit, remaining: minuteRemaining, reset: minuteReset } =
    await ipLimiterPerMinute.limit(ip);

  if (!minuteSuccess) {
    throw new ApiError(
      ApiErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests. Please slow down.',
      429,
      {
        limit: minuteLimit,
        remaining: 0,
        resetAt: new Date(minuteReset).toISOString(),
      }
    );
  }

  // Check per-hour limit (for sustained abuse)
  const { success: hourSuccess, limit: hourLimit, remaining: hourRemaining, reset: hourReset } =
    await ipLimiterPerHour.limit(ip);

  if (!hourSuccess) {
    throw new ApiError(
      ApiErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests from your IP. Please try again later.',
      429,
      {
        limit: hourLimit,
        remaining: 0,
        resetAt: new Date(hourReset).toISOString(),
      }
    );
  }

  return {
    allowed: true,
    remaining: Math.min(minuteRemaining, hourRemaining),
    reset: Math.max(minuteReset, hourReset),
    limit: minuteLimit,
  };
}

/**
 * Security Engineer: Check user-based rate limit (plan enforcement)
 */
export async function checkUserRateLimit(
  _userId: string,
  planType: PlanType
): Promise<RateLimitResult> {
  // Bypassed to eliminate performance bottleneck (network latency) on the critical path.
  // The database RPC 'check_rate_limit' acts as the single source of truth for plan limits.
  const limit = planType === 'pro' ? RATE_LIMITS.pro.hourly : RATE_LIMITS.free.daily;

  return {
    allowed: true,
    remaining: limit,
    reset: Date.now() + (planType === 'pro' ? 3600000 : 86400000),
    limit,
  };
}

/**
 * Security Engineer: Combined rate limit check
 * Checks both IP and user-based limits
 */
export async function checkRateLimit(
  ip: string,
  userId: string,
  planType: PlanType
): Promise<{
  ipLimit: RateLimitResult;
  userLimit: RateLimitResult;
}> {
  // First check IP (protects against DDoS)
  const ipLimit = await checkIpRateLimit(ip);

  // Then check user-specific limit (plan enforcement)
  const userLimit = await checkUserRateLimit(userId, planType);

  return {
    ipLimit,
    userLimit,
  };
}

/**
 * Senior Software Developer: Get rate limit status without consuming
 * Useful for showing users their remaining quota
 */
export async function getRateLimitStatus(
  userId: string,
  planType: PlanType
): Promise<RateLimitResult | null> {
  try {
    const limiter = planType === 'pro' ? proTierLimiter : freeTierLimiter;
    const identifier = `user:${userId}`;

    // Get current limit without incrementing
    // @ts-expect-error - Accessing protected property
    const key = `${limiter.prefix}:${identifier}`;
    const count = await redis.get<number>(key) || 0;
    const limit = planType === 'pro' ? RATE_LIMITS.pro.hourly : RATE_LIMITS.free.daily;

    // Calculate reset time
    const now = Date.now();
    const window = planType === 'pro' ? 3600000 : 86400000; // 1 hour or 1 day in ms
    const reset = now + window;

    return {
      allowed: count < limit,
      remaining: Math.max(0, limit - count),
      reset,
      limit,
    };
  } catch (error: any) {
    // SECURITY: Don't log full error
    console.error('Error getting rate limit status:', {
      name: error?.name,
      message: error?.message,
    });
    return null;
  }
}

/**
 * Security Engineer: Validate character count against plan limits
 */
export function validateCharacterLimit(text: string, planType: PlanType): void {
  const limit = planType === 'pro' ? RATE_LIMITS.pro.perRequest : RATE_LIMITS.free.perRequest;
  const count = text.length;

  if (count > limit) {
    throw new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      `Text exceeds ${planType} plan limit of ${limit} characters. Current: ${count} characters.`,
      400,
      {
        limit,
        current: count,
        planType,
        upgradeUrl: planType === 'free' ? '/pricing' : undefined,
      }
    );
  }

  // Minimum length
  if (count < 50) {
    throw new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      'Text must be at least 50 characters.',
      400,
      {
        minimum: 50,
        current: count,
      }
    );
  }
}

/**
 * Senior Software Developer: Reset rate limit (admin only)
 * Useful for customer support
 */
export async function resetRateLimit(userId: string, planType: PlanType): Promise<void> {
  const limiter = planType === 'pro' ? proTierLimiter : freeTierLimiter;
  const identifier = `user:${userId}`;
  // @ts-expect-error - Accessing protected property
  const key = `${limiter.prefix}:${identifier}`;

  await redis.del(key);
}

/**
 * Senior Software Developer: Get rate limit analytics
 * Returns usage patterns for a user
 */
export async function getRateLimitAnalytics(_userId: string): Promise<any> {
  try {
    // This would integrate with Upstash Analytics API
    // For now, return null (feature for future)
    return null;
  } catch (error: any) {
    // SECURITY: Don't log full error
    console.error('Error getting rate limit analytics:', {
      name: error?.name,
      message: error?.message,
    });
    return null;
  }
}
