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

