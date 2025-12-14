/**
 * POST /api/humanize
 *
 * Main text humanization endpoint
 *
 * Security Engineer: Multi-layer security and validation
 * - Authentication required
 * - Rate limiting (IP + user-based)
 * - Input validation and sanitization
 * - Error handling
 * - Usage tracking
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import {
  apiSuccess,
  apiError,
  withErrorHandler,
  ApiError,
  ApiErrorCode,
  getClientIp,
  getUserAgent,
  validateJsonRequest,
  addRateLimitHeaders,
} from "@/lib/api/utils";
import {
  createServerSupabaseClient,
  createAdminSupabaseClient,
} from "@/lib/supabase/client";
import { checkRateLimit, validateCharacterLimit } from "@/lib/ratelimit";
import { humanizeText } from "@/lib/ai/humanizer";
import type { Tone } from "@/types/database";

// Request validation schema
const humanizeSchema = z.object({
  text: z
    .string()
    .min(50, "Text must be at least 50 characters")
    .max(15000, "Text cannot exceed 15,000 characters"),
  tone: z.enum(["casual", "professional", "academic", "neutral"] as const),
});

/**
 * Security Engineer: POST handler with comprehensive security
 */
async function POST_Handler(request: NextRequest) {
  // Step 1: Get client info for rate limiting and logging
  const clientIp = getClientIp(request);
  const userAgent = getUserAgent(request);

  // Step 2: Authenticate user
  // Extract token from Authorization header if present (for API testing)
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  let supabase;
  let user;
  let authError;

  if (token) {
    // Create client with access token for Bearer auth
    const { createClient } = await import("@supabase/supabase-js");
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
      "You must be logged in to use this feature",
      401
    );
  }

  // Step 3: Get user profile with plan info
  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !userProfile) {
    throw new ApiError(
      ApiErrorCode.INTERNAL_ERROR,
      "Failed to fetch user profile",
      500
    );
  }

  // Step 4: Validate request body
  const body = await validateJsonRequest(request);
  const validatedData = humanizeSchema.parse(body);
  const { text, tone } = validatedData;

  // Step 5: Check character limit based on plan
  validateCharacterLimit(text, userProfile.plan_type);

  // Step 6: Check rate limits (IP + user)
  const { userLimit } = await checkRateLimit(
    clientIp,
    user.id,
    userProfile.plan_type
  );

  // Step 7: Check database rate limit (backup/accurate tracking)
  const { data: dbRateLimit } = await supabase.rpc("check_rate_limit", {
    user_uuid: user.id,
  });

  if (dbRateLimit && dbRateLimit.length > 0 && !dbRateLimit[0].allowed) {
    const resetDate = new Date(dbRateLimit[0].reset_at);

    throw new ApiError(
      ApiErrorCode.RATE_LIMIT_EXCEEDED,
      `Daily limit reached. Resets at ${resetDate.toLocaleString()}.`,
      429,
      {
        remaining: 0,
        resetAt: resetDate.toISOString(),
        upgradeUrl: userProfile.plan_type === "free" ? "/pricing" : undefined,
      }
    );
  }

  // Step 8: Humanize the text using AI
  const humanizationResult = await humanizeText({
    text,
    tone: tone as Tone,
    planType: userProfile.plan_type,
    preferredProvider: userProfile.preferred_ai_provider || "gemini",
    claudeApiKeyEncrypted: userProfile.claude_api_key_encrypted,
  });

  // Step 9: Save to database (history)
  const adminSupabase = createAdminSupabaseClient();

  const humanizationRecord = {
    user_id: user.id,
    original_text: text,
    humanized_text: humanizationResult.humanizedText,
    tone,
    character_count: text.length,
    processing_time_ms: humanizationResult.processingTimeMs,
    ai_provider: humanizationResult.aiProvider as "claude" | "gemini",
    ai_score_before: humanizationResult.aiScoreBefore,
    ai_score_after: humanizationResult.aiScoreAfter,
  };

  const { data: savedHumanization, error: saveError } = await (adminSupabase
    .from("humanizations") as any)
    .insert(humanizationRecord)
    .select()
    .single();

  if (saveError) {
    console.error("Failed to save humanization:", saveError);
    // Don't fail the request, just log the error
  }

  // Step 10: Increment usage counter
  const { error: usageError } = await (adminSupabase as any).rpc("increment_usage", {
    user_uuid: user.id,
    chars: text.length,
  });

  if (usageError) {
    console.error("Failed to increment usage:", usageError);
  }

  // Step 11: Log usage for analytics
  await (adminSupabase.from("usage_logs") as any).insert({
    user_id: user.id,
    action: "humanize",
    metadata: {
      tone,
      characterCount: text.length,
      processingTimeMs: humanizationResult.processingTimeMs,
      aiProvider: humanizationResult.aiProvider,
    },
    ip_address: clientIp,
    user_agent: userAgent,
  });

  // Step 12: Prepare response with rate limit info
  const remaining = dbRateLimit?.[0]?.remaining ?? userLimit.remaining;
  const resetAt = dbRateLimit?.[0]?.reset_at
    ? new Date(dbRateLimit[0].reset_at)
    : new Date(userLimit.reset);

  const response = apiSuccess(
    {
      originalText: text,
      humanizedText: humanizationResult.humanizedText,
      tone,
      characterCount: text.length,
      processingTimeMs: humanizationResult.processingTimeMs,
      aiProvider: humanizationResult.aiProvider,
      aiScoreBefore: humanizationResult.aiScoreBefore,
      aiScoreAfter: humanizationResult.aiScoreAfter,
      remainingUses: userProfile.plan_type === "free" ? remaining : undefined,
      resetAt:
        userProfile.plan_type === "free" ? resetAt.toISOString() : undefined,
    },
    200
  );

  // Add rate limit headers
  return addRateLimitHeaders(response, userLimit.limit, remaining, resetAt);
}

// Export with error handler wrapper
export const POST = withErrorHandler(POST_Handler);

// Export type for client-side usage
export type HumanizeResponse = {
  originalText: string;
  humanizedText: string;
  tone: string;
  characterCount: number;
  processingTimeMs: number;
  aiProvider: string;
  aiScoreBefore?: number;
  aiScoreAfter?: number;
  remainingUses?: number;
  resetAt?: string;
};
