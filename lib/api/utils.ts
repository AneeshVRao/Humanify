/**
 * API Utilities
 *
 * Security Engineer: Secure API helpers with proper error handling
 * Senior Software Developer: Clean, reusable API utilities
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Standard API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

// Error codes
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
}

// Custom API Error class
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Success response helper
 */
export function apiSuccess<T>(
  data: T,
  statusCode: number = 200,
  requestId?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: requestId || generateRequestId(),
      },
    },
    { status: statusCode }
  );
}

/**
 * Error response helper
 */
export function apiError(
  error: ApiError | Error | ZodError,
  requestId?: string
): NextResponse<ApiResponse> {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'Invalid request data',
          details: error.errors,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: requestId || generateRequestId(),
        },
      },
      { status: 400 }
    );
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: requestId || generateRequestId(),
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle unknown errors
  // SECURITY: Only log safe error properties
  console.error('Unexpected API error:', {
    name: error instanceof Error ? error.name : 'Unknown',
    message: error instanceof Error ? error.message : String(error),
    // DO NOT log full error object (may contain sensitive data)
  });

  return NextResponse.json(
    {
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: process.env.NODE_ENV === 'development'
          ? error.message
          : 'An unexpected error occurred',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: requestId || generateRequestId(),
      },
    },
    { status: 500 }
  );
}

/**
 * Security Engineer: Get client IP address (for rate limiting and logging)
 * Handles various proxy headers
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  // Try various headers (in order of reliability)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback (shouldn't happen with proxies)
  return 'unknown';
}

/**
 * Security Engineer: Get user agent
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Security Engineer: Sanitize error message for client
 * Prevents leaking sensitive information
 */
export function sanitizeErrorMessage(error: any): string {
  // Don't expose database errors, internal errors, etc.
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /secret/i,
    /key/i,
    /database/i,
    /sql/i,
    /query/i,
  ];

  const message = error.message || 'An error occurred';

  for (const pattern of sensitivePatterns) {
    if (pattern.test(message)) {
      return 'An error occurred. Please try again later.';
    }
  }

  return message;
}

/**
 * Senior Software Developer: Async error wrapper for API routes
 * Catches errors and returns proper API response
 */
export function withErrorHandler(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    const requestId = generateRequestId();

    try {
      return await handler(request, context);
    } catch (error) {
      // SECURITY: Only log safe error properties
      console.error(`[${requestId}] API Error:`, {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        // DO NOT log full error object
      });
      return apiError(error as Error, requestId);
    }
  };
}

/**
 * Senior Software Developer: Rate limit headers helper
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetAt: Date
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.floor(resetAt.getTime() / 1000).toString());

  return response;
}

/**
 * Security Engineer: Validate content type is JSON
 */
export async function validateJsonRequest(request: Request): Promise<any> {
  const contentType = request.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    throw new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      'Content-Type must be application/json',
      400
    );
  }

  try {
    return await request.json();
  } catch (error) {
    throw new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      'Invalid JSON in request body',
      400
    );
  }
}

/**
 * Security Engineer: CORS helper
 */
export function getCorsHeaders(origin?: string): HeadersInit {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean);

  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Senior Software Developer: Parse pagination params
 */
export function parsePaginationParams(url: URL): {
  page: number;
  limit: number;
} {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));

  return { page, limit };
}

/**
 * Senior Software Developer: Calculate pagination meta
 */
export function getPaginationMeta(
  page: number,
  limit: number,
  total: number
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
} {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}
