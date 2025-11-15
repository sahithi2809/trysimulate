-- Copy all RLS Policies, Indexes, Functions, and Triggers from Production to Dev
-- Run this in your DEV Supabase Dashboard SQL Editor
-- https://supabase.com/dashboard/project/qwhzvupmyjabkgbmvoxo/sql/new

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: handle_new_user
-- SECURITY DEFINER allows this function to bypass RLS policies
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- Function: update_secrets_updated_at
CREATE OR REPLACE FUNCTION public.update_secrets_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Function: update_session_duration
CREATE OR REPLACE FUNCTION public.update_session_duration()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status = 'completed' AND NEW.completed_at IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Function: update_user_profiles_updated_at
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_secrets_updated_at_trigger ON public.secrets;
DROP TRIGGER IF EXISTS update_session_duration_trigger ON public.simulation_sessions;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at_trigger ON public.user_profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger: update_secrets_updated_at_trigger
CREATE TRIGGER update_secrets_updated_at_trigger
  BEFORE UPDATE ON public.secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_secrets_updated_at();

-- Trigger: update_session_duration_trigger
CREATE TRIGGER update_session_duration_trigger
  BEFORE UPDATE ON public.simulation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_duration();

-- Trigger: update_user_profiles_updated_at_trigger
CREATE TRIGGER update_user_profiles_updated_at_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Trigger: on_auth_user_created (creates profile when user signs up)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- INDEXES (using IF NOT EXISTS to avoid errors)
-- ============================================================================

-- Secrets table indexes
CREATE INDEX IF NOT EXISTS idx_secrets_key_name ON public.secrets USING btree (key_name);
CREATE INDEX IF NOT EXISTS idx_secrets_is_active ON public.secrets USING btree (is_active);

-- Simulations table indexes
CREATE INDEX IF NOT EXISTS idx_simulations_created_by ON public.simulations USING btree (created_by);
CREATE INDEX IF NOT EXISTS idx_simulations_category ON public.simulations USING btree (category);
CREATE INDEX IF NOT EXISTS idx_simulations_published ON public.simulations USING btree (is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulations_ai_generated ON public.simulations USING btree (is_ai_generated);

-- User profiles table indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_role ON public.user_profiles USING btree (user_role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_how_heard ON public.user_profiles USING btree (how_heard_about_us);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles USING btree (email);

-- Simulation sessions table indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.simulation_sessions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_simulation_id ON public.simulation_sessions USING btree (simulation_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.simulation_sessions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.simulation_sessions USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_simulation ON public.simulation_sessions USING btree (user_id, simulation_id);

-- User activity table indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity USING btree (activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_simulation_id ON public.user_activity USING btree (simulation_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_session_id ON public.user_activity USING btree (session_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_composite ON public.user_activity USING btree (user_id, created_at DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Drop existing policies first (to avoid conflicts)
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Secrets table policies
CREATE POLICY "Service role can read secrets" ON public.secrets
  FOR SELECT
  USING (false);

CREATE POLICY "Service role can insert secrets" ON public.secrets
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Service role can update secrets" ON public.secrets
  FOR UPDATE
  USING (false);

-- Simulations table policies
CREATE POLICY "Anyone can read published simulations" ON public.simulations
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anyone can insert simulations" ON public.simulations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update simulations" ON public.simulations
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete simulations" ON public.simulations
  FOR DELETE
  USING (true);

CREATE POLICY "Creators can manage own simulations" ON public.simulations
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- User profiles table policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Public can view published creators" ON public.user_profiles
  FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Simulation sessions table policies
CREATE POLICY "Users can view own sessions" ON public.simulation_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON public.simulation_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.simulation_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- User activity table policies
CREATE POLICY "Users can view own activity" ON public.user_activity
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity" ON public.user_activity
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- COMPLETE!
-- ============================================================================

-- Verify everything was created
SELECT 'Functions created:' as status, count(*) as count FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
SELECT 'Triggers created:' as status, count(*) as count FROM information_schema.triggers WHERE trigger_schema = 'public';
SELECT 'Indexes created:' as status, count(*) as count FROM pg_indexes WHERE schemaname = 'public' AND indexname NOT LIKE '%_pkey' AND indexname NOT LIKE '%_key';
SELECT 'Policies created:' as status, count(*) as count FROM pg_policies WHERE schemaname = 'public';

