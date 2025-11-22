-- Map Argo and Noah simulations to recruiter@gmail.com
-- This script updates the created_by field for both simulations

-- First, find the user ID for recruiter@gmail.com
DO $$
DECLARE
  recruiter_user_id UUID;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO recruiter_user_id
  FROM auth.users
  WHERE email = 'recruiter@gmail.com'
  LIMIT 1;

  IF recruiter_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email recruiter@gmail.com not found. Please create the user first.';
  END IF;

  -- Update Argo simulation
  UPDATE task_based_simulations
  SET 
    created_by = recruiter_user_id,
    creator_name = (SELECT full_name FROM user_profiles WHERE id = recruiter_user_id LIMIT 1),
    updated_at = NOW()
  WHERE slug = 'argo-marketing-foundations';

  -- Update Noah simulation
  UPDATE task_based_simulations
  SET 
    created_by = recruiter_user_id,
    creator_name = (SELECT full_name FROM user_profiles WHERE id = recruiter_user_id LIMIT 1),
    updated_at = NOW()
  WHERE slug = 'noah-smart-fitness-watch';

  -- Verify the updates
  RAISE NOTICE 'Successfully mapped simulations to recruiter (ID: %)', recruiter_user_id;
  RAISE NOTICE 'Argo simulation updated: %', (SELECT COUNT(*) FROM task_based_simulations WHERE slug = 'argo-marketing-foundations' AND created_by = recruiter_user_id);
  RAISE NOTICE 'Noah simulation updated: %', (SELECT COUNT(*) FROM task_based_simulations WHERE slug = 'noah-smart-fitness-watch' AND created_by = recruiter_user_id);
END $$;

-- Verify the results
SELECT 
  s.slug,
  s.title,
  s.created_by,
  up.email as creator_email,
  up.full_name as creator_name
FROM task_based_simulations s
LEFT JOIN user_profiles up ON s.created_by = up.id
WHERE s.slug IN ('argo-marketing-foundations', 'noah-smart-fitness-watch')
ORDER BY s.slug;


