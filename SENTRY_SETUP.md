# Sentry Error Tracking Setup

**Status:** ✅ Code configured, awaiting credentials

---

## Quick Setup (5 minutes)

### 1. Create Sentry Account
1. Go to https://sentry.io
2. Click "Sign Up" (free tier available)
3. Choose "Next.js" as your project type

### 2. Get Your DSN
1. After creating project, go to **Settings** → **Projects** → **Your Project**
2. Click **Client Keys (DSN)**
3. Copy the DSN (looks like: `https://abc123@o123.ingest.sentry.io/456`)

### 3. Update Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_DSN_HERE
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=humanify
SENTRY_AUTH_TOKEN=your-auth-token
```

**To get Auth Token:**
1. Go to **Settings** → **Auth Tokens**
2. Click **Create New Token**
3. Name: "Humanify Upload"
4. Scopes: `project:releases` and `project:write`
5. Copy the token

### 4. Test It Works

#### Test in Browser:
1. Start dev server: `npm run dev`
2. Visit: http://localhost:3000/sentry-example-page
3. Click "Throw error" button
4. Check Sentry dashboard for the error

#### Test in API:
```bash
curl http://localhost:3000/api/sentry-example-api
```

Check Sentry dashboard for server error.

---

## What's Configured

### ✅ Features Enabled:
- **Error Tracking** - All unhandled errors automatically captured
- **Session Replay** - See what user was doing when error occurred (10% sample)
- **Performance Monitoring** - Track slow API routes and pages
- **Source Maps** - See exact line of code that failed
- **Privacy Protection** - API keys filtered out automatically

### 🔒 Security Measures:
- API keys automatically filtered from error reports
- Headers and cookies stripped from server errors
- Sensitive env vars never sent
- Source maps hidden in production

### 📊 What Gets Tracked:
- Unhandled JavaScript errors (client & server)
- API route failures
- Database errors
- AI provider errors (without API keys)
- User sessions (sampled)

### ❌ What Doesn't Get Tracked:
- Errors containing "sk-" (API keys)
- Browser extension errors
- Common network timeouts
- Auth session errors (expected behavior)

---

## Testing After Setup

### Test Error Reporting:
Visit the test pages:
- **Client error**: http://localhost:3000/sentry-example-page
- **Server error**: http://localhost:3000/api/sentry-example-api

### Verify in Sentry:
1. Go to https://sentry.io
2. Click on your project
3. See errors appear in **Issues** tab
4. Click on error to see:
   - Stack trace
   - User session replay
   - Breadcrumbs (user actions before error)
   - Device/browser info

---

## Production Deployment

When deploying to production:

### Vercel:
Add environment variables in Vercel dashboard:
```
NEXT_PUBLIC_SENTRY_DSN=your-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=humanify
SENTRY_AUTH_TOKEN=your-token
```

### Manual:
Sentry will automatically upload source maps during build.

---

## Monitoring & Alerts

### Set Up Alerts:
1. Go to **Alerts** → **Create Alert**
2. Recommended alerts:
   - Error rate > 1% (send email)
   - New error type (send email)
   - Performance degradation (API > 5s)

### Check Dashboard Daily:
- **Issues** - New errors
- **Performance** - Slow routes
- **Releases** - Errors per deployment

---

## Cost

**Free Tier:**
- 5,000 errors/month
- 50 replays/month
- 10,000 performance units

**Paid (if needed):**
- $26/month for 50K errors
- $9/month for 500 replays

For a new app, free tier is plenty.

---

## Troubleshooting

### Not seeing errors?
1. Check DSN is correct in `.env.local`
2. Restart dev server
3. Clear browser cache
4. Check browser console for Sentry init errors

### Source maps not working?
1. Check `SENTRY_AUTH_TOKEN` is set
2. Check `SENTRY_ORG` and `SENTRY_PROJECT` match Sentry
3. Run `npm run build` and check for upload confirmation

### Too many errors?
Adjust sample rates in `sentry.client.config.ts`:
```ts
tracesSampleRate: 0.1, // 10% instead of 100%
```

---

## Next Steps After Setup

1. ✅ Get Sentry credentials
2. ✅ Add to `.env.local`
3. ✅ Test error reporting works
4. ✅ Set up email alerts
5. ✅ Deploy to production

---

**Setup Time:** 5-10 minutes
**Value:** Priceless (know when things break!)
