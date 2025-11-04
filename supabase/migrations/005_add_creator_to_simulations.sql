-- Add creator tracking to simulations table
ALTER TABLE simulations
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS creator_name TEXT;

-- Index for filtering simulations by creator
CREATE INDEX IF NOT EXISTS idx_simulations_created_by ON simulations(created_by);

-- Update RLS to allow creators to manage their simulations
CREATE POLICY IF NOT EXISTS "Creators can manage own simulations" ON simulations
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

