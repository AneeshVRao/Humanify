/**
 * POST /api/stripe/portal
 *
 * Create a Stripe customer portal session
 * Allows Pro users to manage their subscription (cancel, update payment, etc.)
 *
 * Payment Integration Specialist: Self-service subscription management
 */

import { NextRequest } from 'next/server';
import {
  apiSuccess,
  withErrorHandler,
  ApiError,
  ApiErrorCode,
} from '@/lib/api/utils';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { createPortalSession } from '@/lib/stripe';

async function POST_Handler(request: NextRequest) {
  // Authenticate user
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  let supabase;
  let user;
  let authError;

  if (token) {
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

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new ApiError(
      ApiErrorCode.NOT_FOUND,
      'User profile not found',
      404
    );
  }

  // Check if user has a Stripe customer ID
  if (!profile.stripe_customer_id) {
    throw new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      'No active subscription found',
      400
    );
  }

  // Create customer portal session
  try {
    const session = await createPortalSession({
      customerId: profile.stripe_customer_id,
    });

    return apiSuccess({
      portalUrl: session.url,
    });
  } catch (error: any) {
    // SECURITY: Don't log full error (may contain Stripe keys)
    console.error('Error creating portal session:', {
      type: error?.type,
      code: error?.code,
      statusCode: error?.statusCode,
    });
    throw new ApiError(
      ApiErrorCode.INTERNAL_ERROR,
      'Failed to create portal session',
      500
    );
  }
}

export const POST = withErrorHandler(POST_Handler);
