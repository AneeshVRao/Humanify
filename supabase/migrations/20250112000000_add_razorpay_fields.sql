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
