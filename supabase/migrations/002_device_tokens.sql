-- ============================================
-- DEVICE TOKENS TABLE
-- For desktop app authentication
-- ============================================
CREATE TABLE device_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  access_token TEXT,
  device_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ
);

-- Index for quick code lookups
CREATE INDEX idx_device_tokens_code ON device_tokens(code);
CREATE INDEX idx_device_tokens_access_token ON device_tokens(access_token);

-- Enable RLS
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own device tokens" ON device_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own device tokens" ON device_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own device tokens" ON device_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Allow service role full access for API operations
CREATE POLICY "Service role can manage device tokens" ON device_tokens
  FOR ALL USING (true);

-- Add is_online to profiles for live status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Function to cleanup expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_device_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM device_tokens WHERE expires_at < NOW();
END;
$$;
