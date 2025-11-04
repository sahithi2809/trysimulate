-- User Activity Log Table
-- Tracks all user interactions for analytics
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES simulation_sessions(id) ON DELETE SET NULL,
  simulation_id UUID REFERENCES simulations(id) ON DELETE SET NULL,
  
  -- Activity Details
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'simulation_started',
    'simulation_completed',
    'simulation_abandoned',
    'step_completed',
    'button_clicked',
    'input_submitted',
    'feedback_given',
    'simulation_created',
    'simulation_published',
    'page_viewed',
    'search_performed',
    'filter_applied'
  )),
  
  -- Activity Data
  activity_data JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for scalability and performance
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at DESC);
CREATE INDEX idx_user_activity_simulation_id ON user_activity(simulation_id);
CREATE INDEX idx_user_activity_session_id ON user_activity(session_id);
CREATE INDEX idx_user_activity_composite ON user_activity(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Users can only view their own activity
CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity" ON user_activity
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

