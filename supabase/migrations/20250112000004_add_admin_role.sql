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

