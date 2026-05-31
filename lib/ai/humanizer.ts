/**
 * AI Humanization Service
 *
 * AI Integration Specialist: Multi-provider architecture
 * - Free users: Google Gemini 2.0 Flash (public, Google trains on data)
 * - Pro users: Google Gemini 2.0 Flash (private, zero training)
 * - Pro users with Claude: User's own Claude API key (premium quality)
 */

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError, ApiErrorCode } from "@/lib/api/utils";
import type { Tone, PlanType, AIProvider } from "@/types/database";
import { decrypt } from "@/lib/encryption";

/**
 * Humanization result interface
 */
export interface HumanizationResult {
  humanizedText: string;
  processingTimeMs: number;
  aiProvider: AIProvider;
  aiScoreBefore?: number;
  aiScoreAfter?: number;
}

/**
 * Humanization options
 */
export interface HumanizationOptions {
  text: string;
  tone: Tone;
  planType: PlanType;
  preferredProvider?: "gemini" | "claude";
  claudeApiKeyEncrypted?: string | null;
}

/**
 * Get system prompt based on tone
 */
function getSystemPrompt(tone: Tone): string {
  const basePrompt = `You are an expert at rewriting AI-generated text to sound natural and human-written.

Core principles:
- Maintain the original meaning and key information
- Use varied sentence structures and lengths
- Include natural transitions and flow
- Add subtle personality appropriate to the tone
- Avoid repetitive vocabulary
- Use active voice when possible
- Remove overly formal or robotic phrasing
- Add natural human touches (contractions when appropriate, rhetorical questions, etc.)
- Keep the same general length as the original`;

  const tonePrompts: Record<Tone, string> = {
    casual: `
Tone: Friendly and conversational
- Use contractions (it's, we're, you'll)
- Include casual phrases and informal language
- Warm, approachable style
- Conversational flow
- Personal touches`,

    professional: `
Tone: Polished and business-appropriate
- Clear, concise, and authoritative
- Professional vocabulary
- Confident without being arrogant
- Formal but not stuffy
- Suitable for business communication`,

    academic: `
Tone: Scholarly and formal
- Formal language and precise terminology
- Objective perspective
- Well-structured arguments
- Academic vocabulary
- Citation-ready style`,

    neutral: `
Tone: Balanced and straightforward
- Clear and informative
- Neither too casual nor too formal
- Professional but approachable
- Objective presentation
- Widely accessible language`,

    creative: `
Tone: Imaginative and expressive
- Vivid, descriptive language
- Engaging storytelling elements
- Metaphors and creative expressions
- Dynamic and colorful vocabulary
- Captivating and original style`,
  };

  return `${basePrompt}\n\n${tonePrompts[tone]}`;
}

/**
 * Sanitize input text
 */
function sanitizeInput(text: string): string {
  let sanitized = text.replace(/\0/g, "");
  sanitized = sanitized.trim().replace(/\s+/g, " ");

  if (sanitized.length < 50) {
    throw new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      "Text is too short after sanitization",
      400
    );
  }

  return sanitized;
}

/**
 * Humanize with Claude (Pro users with their own API key)
 */
