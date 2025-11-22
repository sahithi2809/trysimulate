-- Task-Based Simulations Migration
-- Creates tables for flexible, multi-simulation task-based system
-- Supports different tasks, skills, and validation methods per simulation

-- Table 1: Task-Based Simulations
-- Stores all task-based simulation definitions (Noah, Amazon, Google, etc.)
CREATE TABLE IF NOT EXISTS task_based_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier (e.g., 'noah-smart-fitness-watch')
  description TEXT,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_duration TEXT, -- e.g., '6-8 hours'
  
  -- Company/Context Info (different per simulation)
  company_info JSONB NOT NULL DEFAULT '{}'::jsonb, -- Company logo, name, description
  
  -- Flexible Task Structure (JSON array of task definitions)
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example structure:
  -- [
  --   {
  --     "id": "task1",
  --     "type": "multi-text-input",
  --     "name": "Market Research",
  --     "icon": "🔍",
  --     "estimated_time": "60-90 min",
  --     "config": { ... },
  --     "validation": { ... }
  --   }
  -- ]
  
  -- Skills Tested (different per simulation)
  skills_tested TEXT[] NOT NULL DEFAULT '{}',
  
  -- Learning Objectives (different per simulation)
  learning_objectives TEXT[] NOT NULL DEFAULT '{}',
  
  -- Task-specific reference data (personas, competitors, etc.)
  task_data JSONB DEFAULT '{}'::jsonb,
  -- Example: { "personas": [...], "competitors": [...], "analyticsData": {...} }
  
  -- Validation Rules per Task (different per simulation)
  validation_rules JSONB DEFAULT '{}'::jsonb,
  -- Example: { "task1": { "method": "rule-based", "rubric": {...} } }
  
  -- Skill Mapping (maps tasks to skills for final report)
  skill_mapping JSONB DEFAULT '{}'::jsonb,
  -- Example: { "Product Sense": ["task1", "task3"], "Technical Feasibility": ["task2"] }
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Publishing
  is_published BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: Task Submissions
-- Stores individual task submissions and scores for each user
CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id UUID NOT NULL REFERENCES task_based_simulations(id) ON DELETE CASCADE,
  session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL, -- e.g., 'task1', 'task2'
  
  -- Submission Data
  task_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- All user inputs for this task
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Scoring
  score INTEGER CHECK (score >= 0 AND score <= 100), -- 0-100
  max_score INTEGER DEFAULT 100,
  score_breakdown JSONB, -- Detailed scores per rubric criteria
  strengths TEXT[],
  improvements TEXT[],
  
  -- Validation Method
  validation_method TEXT DEFAULT 'rule-based' CHECK (validation_method IN ('rule-based', 'llm-based')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one submission per task per session per user
  UNIQUE(user_id, simulation_id, session_id, task_id)
);

-- Table 3: Task-Based Progress
-- Tracks overall progress through task-based simulation
CREATE TABLE IF NOT EXISTS task_based_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id UUID NOT NULL REFERENCES task_based_simulations(id) ON DELETE CASCADE,
  session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  
  -- Progress Tracking
  current_task INTEGER DEFAULT 0 CHECK (current_task >= 0),
  completed_tasks TEXT[] DEFAULT '{}', -- Array of completed task IDs
  progress_percentage DECIMAL(5,2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Final Report (only populated when all tasks complete)
  final_score INTEGER CHECK (final_score >= 0 AND final_score <= 100),
  skill_breakdown JSONB, -- { "Product Sense": 85, "Technical Feasibility": 78, ... }
  resume_snippet TEXT,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one progress record per user per simulation per session
  UNIQUE(user_id, simulation_id, session_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_sims_slug ON task_based_simulations(slug);
CREATE INDEX IF NOT EXISTS idx_task_sims_published ON task_based_simulations(is_published, is_active);
CREATE INDEX IF NOT EXISTS idx_task_sims_category ON task_based_simulations(category);
CREATE INDEX IF NOT EXISTS idx_task_sims_created_at ON task_based_simulations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_task_submissions_user ON task_submissions(user_id, simulation_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_session ON task_submissions(session_id, task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_simulation ON task_submissions(simulation_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_created_at ON task_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_task_progress_user ON task_based_progress(user_id, simulation_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_session ON task_based_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_simulation ON task_based_progress(simulation_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_status ON task_based_progress(completed_at) WHERE completed_at IS NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE task_based_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_based_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_based_simulations
-- Anyone can view published simulations
CREATE POLICY "Anyone can view published simulations" ON task_based_simulations
  FOR SELECT
  USING (is_published = true AND is_active = true);

-- Creators can manage their own simulations
CREATE POLICY "Creators can manage own simulations" ON task_based_simulations
  FOR ALL
  USING (auth.uid() = created_by);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role full access" ON task_based_simulations
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for task_submissions
-- Users can only view their own submissions
CREATE POLICY "Users can view own submissions" ON task_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own submissions
CREATE POLICY "Users can create own submissions" ON task_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own submissions
CREATE POLICY "Users can update own submissions" ON task_submissions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for task_based_progress
-- Users can only view their own progress
CREATE POLICY "Users can view own progress" ON task_based_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own progress
CREATE POLICY "Users can create own progress" ON task_based_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" ON task_based_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_task_based_simulations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_task_based_simulations_updated_at_trigger
  BEFORE UPDATE ON task_based_simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_task_based_simulations_updated_at();

CREATE TRIGGER update_task_submissions_updated_at_trigger
  BEFORE UPDATE ON task_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_task_based_simulations_updated_at();

CREATE TRIGGER update_task_based_progress_updated_at_trigger
  BEFORE UPDATE ON task_based_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_task_based_simulations_updated_at();

-- Function to calculate progress percentage
CREATE OR REPLACE FUNCTION calculate_progress_percentage(
  completed_tasks_array TEXT[],
  total_tasks_count INTEGER
)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  IF total_tasks_count = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND((array_length(completed_tasks_array, 1)::DECIMAL / total_tasks_count) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE task_based_simulations IS 'Stores all task-based simulation definitions with flexible task structures';
COMMENT ON TABLE task_submissions IS 'Stores individual task submissions with scores and feedback';
COMMENT ON TABLE task_based_progress IS 'Tracks overall progress and final scores for each user per simulation';

COMMENT ON COLUMN task_based_simulations.tasks IS 'JSON array of task definitions with type, config, and validation rules';
COMMENT ON COLUMN task_based_simulations.skill_mapping IS 'Maps which tasks test which skills for final report calculation';
COMMENT ON COLUMN task_submissions.validation_method IS 'Method used for scoring: rule-based or llm-based';


