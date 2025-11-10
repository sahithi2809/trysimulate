-- Simulation Sessions Table
-- Tracks when a user starts/completes a simulation
CREATE TABLE IF NOT EXISTS simulation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  
  -- Session Status
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN (
    'started',
    'in_progress',
    'completed',
    'abandoned'
  )),
  
  -- Progress Tracking
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Scoring (for completed simulations)
  final_score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  
  -- Metadata
  user_responses JSONB DEFAULT '{}'::jsonb,
  simulation_state JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON simulation_sessions(user_id);
CREATE INDEX idx_sessions_simulation_id ON simulation_sessions(simulation_id);
CREATE INDEX idx_sessions_status ON simulation_sessions(status);
CREATE INDEX idx_sessions_created_at ON simulation_sessions(created_at DESC);
CREATE INDEX idx_sessions_user_simulation ON simulation_sessions(user_id, simulation_id);

-- Enable RLS
ALTER TABLE simulation_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON simulation_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON simulation_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON simulation_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update duration on completion
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.completed_at IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_duration_trigger
  BEFORE UPDATE ON simulation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_duration();



