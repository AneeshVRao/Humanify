/**
 * GET /api/user/usage
 *
 * Get current user's usage statistics
 */

import {
  apiSuccess,
  withErrorHandler,
  ApiError,
  ApiErrorCode,
} from '@/lib/api/utils';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { RATE_LIMITS } from '@/lib/ratelimit';

async function GET_Handler(request: Request) {
  // Support both Bearer token and cookie-based auth
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  let supabase;
  let user;
  let authError;

  if (token) {
    // Create client with access token for Bearer auth
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
    const result = await supabase.auth.getUser();
    user = result.data.user;
    authError = result.error;
  } else {
    // Use cookie-based auth for browser requests
    supabase = await createServerSupabaseClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
    authError = result.error;
  }

  if (authError || !user) {
    throw new ApiError(
      ApiErrorCode.UNAUTHORIZED,
      'You must be logged in',
      401
    );
  }

  // Get user profile with usage data
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new ApiError(
      ApiErrorCode.NOT_FOUND,
      'Profile not found',
      404
    );
  }

  // Get rate limit info from database
  const { data: rateLimitData } = await supabase.rpc('check_rate_limit', {
    user_uuid: user.id,
  });

  const rateLimit = rateLimitData?.[0];

  // Determine limits based on plan
  const dailyLimit = profile.plan_type === 'pro'
    ? null // Unlimited
    : RATE_LIMITS.free.daily;

  const characterLimit = profile.plan_type === 'pro'
    ? RATE_LIMITS.pro.perRequest
    : RATE_LIMITS.free.perRequest;

  return apiSuccess({
    planType: profile.plan_type,
    subscriptionStatus: profile.subscription_status,

    // Daily usage
    dailyLimit,
    dailyUsageCount: profile.daily_usage_count,
    dailyRemaining: rateLimit?.remaining ?? dailyLimit,
    dailyUsageResetAt: rateLimit?.reset_at ?? profile.daily_usage_reset_at,

    // Character limits
    characterLimit,

    // Lifetime stats
    totalHumanizations: profile.total_humanizations,
    totalCharactersProcessed: profile.total_characters_processed,

    // Upgrade info (if free plan)
    ...(profile.plan_type === 'free' && {
      upgradeUrl: '/pricing',
      upgradeBenefits: [
        'Unlimited humanizations',
        `Up to ${RATE_LIMITS.pro.perRequest.toLocaleString()} characters per request`,
        'Premium AI quality (Claude)',
        'Priority processing',
        'AI detection scores',
        'Export history',
      ],
    }),
  });
}

export const GET = withErrorHandler(GET_Handler); 

