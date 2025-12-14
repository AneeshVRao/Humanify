# Backend Setup Guide

Complete guide to setting up the Humanify backend infrastructure.

## Overview

You've successfully built:
- ✅ Supabase database schema with RLS
- ✅ Upstash rate limiting
- ✅ Hybrid AI service (Gemini + Claude)
- ✅ Secure API routes
- ✅ Type-safe utilities

Now let's get it running!

---

## Step 1: Supabase Setup (15 minutes)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: Humanify
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., US East, EU West)
4. Click "Create new project"
5. Wait 2-3 minutes for project provisioning

### 1.2 Run Database Migration

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Open `/supabase/migrations/20250101000000_initial_schema.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click **RUN** (or Ctrl+Enter)
7. ✅ You should see "Success. No rows returned"

### 1.3 Verify Tables Created

1. Go to **Database** → **Tables**
2. Verify these tables exist:
   - users
   - humanizations
   - subscriptions
   - usage_logs
   - api_keys

### 1.4 Configure Authentication

1. Go to **Authentication** → **Providers**
2. Verify **Email** is enabled ✅
3. Go to **Authentication** → **URL Configuration**
4. Add to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/*
   ```

### 1.5 Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:

```bash
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (⚠️ Keep secret!)
```

---

## Step 2: Upstash Setup (10 minutes)

### 2.1 Create Upstash Account

1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub (recommended)
3. Verify email

### 2.2 Create Redis Database

1. Click "Create Database"
2. Fill in:
   - **Name**: humanify-ratelimit
   - **Type**: Regional (cheaper) or Global (faster)
   - **Region**: Choose same as Supabase
3. Click "Create"

### 2.3 Get Redis Credentials

1. In your database dashboard, scroll to **REST API**
2. Copy these values:

```bash
UPSTASH_REDIS_REST_URL: https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN: AXXXxxx...
```

---

## Step 3: AI Provider Setup

### 3.1 Anthropic Claude (Pro Users)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / Login
3. Go to **API Keys**
4. Click "Create Key"
5. Name: "Humanify Production"
6. Copy the key: `sk-ant-api03-xxxxx`

**Pricing**: $3 per 1M input tokens, $15 per 1M output tokens
**Free tier**: $5 credit on signup

### 3.2 Google Gemini (Free Users)

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with Google
3. Click "Get API Key"
4. Click "Create API Key"
5. Copy the key: `AIzaSyXXXXX`

**Pricing**: Free tier 15 requests/minute, $0.075 per 1M tokens
**Free tier**: Very generous, 1,500 requests/day

---

## Step 4: Environment Variables

Create `.env.local` in your project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # ⚠️ KEEP SECRET!

# AI Providers
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
GEMINI_API_KEY=AIzaSyXXXXX

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxx...

# Stripe (Will add later)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Step 5: Test the Backend

### 5.1 Start Development Server

```bash
npm run dev
```

You should see:
```
✓ Ready in 2.3s
Local: http://localhost:3000
```

### 5.2 Test Supabase Connection

Create a test user:

1. Go to Supabase dashboard → **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Email: `test@example.com`
4. Password: `TestPassword123!`
5. Click "Create user"
6. Check **Database** → **Table Editor** → **users**
7. ✅ User profile should be auto-created (via trigger)

### 5.3 Test API Endpoints

Using cURL or Postman:

#### 1. Sign in to get auth token

```bash
curl -X POST 'https://xxxxx.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

Copy the `access_token` from response.

#### 2. Test humanization endpoint

```bash
curl -X POST http://localhost:3000/api/humanize \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is a test text that needs to be humanized. It should be at least fifty characters long to pass validation.",
    "tone": "professional"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "originalText": "This is a test...",
    "humanizedText": "Here is the humanized version...",
    "tone": "professional",
    "characterCount": 123,
    "processingTimeMs": 1234,
    "aiProvider": "gemini",
    "remainingUses": 4
  }
}
```

#### 3. Test usage endpoint

```bash
curl http://localhost:3000/api/user/usage \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4. Test history endpoint

```bash
curl http://localhost:3000/api/user/history \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Step 6: Verify Everything Works

### Checklist

- [x] **Supabase**
  - [x] Database tables created
  - [x] RLS policies active
  - [x] Auth configured
  - [x] Test user can sign in

- [x] **Upstash**
  - [x] Redis database created
  - [x] Rate limiting works (try 6 requests as free user)

- [x] **AI Services**
  - [x] Gemini responds (free users)
  - [x] Claude responds (pro users)

- [x] **API Endpoints**
  - [x] POST /api/humanize - Works
  - [x] GET /api/user/profile - Works
  - [x] GET /api/user/usage - Works
  - [x] GET /api/user/history - Works

---

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Solution**: Check `.env.local` file exists and has correct values

### Error: "Failed to connect to Upstash"

**Solution**:
1. Verify Redis database is active in Upstash dashboard
2. Check REST URL and token are correct
3. Make sure you're using REST API credentials (not native Redis)

### Error: "AI service unavailable"

**Solution**:
1. Check API keys are valid
2. Verify you have credits/quota remaining
3. Check API key permissions

### Error: "User profile not created automatically"

**Solution**:
1. Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created'`
2. Manually create profile:
```sql
INSERT INTO users (id, email) VALUES ('user-id-from-auth-users', 'test@example.com');
```

### Rate limit not working

**Solution**:
1. Check Upstash is connected
2. Try clearing Redis: `redis.flushall()` in Upstash console
3. Check function `check_rate_limit` exists in database

---

## Cost Breakdown (First 1000 Users)

### Free Tier Costs:
- **Supabase**: Free (up to 50,000 MAU)
- **Upstash**: Free (10K requests/day)
- **Gemini**: Free (1500 requests/day)
- **Total**: $0/month 🎉

### With 1000 Active Users (Avg 10 requests/month):
- **Supabase**: $0 (still within free tier)
- **Upstash**: ~$5/month (after free tier)
- **Gemini (80% free users)**: ~$0.80/month
- **Claude (20% pro users)**: ~$10.40/month
- **Total**: ~$16/month

**Revenue if 20% convert to Pro ($5.99/month)**:
- 200 users × $5.99 = $1,198/month
- **Profit**: $1,182/month 💰

---

## Next Steps

✅ Backend is fully set up!

Now you can:
1. Build authentication pages (login, signup)
2. Create dashboard UI
3. Implement Stripe payments
4. Deploy to production

See `AUTHENTICATION_SETUP.md` for next steps!