async function humanizeWithClaude(
  text: string,
  tone: Tone,
  apiKey: string
): Promise<HumanizationResult> {
  const startTime = Date.now();

  try {
    const anthropic = new Anthropic({ apiKey });
    const systemPrompt = getSystemPrompt(tone);
    const sanitizedText = sanitizeInput(text);

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Rewrite this text to sound natural and human-written:\n\n${sanitizedText}`,
        },
      ],
    });

    const humanizedText =
      message.content[0].type === "text" ? message.content[0].text : "";

    if (!humanizedText) {
      throw new Error("Claude returned empty response");
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      humanizedText: humanizedText.trim(),
      processingTimeMs,
      aiProvider: "claude",
    };
  } catch (error: any) {
    // SECURITY: Never log full error object (may contain API keys)
    console.error("Claude API error:", {
      status: error.status,
      type: error.type,
      code: error.code,
      // DO NOT log: error.message, error, request/response bodies
    });

    if (error.status === 401 || error.status === 403) {
      throw new ApiError(
        ApiErrorCode.AI_SERVICE_ERROR,
        "Invalid Claude API key. Please check your API key in Settings.",
        400
      );
    }

    if (error.status === 429) {
      throw new ApiError(
        ApiErrorCode.RATE_LIMIT_EXCEEDED,
        "Your Claude API rate limit reached. Please try again in a moment.",
        429
      );
    }

    throw new ApiError(
      ApiErrorCode.AI_SERVICE_ERROR,
      "Claude AI service error. Please try again or switch to Gemini.",
      503,
      { originalError: error.message }
    );
  }
}

/**
 * Humanize with Gemini
 */
async function humanizeWithGemini(
  text: string,
  tone: Tone,
  isPrivate: boolean = false
): Promise<HumanizationResult> {
  const startTime = Date.now();

  try {
    // Use private key for Pro users, public key for free users
    // Fallback to GEMINI_API_KEY if PRIVATE not set
    const apiKey = isPrivate
      ? (process.env.GEMINI_API_KEY_PRIVATE || process.env.GEMINI_API_KEY)
      : process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const keyType = isPrivate ? "GEMINI_API_KEY_PRIVATE" : "GEMINI_API_KEY";
      throw new ApiError(
        ApiErrorCode.INTERNAL_ERROR,
        "AI service is not configured. Please contact support.",
        500,
        { configError: `Missing ${keyType}` }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const systemPrompt = getSystemPrompt(tone);
    const sanitizedText = sanitizeInput(text);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(
      `Rewrite this text to sound natural and human-written:\n\n${sanitizedText}`
    );

    const humanizedText = result.response.text();

    if (!humanizedText) {
      throw new Error("Gemini returned empty response");
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      humanizedText: humanizedText.trim(),
      processingTimeMs,
      aiProvider: "gemini",
    };
  } catch (error: any) {
    // SECURITY: Never log full error object (may contain API keys)
    console.error("Gemini API error:", {
      status: error.status,
      code: error.code,
      name: error.name,
      // DO NOT log: error.message, error, request/response bodies
    });

    if (error.message?.includes("quota")) {
      throw new ApiError(
        ApiErrorCode.RATE_LIMIT_EXCEEDED,
        "AI service quota exceeded. Please try again later.",
        429
      );
    }

    throw new ApiError(
      ApiErrorCode.AI_SERVICE_ERROR,
      "Gemini AI service is temporarily unavailable.",
      503,
      { originalError: error.message }
    );
  }
}

/**
 * Main humanization function with intelligent routing
 */
export async function humanizeText(
  options: HumanizationOptions
): Promise<HumanizationResult> {
  const { text, tone, planType, preferredProvider, claudeApiKeyEncrypted } =
    options;

  // Sanitize input
  const sanitizedText = sanitizeInput(text);

  // FREE USERS: Public Gemini only
  if (planType === "free") {
    return await humanizeWithGemini(sanitizedText, tone, false);
  }

  // PRO USERS: Check their preference
  if (preferredProvider === "claude" && claudeApiKeyEncrypted) {
    try {
      // Decrypt their Claude API key
      const claudeApiKey = decrypt(claudeApiKeyEncrypted);

      // Use their Claude API
      return await humanizeWithClaude(sanitizedText, tone, claudeApiKey);
    } catch (claudeError: any) {
      // SECURITY: Only log safe error properties
      console.error("Claude failed for pro user:", {
        status: claudeError.status,
        type: claudeError.type,
        // DO NOT log full error
      });

      // If Claude fails, fall back to private Gemini
      console.log("Falling back to private Gemini");
      return await humanizeWithGemini(sanitizedText, tone, true);
    }
  }

  // PRO USERS DEFAULT: Private Gemini
  return await humanizeWithGemini(sanitizedText, tone, true);
}

/**
 * Estimate AI cost per request
 */
export function estimateCost(
  text: string,
  _planType: PlanType,
  provider: "gemini" | "claude" = "gemini"
): {
  estimatedCostUsd: number;
  provider: AIProvider;
  inputTokens: number;
  outputTokens: number;
} {
  const inputTokens = Math.ceil(text.length / 4);
  const outputTokens = Math.ceil(inputTokens * 1.2);

  if (provider === "gemini") {
    // Gemini 2.0 Flash: $0.075 per 1M input, $0.30 per 1M output
    // Same cost for public and private keys
    const cost = (inputTokens * 0.075 + outputTokens * 0.3) / 1000000;

    return {
      estimatedCostUsd: cost,
      provider: "gemini",
      inputTokens,
      outputTokens,
    };
  } else {
    // Claude 3.5 Sonnet: $3 per 1M input, $15 per 1M output
    const cost = (inputTokens * 3 + outputTokens * 15) / 1000000;

    return {
      estimatedCostUsd: cost,
      provider: "claude",
      inputTokens,
      outputTokens,
    };
  }
}
