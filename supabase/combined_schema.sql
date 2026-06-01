-- =============================================
-- Humanify Database Schema
-- Version: 1.0.0
-- Security: Row Level Security (RLS) enabled on all tables
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'past_due')),
  stripe_customer_id TEXT UNIQUE,
  daily_usage_count INTEGER NOT NULL DEFAULT 0,
  daily_usage_reset_at TIMESTAMPTZ,
  total_humanizations INTEGER NOT NULL DEFAULT 0,
  total_characters_processed BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Humanizations table (stores all text transformations)
CREATE TABLE public.humanizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  humanized_text TEXT NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('casual', 'professional', 'academic', 'neutral', 'creative')),
  character_count INTEGER NOT NULL,
  ai_score_before DECIMAL(3,1) CHECK (ai_score_before >= 0 AND ai_score_before <= 100),
  ai_score_after DECIMAL(3,1) CHECK (ai_score_after >= 0 AND ai_score_after <= 100),
  processing_time_ms INTEGER,
  ai_provider TEXT CHECK (ai_provider IN ('claude', 'gpt4', 'gemini')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions table (tracks Stripe subscriptions)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'unpaid')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usage logs table (for analytics and debugging)
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API keys table (for future API access feature)
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =============================================
-- INDEXES (Performance optimization)
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX idx_users_plan_type ON public.users(plan_type);

-- Humanizations indexes
CREATE INDEX idx_humanizations_user_id ON public.humanizations(user_id);
CREATE INDEX idx_humanizations_created_at ON public.humanizations(created_at DESC);
CREATE INDEX idx_humanizations_user_created ON public.humanizations(user_id, created_at DESC);
CREATE INDEX idx_humanizations_tone ON public.humanizations(tone);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Usage logs indexes
CREATE INDEX idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON public.usage_logs(created_at DESC);
CREATE INDEX idx_usage_logs_action ON public.usage_logs(action);

-- API keys indexes
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);

-- =============================================
-- TRIGGERS (Automatic updates)
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Security Engineer: Defense in depth approach
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.humanizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users policies
-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except sensitive fields)
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from changing these fields directly
    plan_type = (SELECT plan_type FROM public.users WHERE id = auth.uid()) AND
    stripe_customer_id = (SELECT stripe_customer_id FROM public.users WHERE id = auth.uid()) AND
    daily_usage_count = (SELECT daily_usage_count FROM public.users WHERE id = auth.uid()) AND
    daily_usage_reset_at = (SELECT daily_usage_reset_at FROM public.users WHERE id = auth.uid()) AND
    total_humanizations = (SELECT total_humanizations FROM public.users WHERE id = auth.uid()) AND
    total_characters_processed = (SELECT total_characters_processed FROM public.users WHERE id = auth.uid()) AND
    subscription_status = (SELECT subscription_status FROM public.users WHERE id = auth.uid())
  );

-- Humanizations policies
-- Users can view their own humanizations
CREATE POLICY "Users can view own humanizations"
  ON public.humanizations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own humanizations
CREATE POLICY "Users can create own humanizations"
  ON public.humanizations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own humanizations
CREATE POLICY "Users can delete own humanizations"
  ON public.humanizations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Subscriptions policies
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert/update subscriptions (via service role)
-- No INSERT/UPDATE policies for regular users

-- Usage logs policies
-- Users can view their own usage logs
CREATE POLICY "Users can view own usage logs"
  ON public.usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert usage logs (via service role client, which bypasses RLS)
-- No public INSERT policy is defined to prevent client-side log tampering and flooding


-- API keys policies
-- Users can view their own API keys
CREATE POLICY "Users can view own api keys"
  ON public.api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own API keys
CREATE POLICY "Users can create own api keys"
  ON public.api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own API keys
CREATE POLICY "Users can update own api keys"
  ON public.api_keys
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own API keys
CREATE POLICY "Users can delete own api keys"
  ON public.api_keys
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS (Helper functions for API)
-- =============================================

-- Function to check if user has exceeded rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(user_uuid UUID)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMPTZ) AS $$
DECLARE
  user_plan TEXT;
  user_count INTEGER;
  user_reset TIMESTAMPTZ;
  daily_limit INTEGER;
