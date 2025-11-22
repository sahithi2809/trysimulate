-- Add RLS policies for recruiters to view submissions and progress for their simulations
-- This allows recruiters to see only COMPLETED participant data for simulations they created

-- Drop policies if they exist (to allow re-running this migration)
DROP POLICY IF EXISTS "Recruiters can view completed submissions for their simulations" ON task_submissions;
DROP POLICY IF EXISTS "Recruiters can view completed progress for their simulations" ON task_based_progress;
DROP POLICY IF EXISTS "Recruiters can view participant profiles" ON user_profiles;

-- Policy: Recruiters can view only completed submissions for their simulations
-- Also allows access if created_by is NULL (for backward compatibility)
CREATE POLICY "Recruiters can view completed submissions for their simulations" ON task_submissions
  FOR SELECT
  USING (
    (
      EXISTS (
        SELECT 1 FROM task_based_simulations
        WHERE task_based_simulations.id = task_submissions.simulation_id
        AND (
          task_based_simulations.created_by = auth.uid()
          OR task_based_simulations.created_by IS NULL
        )
      )
      -- Only show submissions that are part of completed progress
      AND EXISTS (
        SELECT 1 FROM task_based_progress
        WHERE task_based_progress.user_id = task_submissions.user_id
        AND task_based_progress.simulation_id = task_submissions.simulation_id
        AND task_based_progress.completed_at IS NOT NULL
      )
    )
    -- Also allow users to see their own submissions (for backward compatibility)
    OR auth.uid() = task_submissions.user_id
  );

-- Policy: Recruiters can view only completed progress for their simulations
-- Also allows access if created_by is NULL (for backward compatibility with unmapped simulations)
CREATE POLICY "Recruiters can view completed progress for their simulations" ON task_based_progress
  FOR SELECT
  USING (
    (
      EXISTS (
        SELECT 1 FROM task_based_simulations
        WHERE task_based_simulations.id = task_based_progress.simulation_id
        AND (
          task_based_simulations.created_by = auth.uid()
          OR task_based_simulations.created_by IS NULL
        )
      )
      -- Only show completed progress
      AND completed_at IS NOT NULL
    )
    -- Also allow users to see their own progress (for backward compatibility)
    OR auth.uid() = task_based_progress.user_id
  );

-- Policy: Recruiters can view user profiles of participants in their simulations
-- This allows recruiters to see basic profile info (name, email) of candidates
-- Note: This policy only shows profiles for users who have completed simulations created by the recruiter
-- Also allows access if created_by is NULL (for backward compatibility)
CREATE POLICY "Recruiters can view participant profiles" ON user_profiles
  FOR SELECT
  USING (
    (
      EXISTS (
        SELECT 1 FROM task_based_progress
        JOIN task_based_simulations ON task_based_simulations.id = task_based_progress.simulation_id
        WHERE task_based_progress.user_id = user_profiles.id
        AND task_based_progress.completed_at IS NOT NULL
        AND (
          task_based_simulations.created_by = auth.uid()
          OR task_based_simulations.created_by IS NULL
        )
      )
    )
    -- Also allow users to see their own profile (for backward compatibility)
    OR auth.uid() = user_profiles.id
  );

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_task_sims_created_by ON task_based_simulations(created_by);

