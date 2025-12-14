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
