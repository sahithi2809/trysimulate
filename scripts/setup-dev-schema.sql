-- Complete schema setup for dev database
-- Run this in Supabase Dashboard → SQL Editor for your dev project

-- 1. Secrets table
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

CREATE INDEX IF NOT EXISTS idx_secrets_key_name ON secrets(key_name);
CREATE INDEX IF NOT EXISTS idx_secrets_is_active ON secrets(is_active);
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- 2. Simulations table
CREATE TABLE IF NOT EXISTS simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  duration TEXT NOT NULL,
  learning_objectives TEXT[],
  skills_tested TEXT[],
  html_content TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tags TEXT[],
  metadata JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_name TEXT
);

CREATE INDEX IF NOT EXISTS idx_simulations_created_by ON simulations(created_by);
CREATE INDEX IF NOT EXISTS idx_simulations_category ON simulations(category);
CREATE INDEX IF NOT EXISTS idx_simulations_is_published ON simulations(is_published);
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

-- 3. User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  user_role TEXT CHECK (user_role IN (
    'hiring_manager', 'student', 'professional', 'professor', 'recruiter', 'other'
  )),
  how_heard_about_us TEXT CHECK (how_heard_about_us IN (
    'google_search', 'social_media', 'friend_referral', 'linkedin', 'email_campaign', 'blog_article', 'other'
  )),
  marketing_purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_role ON user_profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_how_heard ON user_profiles(how_heard_about_us);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Simulation sessions table
CREATE TABLE IF NOT EXISTS simulation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'completed', 'abandoned')),
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  final_score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  user_responses JSONB DEFAULT '{}'::jsonb,
  simulation_state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON simulation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_simulation_id ON simulation_sessions(simulation_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON simulation_sessions(status);
ALTER TABLE simulation_sessions ENABLE ROW LEVEL SECURITY;

-- 5. User activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES simulation_sessions(id) ON DELETE SET NULL,
  simulation_id UUID REFERENCES simulations(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'simulation_started', 'simulation_completed', 'simulation_abandoned',
    'step_completed', 'button_clicked', 'input_submitted', 'feedback_given',
    'simulation_created', 'simulation_published', 'page_viewed',
    'search_performed', 'filter_applied'
  )),
  activity_data JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;


