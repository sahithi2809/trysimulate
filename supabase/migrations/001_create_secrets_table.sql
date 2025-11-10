-- Create a table to store API keys and secrets securely
-- This table should NOT be accessible from the browser
-- Only Edge Functions can read from this table

CREATE TABLE IF NOT EXISTS secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT UNIQUE NOT NULL,
  key_value TEXT NOT NULL,
  description TEXT,
  environment TEXT DEFAULT 'production' CHECK (environment IN ('production', 'development', 'staging')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX idx_secrets_key_name ON secrets(key_name);
CREATE INDEX idx_secrets_is_active ON secrets(is_active);

-- Enable Row Level Security
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: No public access policies!
-- Only service role (backend) can access this table
-- This prevents browser clients from reading secrets

-- Policy: Only service role can read secrets
CREATE POLICY "Service role can read secrets" ON secrets
  FOR SELECT
  USING (false); -- No one can read via RLS, only via service role

-- Policy: Only service role can insert secrets
CREATE POLICY "Service role can insert secrets" ON secrets
  FOR INSERT
  WITH CHECK (false); -- No one can insert via RLS, only via service role

-- Policy: Only service role can update secrets
CREATE POLICY "Service role can update secrets" ON secrets
  FOR UPDATE
  USING (false); -- No one can update via RLS, only via service role

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_secrets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updated_at
CREATE TRIGGER update_secrets_updated_at_trigger
  BEFORE UPDATE ON secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_secrets_updated_at();

-- Insert default secrets (you'll need to update these values in Supabase dashboard)
INSERT INTO secrets (key_name, key_value, description, environment) VALUES
  ('OPENAI_API_KEY', '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', 'OpenAI API key for AI simulation generation', 'production'),
  ('OPENAI_MODEL', 'gpt-4o-mini', 'Default OpenAI model to use', 'production')
ON CONFLICT (key_name) DO NOTHING;

COMMENT ON TABLE secrets IS 'Stores API keys and secrets securely. Only accessible via service role (Edge Functions).';



