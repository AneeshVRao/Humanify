# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: Humanify
   - **Database Password**: (Generate strong password and save it)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

## Step 2: Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and run the SQL migration files located in `/supabase/migrations/` in chronological order:
   - `20250101000000_initial_schema.sql` (Initial Schema)
   - `20250112000000_add_razorpay_fields.sql` (Razorpay fields)
   - `20250112000001_add_claude_api_key.sql` (Claude API key integration)
   - `20250112000002_update_rate_limits.sql` (Updated rate limits structure)
   - `20250112000003_pro_requests.sql` (Pro Plan requests database for waitlist)
   - `20250112000004_add_admin_role.sql` (Admin role checks)
   - `20250112000005_admin_pro_requests_rls.sql` (Admin Pro requests RLS policy)
4. Paste the SQL contents and click "Run" (run each sequentially).
5. Verify success: You should see "Success. No rows returned" for each query executed.

## Step 3: Configure Authentication

### Email Settings

1. Go to **Authentication** → **Email Templates**
2. Customize templates (optional):
   - Confirm signup
   - Magic Link
   - Change Email
   - Reset Password

### Auth Providers

1. Go to **Authentication** → **Providers**
2. **Email** provider is enabled by default ✅
3. (Optional) Enable OAuth providers:
   - **Google OAuth**:
     - Go to [Google Cloud Console](https://console.cloud.google.com)
     - Create OAuth credentials
     - Add to Supabase
   - **GitHub OAuth**:
     - Go to GitHub Settings → Developer settings
     - Create OAuth App
     - Add to Supabase

### URL Configuration

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```

## Step 4: Get API Keys

1. Go to **Settings** → **API**
2. Copy these values to your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (⚠️ Keep secret!) → `SUPABASE_SERVICE_ROLE_KEY`

## Step 5: Verify Database

1. Go to **Database** → **Tables**
2. You should see:
   - ✅ users
   - ✅ humanizations
   - ✅ subscriptions
   - ✅ usage_logs
   - ✅ api_keys
   - ✅ pro_requests (Waitlist / manual approval requests)

3. Go to **Database** → **Policies**
4. Verify RLS is enabled on all tables (including the `pro_requests` table to secure user/admin checks).

## Step 6: Test Authentication

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Enter test email and password
4. User should appear in list
5. Check **Database** → **Table Editor** → **users**
6. Verify user profile was auto-created ✅

## Environment Variables

Create `.env.local` with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Keep secret!)

# Database (optional, for direct connection)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

## Security Checklist

- [x] RLS enabled on all tables
- [x] Email verification required for signup
- [x] Strong password policy enabled
- [x] Redirect URLs configured
- [x] Service role key kept secret
- [ ] Enable 2FA for your Supabase account (recommended)
- [ ] Set up database backups (Pro plan)

## Testing Database Functions

Test the rate limiting function:

```sql
-- Check rate limit for a user
SELECT * FROM check_rate_limit('user-uuid-here');

-- Should return:
-- allowed | remaining | reset_at
-- true    | 5         | 2025-01-11 00:00:00+00
```

Test user creation trigger:

```sql
-- This happens automatically when a user signs up via Supabase Auth
-- But you can verify the trigger exists:
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## Troubleshooting

### Issue: Migration fails
**Solution**:
- Check for syntax errors
- Ensure you're using the SQL Editor (not Table Editor)
- Run each section separately if needed

### Issue: RLS blocks all queries
**Solution**:
- Verify you're authenticated when testing
- Check policies are created correctly
- Use service role key for backend operations

### Issue: User profile not auto-created
**Solution**:
- Check trigger is created: `SELECT * FROM pg_trigger`
- Verify function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user'`
- Test manually: Sign up a new user and check users table

## Next Steps

✅ Database schema created
✅ RLS policies configured
✅ Auth configured
⏭️ Next: Install dependencies and create API utilities
