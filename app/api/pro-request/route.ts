/**
 * POST /api/pro-request
 *
 * Submit a request for Pro plan access
 * GET /api/pro-request - Check user's request status
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
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/client';
import { sendProRequestReceivedEmail } from '@/lib/email/send';

const requestSchema = z.object({
  message: z.string().min(10, 'Please tell us why you need Pro (at least 10 characters)').max(500),
  useCase: z.string().optional(),
});

async function POST_Handler(request: NextRequest) {
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
  const { data: profile } = await supabase
    .from('users')
    .select('email, name, plan_type')
    .eq('id', user.id)
    .single();

  if (!profile) {
    throw new ApiError(ApiErrorCode.NOT_FOUND, 'Profile not found', 404);
  }

  // Check if already Pro
  if (profile.plan_type === 'pro') {
    throw new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      'You already have Pro access',
      400
    );
  }

  // Check for existing pending request
  const { data: existing } = await supabase
    .from('pro_requests')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (existing) {
    throw new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      'You already have a pending request. We will contact you soon!',
      400
    );
  }

  // Validate request body
  const body = await validateJsonRequest(request);
  const { message, useCase } = requestSchema.parse(body);

  // Create request
  const adminSupabase = createAdminSupabaseClient();
  const { data: proRequest, error: insertError } = await adminSupabase
    .from('pro_requests')
    // @ts-ignore - Type generation issue
    .insert({
      user_id: user.id,
      email: profile.email,
      name: profile.name,
      message,
      use_case: useCase,
      status: 'pending',
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating pro request:', insertError);
    throw new ApiError(
      ApiErrorCode.INTERNAL_ERROR,
      'Failed to submit request',
      500
    );
  }

  // Send confirmation email
  await sendProRequestReceivedEmail(profile.email, profile.name);

  return apiSuccess({
    success: true,
    message: 'Your Pro access request has been submitted! We will contact you soon.',
    // @ts-ignore - proRequest will exist if no insertError
    requestId: proRequest.id,
  });
}

async function GET_Handler(request: NextRequest) {
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

  // Get user's latest request
  const { data: proRequest } = await supabase
    .from('pro_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return apiSuccess({
    hasRequest: !!proRequest,
    request: proRequest || null,
  });
}

export const POST = withErrorHandler(POST_Handler);
export const GET = withErrorHandler(GET_Handler);
