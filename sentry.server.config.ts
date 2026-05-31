// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Disable sending user PII (Personally Identifiable Information) for privacy compliance
  sendDefaultPii: false,

  // Filter out sensitive data (API keys) from server logs
  beforeSend(event) {
    const errorMessage = event.exception?.values?.[0]?.value || '';
    if (errorMessage.includes('sk-ant-') || errorMessage.includes('API_KEY')) {
      return null;
    }
    return event;
  },
});
