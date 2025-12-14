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
