/**
 * PostHog Event Tracking
 * Centralized event tracking for key user actions
 */

import { trackEvent, identifyUser, setUserProperties } from './posthog';

/**
 * Track user signup event
 */
export function trackSignup(userId: string, email: string, method: 'email' | 'google') {
  identifyUser(userId, {
    email,
    signup_method: method,
    plan_type: 'free',
  });

  trackEvent('user_signed_up', {
    method,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track user login event
 */
export function trackLogin(userId: string, method: 'email' | 'google') {
  trackEvent('user_logged_in', {
    method,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track text humanization event
 */
export function trackHumanization(props: {
  userId: string;
  characterCount: number;
  tone: string;
  aiProvider: string;
  processingTimeMs: number;
  planType: string;
  aiScoreBefore?: number;
  aiScoreAfter?: number;
}) {
  trackEvent('text_humanized', {
    character_count: props.characterCount,
    tone: props.tone,
    ai_provider: props.aiProvider,
    processing_time_ms: props.processingTimeMs,
    plan_type: props.planType,
    ai_score_before: props.aiScoreBefore,
    ai_score_after: props.aiScoreAfter,
    timestamp: new Date().toISOString(),
  });

  // Track first humanization milestone
  trackEvent('first_humanization', {
    character_count: props.characterCount,
    tone: props.tone,
  });
}

/**
 * Track Pro request submission
 */
export function trackProRequestSubmission(userId: string, useCase: string) {
  trackEvent('pro_request_submitted', {
    use_case_preview: useCase.substring(0, 50), // First 50 chars only
    timestamp: new Date().toISOString(),
  });

  setUserProperties({
    pro_request_submitted: true,
    pro_request_date: new Date().toISOString(),
  });
}

/**
 * Track Pro upgrade (successful payment)
 */
export function trackProUpgrade(userId: string, paymentMethod: 'stripe' | 'razorpay') {
  trackEvent('pro_upgrade_completed', {
    payment_method: paymentMethod,
    timestamp: new Date().toISOString(),
  });

  setUserProperties({
    plan_type: 'pro',
    upgrade_date: new Date().toISOString(),
  });
}

/**
 * Track API key addition (Claude BYOK)
 */
export function trackApiKeyAdded(userId: string, provider: 'claude') {
  trackEvent('api_key_added', {
    provider,
    timestamp: new Date().toISOString(),
  });

  setUserProperties({
    has_custom_api_key: true,
    custom_api_provider: provider,
  });
}

/**
 * Track rate limit hit
 */
export function trackRateLimitHit(userId: string, planType: string, remaining: number) {
  trackEvent('rate_limit_hit', {
    plan_type: planType,
    remaining,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track character limit error
 */
export function trackCharacterLimitError(userId: string, characterCount: number, planType: string, limit: number) {
  trackEvent('character_limit_error', {
    character_count: characterCount,
    plan_type: planType,
    limit,
    overage: characterCount - limit,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track pricing page visit
 */
export function trackPricingPageVisit(userId?: string) {
  trackEvent('pricing_page_visited', {
    logged_in: !!userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track dashboard visit
 */
export function trackDashboardVisit(userId: string, planType: string) {
  trackEvent('dashboard_visited', {
    plan_type: planType,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track history view
 */
export function trackHistoryView(userId: string, historyCount: number) {
  trackEvent('history_viewed', {
    history_count: historyCount,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track settings page visit
 */
export function trackSettingsVisit(userId: string) {
  trackEvent('settings_visited', {
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track feature usage (generic)
 */
export function trackFeatureUsed(featureName: string, properties?: Record<string, any>) {
  trackEvent(`feature_used_${featureName}`, {
    ...properties,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track error occurrence
 */
export function trackError(errorType: string, errorMessage: string, context?: Record<string, any>) {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage.substring(0, 200), // Limit message length
    ...context,
    timestamp: new Date().toISOString(),
  });
}