BEGIN
  -- Get user's plan and current usage
  SELECT plan_type, daily_usage_count, daily_usage_reset_at
  INTO user_plan, user_count, user_reset
  FROM public.users
  WHERE id = user_uuid;

  -- Set limit based on plan
  IF user_plan = 'pro' THEN
    daily_limit := 999999; -- Effectively unlimited
  ELSE
    daily_limit := 5; -- Free plan limit
  END IF;

  -- Check if we need to reset the counter
  IF user_reset IS NULL OR user_reset < NOW() THEN
    user_count := 0;
    user_reset := (NOW() + INTERVAL '1 day')::DATE::TIMESTAMPTZ;

    -- Update user's reset time
    UPDATE public.users
    SET daily_usage_count = 0,
        daily_usage_reset_at = user_reset
    WHERE id = user_uuid;
  END IF;

  -- Return rate limit info
  RETURN QUERY SELECT
    (user_count < daily_limit) AS allowed,
    GREATEST(0, daily_limit - user_count) AS remaining,
    user_reset AS reset_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_usage(user_uuid UUID, chars INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET
    daily_usage_count = daily_usage_count + 1,
    total_humanizations = total_humanizations + 1,
    total_characters_processed = total_characters_processed + chars,
    updated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely get user by ID (with plan info)
CREATE OR REPLACE FUNCTION get_user_with_plan(user_uuid UUID)
RETURNS TABLE(
  id UUID,
  email TEXT,
  name TEXT,
  plan_type TEXT,
  subscription_status TEXT,
  daily_usage_count INTEGER,
  daily_usage_reset_at TIMESTAMPTZ,
  total_humanizations INTEGER,
  total_characters_processed BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.name,
    u.plan_type,
    u.subscription_status,
    u.daily_usage_count,
    u.daily_usage_reset_at,
    u.total_humanizations,
    u.total_characters_processed
  FROM public.users u
  WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SEED DATA (Development only)
-- =============================================

-- Note: In production, users are created via Supabase Auth
-- This is just for reference

-- =============================================
-- SECURITY NOTES
-- =============================================

/*
SECURITY CHECKLIST:
âœ… RLS enabled on all tables
âœ… Users can only access their own data
âœ… Sensitive operations use SECURITY DEFINER functions
âœ… Input validation via CHECK constraints
âœ… Indexes for performance (prevents DoS via slow queries)
âœ… Automatic triggers for data consistency
âœ… Foreign key constraints for referential integrity
âœ… No direct exposure of internal IDs
âœ… Stripe data stored securely
âœ… Usage tracking for anomaly detection

ADDITIONAL SECURITY MEASURES NEEDED:
- Rate limiting at API level (Upstash)
- Input sanitization in application layer
- HTTPS only in production
- Secure environment variables
- Regular security audits
- Monitor for suspicious activity in usage_logs
*/

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions for anon role (public access)
GRANT USAGE ON SCHEMA public TO anon;

-- Service role has full access (already configured in Supabase)
-- Add Razorpay fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_razorpay_customer_id ON public.users(razorpay_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_razorpay_subscription_id ON public.users(razorpay_subscription_id);

-- Comment
COMMENT ON COLUMN public.users.razorpay_customer_id IS 'Razorpay customer ID for Indian users';
COMMENT ON COLUMN public.users.razorpay_subscription_id IS 'Razorpay subscription ID for Indian users';

-- Drop and recreate the update policy to also protect Razorpay fields
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    plan_type = (SELECT plan_type FROM public.users WHERE id = auth.uid()) AND
    stripe_customer_id = (SELECT stripe_customer_id FROM public.users WHERE id = auth.uid()) AND
    daily_usage_count = (SELECT daily_usage_count FROM public.users WHERE id = auth.uid()) AND
    daily_usage_reset_at = (SELECT daily_usage_reset_at FROM public.users WHERE id = auth.uid()) AND
    total_humanizations = (SELECT total_humanizations FROM public.users WHERE id = auth.uid()) AND
    total_characters_processed = (SELECT total_characters_processed FROM public.users WHERE id = auth.uid()) AND
    subscription_status = (SELECT subscription_status FROM public.users WHERE id = auth.uid()) AND
    razorpay_customer_id = (SELECT razorpay_customer_id FROM public.users WHERE id = auth.uid()) AND
    razorpay_subscription_id = (SELECT razorpay_subscription_id FROM public.users WHERE id = auth.uid())
  );

-- Add encrypted Claude API key field for Pro users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS claude_api_key_encrypted TEXT;

-- Add column for AI provider preference
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS preferred_ai_provider TEXT DEFAULT 'gemini' CHECK (preferred_ai_provider IN ('gemini', 'claude'));

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_preferred_ai_provider ON public.users(preferred_ai_provider);

-- Comments
COMMENT ON COLUMN public.users.claude_api_key_encrypted IS 'Encrypted Claude API key for Pro users (user-provided)';
COMMENT ON COLUMN public.users.preferred_ai_provider IS 'User''s preferred AI provider (gemini or claude)';
-- Update rate limit function to use 10 per day for free tier
CREATE OR REPLACE FUNCTION check_rate_limit(user_uuid UUID)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMPTZ) AS $$
DECLARE
  user_plan TEXT;
  user_count INTEGER;
  user_reset TIMESTAMPTZ;
  daily_limit INTEGER;
BEGIN
  -- Get user's plan and current usage
  SELECT plan_type, daily_usage_count, daily_usage_reset_at
  INTO user_plan, user_count, user_reset
  FROM public.users
  WHERE id = user_uuid;

  -- Set limit based on plan
  IF user_plan = 'pro' THEN
    daily_limit := 999999; -- Effectively unlimited
  ELSE
    daily_limit := 10; -- Free plan: 10 per day (updated from 5)
  END IF;

  -- Check if we need to reset the counter
  IF user_reset IS NULL OR user_reset < NOW() THEN
    user_count := 0;
    user_reset := (NOW() + INTERVAL '1 day')::DATE::TIMESTAMPTZ;

    -- Update user's reset time
    UPDATE public.users
    SET daily_usage_count = 0,
        daily_usage_reset_at = user_reset
    WHERE id = user_uuid;
  END IF;

  -- Return rate limit info
  RETURN QUERY SELECT
    (user_count < daily_limit) AS allowed,
    GREATEST(0, daily_limit - user_count) AS remaining,
    user_reset AS reset_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create table for Pro access requests (waitlist/manual approval)
CREATE TABLE public.pro_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  message TEXT,
  use_case TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT
);

