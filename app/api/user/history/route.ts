/**
 * GET /api/user/history
 *
 * Get user's humanization history with pagination and filtering
 */

import {
  apiSuccess,
  withErrorHandler,
  ApiError,
  ApiErrorCode,
  parsePaginationParams,
  getPaginationMeta,
} from '@/lib/api/utils';
import { createServerSupabaseClient } from '@/lib/supabase/client';

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

  // Parse query parameters
  const url = new URL(request.url);
  const { page, limit } = parsePaginationParams(url);
  const tone = url.searchParams.get('tone');
  const search = url.searchParams.get('search');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  // Build query
  let query = supabase
    .from('humanizations')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Apply filters
  if (tone) {
    query = query.eq('tone', tone);
  }

  if (search) {
    // Sanitize the search query to prevent breaking PostgREST .or() parser syntax (commas/parentheses)
    const sanitizedSearch = search.replace(/[,()]/g, ' ');
    query = query.or(`original_text.ilike.%${sanitizedSearch}%,humanized_text.ilike.%${sanitizedSearch}%`);
  }

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  // Execute query
  const { data: items, error: queryError, count } = await query;

  if (queryError) {
    throw new ApiError(
      ApiErrorCode.INTERNAL_ERROR,
      'Failed to fetch history',
      500
    );
  }

  // Format response
  const formattedItems = items?.map(item => ({
    id: item.id,
    originalText: item.original_text,
    humanizedText: item.humanized_text,
    tone: item.tone,
    characterCount: item.character_count,
    aiScoreBefore: item.ai_score_before,
    aiScoreAfter: item.ai_score_after,
    processingTimeMs: item.processing_time_ms,
    aiProvider: item.ai_provider,
    createdAt: item.created_at,
  })) || [];

  return apiSuccess({
    items: formattedItems,
    pagination: getPaginationMeta(page, limit, count || 0),
  });
}

export const GET = withErrorHandler(GET_Handler);
