/**
 * GET/PATCH /api/user/profile
 *
 * User profile management
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  apiSuccess,
  withErrorHandler,
  ApiError,
  ApiErrorCode,
  validateJsonRequest,
} from '@/lib/api/utils';
import { createServerSupabaseClient } from '@/lib/supabase/client';

/**
 * GET /api/user/profile
 * Get current user's profile
 */
async function GET_Handler(request: NextRequest) {
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

  return apiSuccess({
    id: profile.id,
    email: profile.email,
    name: profile.name,
    planType: profile.plan_type,
    subscriptionStatus: profile.subscription_status,
    createdAt: profile.created_at,
    lastLoginAt: profile.last_login_at,
  });
}

/**
 * PATCH /api/user/profile
 * Update user profile (name only for now)
 */
const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

async function PATCH_Handler(request: NextRequest) {
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

  const body = await validateJsonRequest(request);
  const validatedData = updateSchema.parse(body);

  const { error: updateError } = await supabase
    .from('users')
    // @ts-ignore - Type generation issue
    .update({ name: validatedData.name })
    .eq('id', user.id);

  if (updateError) {
    throw new ApiError(
      ApiErrorCode.INTERNAL_ERROR,
      'Failed to update profile',
      500
    );
  }

  return apiSuccess({
    message: 'Profile updated successfully',
  });
}

export const GET = withErrorHandler(GET_Handler);
export const PATCH = withErrorHandler(PATCH_Handler);