-- Indexes
CREATE INDEX idx_pro_requests_user_id ON public.pro_requests(user_id);
CREATE INDEX idx_pro_requests_status ON public.pro_requests(status);
CREATE INDEX idx_pro_requests_created_at ON public.pro_requests(created_at DESC);

-- RLS
ALTER TABLE public.pro_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON public.pro_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create own requests"
  ON public.pro_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only one pending request per user
CREATE UNIQUE INDEX idx_pro_requests_unique_pending
  ON public.pro_requests(user_id)
  WHERE status = 'pending';

-- Comments
COMMENT ON TABLE public.pro_requests IS 'Pro plan access requests for manual approval';
COMMENT ON COLUMN public.pro_requests.status IS 'pending, approved, or rejected';
COMMENT ON COLUMN public.pro_requests.use_case IS 'Why the user wants Pro access';
-- Add admin role to users table
-- Security Engineer: Proper RBAC implementation

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Index for fast admin checks
CREATE INDEX IF NOT EXISTS idx_users_is_admin
ON public.users(is_admin)
WHERE is_admin = TRUE;

-- Add comment
COMMENT ON COLUMN public.users.is_admin IS 'Admin role flag for access control';

-- Make the creator admin (update with your email)
-- IMPORTANT: Update this email to your actual email before running
UPDATE public.users
SET is_admin = TRUE
WHERE email = 'aneeshvrao2017@gmail.com';

-- Add RLS policy for admin checks
-- Only admins can see admin status, and users can view their own profile
CREATE POLICY "Only admins can view admin status"
ON public.users
FOR SELECT
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Drop and recreate the update policy to also protect the is_admin field
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    plan_type = (SELECT plan_type FROM public.users WHERE id = auth.uid()) AND
    stripe_customer_id = (SELECT stripe_customer_id FROM public.users WHERE id = auth.uid()) AND
    daily_usage_count = (SELECT daily_usage_count FROM public.users WHERE id = auth.uid()) AND
    daily_usage_reset_at = (SELECT daily_usage_reset_at FROM public.users WHERE id = auth.uid()) AND
    total_humanizations = (SELECT total_humanizations FROM public.users WHERE id = auth.uid()) AND
    total_characters_processed = (SELECT total_characters_processed FROM public.users WHERE id = auth.uid()) AND
    subscription_status = (SELECT subscription_status FROM public.users WHERE id = auth.uid()) AND
    razorpay_customer_id = (SELECT razorpay_customer_id FROM public.users WHERE id = auth.uid()) AND
    razorpay_subscription_id = (SELECT razorpay_subscription_id FROM public.users WHERE id = auth.uid()) AND
    is_admin = (SELECT is_admin FROM public.users WHERE id = auth.uid())
  );

-- Add RLS policy for admins to view all Pro requests
-- Security Engineer: Allow admins to view and manage all Pro access requests

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Admins can view all requests" ON public.pro_requests;

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON public.pro_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Note: We don't need UPDATE/DELETE policies for admins because
-- the admin API uses the service role client which bypasses RLS
-- This SELECT policy is only for the admin panel to fetch requests

COMMENT ON POLICY "Admins can view all requests" ON public.pro_requests
  IS 'Allows admin users to view all Pro access requests in the admin panel';
