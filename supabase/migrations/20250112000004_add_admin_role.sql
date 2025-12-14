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
-- Only admins can see who is admin
CREATE POLICY "Only admins can view admin status"
ON public.users
FOR SELECT
USING (
  is_admin = TRUE OR auth.uid() = id
);
