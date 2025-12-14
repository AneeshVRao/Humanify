# PostHog Analytics Setup Guide

PostHog is a privacy-friendly product analytics platform that helps you understand how users interact with Humanify.

## Why PostHog?

- **Privacy-First**: GDPR compliant, can be self-hosted
- **Session Replay**: See exactly how users interact with your app
- **Feature Flags**: A/B test features (future use)
- **Funnels & Retention**: Track conversion and user retention
- **No Cookie Banner Required**: With proper configuration

---

## Step 1: Create PostHog Account

### Option A: PostHog Cloud (Recommended for MVP)

1. Go to [https://posthog.com](https://posthog.com)
2. Click "Get Started Free"
3. Sign up with your email or Google account
4. Choose a project name: `Humanify Production`
5. Select your region:
   - **US Cloud**: `https://app.posthog.com` (faster for US/global users)
   - **EU Cloud**: `https://eu.posthog.com` (GDPR compliance, European users)

### Option B: Self-Hosted (Advanced)

- Better privacy, full control
- Requires Docker and server setup
- See: [PostHog Self-Hosted Docs](https://posthog.com/docs/self-host)

---

## Step 2: Get Your API Credentials

1. Log in to PostHog dashboard
2. Go to **Settings** (gear icon in top right)
3. Navigate to **Project** → **Project Settings**
4. Copy the following:
   - **Project API Key**: Starts with `phc_...`
   - **Host URL**:
     - US Cloud: `https://app.posthog.com`
     - EU Cloud: `https://eu.posthog.com`
     - Self-hosted: Your custom URL

---

## Step 3: Configure Environment Variables

Add these to your `.env.local`:

```bash
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_your_actual_project_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Important**:
- Replace `phc_your_actual_project_api_key_here` with your real API key
- Use the correct host URL for your region
- The analytics will automatically activate once you set a real API key

---

## Step 4: Verify Installation

### Test in Development

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open browser DevTools (F12) → Network tab

3. Navigate to your app: `http://localhost:3000`

4. Look for POST requests to:
   - US Cloud: `https://app.posthog.com/e/`
   - EU Cloud: `https://eu.posthog.com/e/`

5. Check PostHog dashboard → Activity → Live Events
   - You should see page views appearing in real-time

### Test Event Tracking

1. Sign up for a new account
2. Perform a humanization
3. Submit a Pro request
4. Check PostHog dashboard → Activity
5. You should see events:
   - `user_signed_up`
   - `text_humanized`
   - `pro_request_submitted`

---

## Step 5: Configure Privacy Settings

PostHog is already configured with privacy-first settings in `lib/analytics/posthog.ts`:

```typescript
person_profiles: 'identified_only' // Only track logged-in users
session_recording: {
  maskAllInputs: true,        // Hide sensitive form inputs
  maskTextSelector: '.sensitive' // Hide elements with .sensitive class
}
autocapture: {
  dom_event_allowlist: ['click', 'submit'] // Only clicks and forms
}
```

### Additional Privacy Options

If you want even more privacy, edit `lib/analytics/posthog.ts`:

**Disable Session Recording:**
```typescript
disable_session_recording: true,
```

**Disable Autocapture:**
```typescript
autocapture: false,
```

**IP Anonymization (Self-Hosted Only):**
```typescript
ip: false,
```

---

## Step 6: Key Events Tracked

Humanify automatically tracks these events:

### User Events
- `user_signed_up` - New user registration
- `user_logged_in` - User login
- `$pageview` - Page navigation (automatic)

### Core Features
- `text_humanized` - Successful humanization
  - Properties: character_count, tone, ai_provider, processing_time_ms
- `first_humanization` - User's first humanization milestone
- `rate_limit_hit` - User hits daily limit
- `character_limit_error` - User exceeds character limit

### Pro Plan
- `pro_request_submitted` - User requests Pro access
- `pro_upgrade_completed` - User successfully upgrades to Pro
- `api_key_added` - User adds Claude API key (BYOK)

### Navigation
- `dashboard_visited` - Dashboard page view
- `pricing_page_visited` - Pricing page view
- `settings_visited` - Settings page view
- `history_viewed` - History page view

### Errors
- `error_occurred` - Generic error tracking
  - Properties: error_type, error_message, context

---

## Step 7: Add Custom Tracking (Optional)

If you want to track additional events:

### Client-Side (React Components)

```typescript
import { trackEvent } from '@/lib/analytics/posthog';

function MyComponent() {
  const handleCustomAction = () => {
    trackEvent('custom_action', {
      button: 'cta_button',
      location: 'homepage',
    });
  };

  return <button onClick={handleCustomAction}>Click Me</button>;
}
```

### Server-Side (API Routes)

Use the event tracking utility:

```typescript
import { trackHumanization } from '@/lib/analytics/events';

// In your API route
trackHumanization({
  userId: user.id,
  characterCount: text.length,
  tone: 'professional',
  aiProvider: 'gemini',
  processingTimeMs: 1234,
  planType: 'free',
});
```

---

## Step 8: Set Up Dashboards (Production)

### Create Key Dashboards

1. **User Growth Dashboard**
   - New signups per day/week/month
   - Active users (DAU/WAU/MAU)
   - Retention cohorts

2. **Feature Usage Dashboard**
   - Humanizations per day
   - Character count distribution
   - Tone preference breakdown
   - AI provider usage (Gemini vs Claude)

3. **Pro Conversion Funnel**
   - Signup → First Humanization → Rate Limit Hit → Pro Request → Pro Upgrade
   - Conversion rates at each step
   - Drop-off analysis

4. **Performance Dashboard**
   - Average processing time
   - Error rates
   - API response times

### Create Funnels

Example: **Pro Upgrade Funnel**
1. User signs up
2. User performs first humanization
3. User hits rate limit
4. User visits pricing page
5. User submits Pro request
6. User completes payment

---

## Step 9: Set Up Alerts (Optional)

Configure alerts for critical events:

1. Go to PostHog → Alerts
2. Create alerts for:
   - **Error Spike**: `error_occurred` count > 50/hour
   - **Drop in Signups**: `user_signed_up` < 5/day
   - **Rate Limit Issues**: `rate_limit_hit` > 100/hour
   - **Pro Conversion Drop**: Pro funnel completion < 5%

---

## Step 10: GDPR Compliance

### Cookie Banner (Optional)

PostHog is configured to be privacy-friendly by default:
- Only tracks identified users (logged-in)
- Masks sensitive inputs
- Limited autocapture

However, if you want a cookie banner:

```typescript
// In lib/analytics/posthog.ts
posthog.init(apiKey, {
  opt_out_capturing_by_default: true, // Require opt-in
  // ... rest of config
});

// Then allow users to opt in:
posthog.opt_in_capturing();
```

### User Data Rights

PostHog supports GDPR data rights:

**Delete User Data:**
```bash
# Via PostHog dashboard
Settings → Project → Data Management → Delete Person
```

**Export User Data:**
```bash
# Via API (requires Personal API Key)
curl https://app.posthog.com/api/projects/:project_id/persons/:person_id \
  -H "Authorization: Bearer <personal-api-key>"
```

---

## Troubleshooting

### Events Not Showing in Dashboard

**Check 1: API Key Configured**
- Ensure `NEXT_PUBLIC_POSTHOG_KEY` is set in `.env.local`
- Key should start with `phc_`
- No placeholder text like `your_project_api_key`

**Check 2: Network Requests**
- Open DevTools → Network
- Filter for `posthog` or `e/`
- Should see POST requests with 200 status

**Check 3: Console Logs**
- Enable debug mode in `lib/analytics/posthog.ts`:
  ```typescript
  loaded: (posthog) => {
    posthog.debug(true); // Enable debug logs
  }
  ```

**Check 4: Ad Blockers**
- PostHog may be blocked by ad blockers
- Test in incognito mode or disable ad blocker

### Session Replay Not Working

**Check 1: Session Recording Enabled**
```typescript
disable_session_recording: false,
```

**Check 2: Verify Recording in Dashboard**
- PostHog → Session Replay → Recordings
- May take a few minutes to process

**Check 3: Check PostHog Plan**
- Session replay requires PostHog paid plan or self-hosted

### Events Not Tracked

**Check 1: User Identified**
- Events only tracked for identified users
- Ensure `identifyUser()` called after login:
  ```typescript
  identifyUser(user.id, { email: user.email });
  ```

**Check 2: PostHog Initialized**
- Check `window.posthog` exists in browser console
- If undefined, check API key configuration

---

## Cost Optimization

### PostHog Pricing (as of 2024)

**Free Tier**:
- 1M events/month
- 5,000 session recordings/month
- Unlimited team members
- 1 year data retention

**Paid Tier** (if you exceed free tier):
- Pay-as-you-go: $0.00005/event after 1M
- Session recordings: $0.005/recording after 5K

### Reduce Costs

**1. Limit Session Recordings**
```typescript
session_recording: {
  sampleRate: 0.1, // Record only 10% of sessions
}
```

**2. Reduce Event Volume**
- Only track critical events
- Use event aggregation
- Filter out bot/crawler traffic

**3. Shorter Data Retention**
- Settings → Data Management → Data Retention
- Reduce from 1 year to 3-6 months

---

## Security Best Practices

✅ **Do:**
- Keep API key in environment variables
- Use `NEXT_PUBLIC_` prefix (safe for client-side)
- Mask sensitive form inputs (already configured)
- Only identify users after authentication

❌ **Don't:**
- Hardcode API key in source code
- Track PII (passwords, credit cards, etc.)
- Send API keys or secrets in event properties
- Track unauthenticated user behavior (privacy)

---

## Next Steps

1. ✅ Set up PostHog account
2. ✅ Configure environment variables
3. ✅ Verify events are tracking
4. Create dashboards for key metrics
5. Set up conversion funnels
6. Configure alerts for critical events
7. Review data weekly to identify trends

---

## Useful Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog Next.js Guide](https://posthog.com/docs/libraries/next-js)
- [GDPR Compliance](https://posthog.com/docs/privacy/gdpr-compliance)
- [PostHog API Reference](https://posthog.com/docs/api)
- [Session Replay Guide](https://posthog.com/docs/session-replay)

---

## Support

If you encounter issues:
1. Check PostHog Status: [status.posthog.com](https://status.posthog.com)
2. PostHog Community: [posthog.com/questions](https://posthog.com/questions)
3. PostHog Slack: Get invite from dashboard
4. Email Support: hey@posthog.com
