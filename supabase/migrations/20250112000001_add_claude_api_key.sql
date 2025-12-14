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
