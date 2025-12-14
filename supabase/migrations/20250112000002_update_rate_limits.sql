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
