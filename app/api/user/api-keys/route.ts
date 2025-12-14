/**
 * GET/PATCH /api/user/api-keys
 *
 * Manage user's Claude API key
 * Pro users only
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
import { encrypt, decrypt } from '@/lib/encryption';

/**
 * GET - Get user's API key status
 */
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

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('plan_type, claude_api_key_encrypted, preferred_ai_provider')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new ApiError(
      ApiErrorCode.NOT_FOUND,
      'Profile not found',
      404
    );
  }

  // Only Pro users can access this
  if (profile.plan_type !== 'pro') {
    throw new ApiError(
      ApiErrorCode.FORBIDDEN,
      'This feature is only available for Pro users',
      403
    );
  }

  return apiSuccess({
    hasClaudeKey: !!profile.claude_api_key_encrypted,
    preferredProvider: profile.preferred_ai_provider || 'gemini',
    // Don't return the actual key for security
  });
}

/**
 * PATCH - Update API key or provider
 */
const updateSchema = z.object({
  claudeApiKey: z.string().optional(),
  preferredProvider: z.enum(['gemini', 'claude']).optional(),
});

async function PATCH_Handler(request: NextRequest) {
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

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('plan_type, claude_api_key_encrypted')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new ApiError(
      ApiErrorCode.NOT_FOUND,
      'Profile not found',
      404
    );
  }

  if (profile.plan_type !== 'pro') {
    throw new ApiError(
      ApiErrorCode.FORBIDDEN,
      'This feature is only available for Pro users',
      403
    );
  }

  const body = await validateJsonRequest(request);
  const { claudeApiKey, preferredProvider } = updateSchema.parse(body);

  const adminSupabase = createAdminSupabaseClient();
  const updateData: any = {};

  if (claudeApiKey !== undefined) {
    if (claudeApiKey === '') {
      // Remove API key
      updateData.claude_api_key_encrypted = null;
      updateData.preferred_ai_provider = 'gemini'; // Default back to Gemini
    } else {
      // Validate API key format
      if (!claudeApiKey.startsWith('sk-ant-')) {
        throw new ApiError(
          ApiErrorCode.VALIDATION_ERROR,
          'Invalid Claude API key format. It should start with "sk-ant-"',
          400
        );
      }

      // Encrypt and store
      updateData.claude_api_key_encrypted = encrypt(claudeApiKey);
    }
  }

  if (preferredProvider !== undefined) {
    // If setting to Claude, ensure they have a key
    if (preferredProvider === 'claude' && !profile.claude_api_key_encrypted && !updateData.claude_api_key_encrypted) {
      throw new ApiError(
        ApiErrorCode.VALIDATION_ERROR,
        'You must add your Claude API key before selecting Claude as provider',
        400
      );
    }
    updateData.preferred_ai_provider = preferredProvider;
  }

  const { error: updateError } = await adminSupabase
    .from('users')
    // @ts-ignore - Type generation issue
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    throw new ApiError(
      ApiErrorCode.INTERNAL_ERROR,
      'Failed to update API settings',
      500
    );
  }

  return apiSuccess({
    success: true,
    message: 'API settings updated successfully',
  });
}

export const GET = withErrorHandler(GET_Handler);
export const PATCH = withErrorHandler(PATCH_Handler);
