/**
 * PostHog Analytics Configuration
 * Privacy-friendly product analytics
 */

import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window === 'undefined') return;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  // Check if API key is missing or is a placeholder
  const isPlaceholder = !apiKey ||
    apiKey.includes('your-') ||
    apiKey.includes('your_posthog');

  if (isPlaceholder) {
    console.log('PostHog not initialized: Please add your actual PostHog API key to .env.local');
    return;
  }

  posthog.init(apiKey, {
    api_host: apiHost,

    // Privacy settings
    person_profiles: 'identified_only', // Only create profiles for logged-in users

    // Capture settings
    capture_pageview: true,
    capture_pageleave: true,

    // Session recording (optional, can be disabled)
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true, // Mask sensitive form inputs
      maskTextSelector: '.sensitive', // Mask elements with .sensitive class
    },

    // Autocapture (automatic event tracking)
    autocapture: {
      dom_event_allowlist: ['click', 'submit'], // Only track clicks and form submits
      url_allowlist: [window.location.origin], // Only track on our domain
    },

    // Performance
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug(false); // Disable debug in development
      }
    },
  });

  return posthog;
}

// Track events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  posthog.capture(eventName, properties);
}

// Identify user (call after login)
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  posthog.identify(userId, traits);
}

// Reset user (call after logout)
export function resetUser() {
  if (typeof window === 'undefined') return;

  posthog.reset();
}

// Set user properties
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window === 'undefined') return;

  posthog.setPersonProperties(properties);
}

// Track page views manually (if needed)
export function trackPageView(url?: string) {
  if (typeof window === 'undefined') return;

  posthog.capture('$pageview', {
    $current_url: url || window.location.href,
  });
}

export { posthog };
