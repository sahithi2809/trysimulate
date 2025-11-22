/**
 * Script to check dev user's progress and fix it
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.development.local') });
dotenv.config({ path: join(__dirname, '../.env.local') });
dotenv.config({ path: join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkDevUserProgress() {
  try {
    console.log('🔍 Checking dev user progress...\n');

    // Find dev user
    const { data: devUser, error: devError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('email', 'dev@gmail.com')
      .single();

    if (devError || !devUser) {
      console.error('❌ Dev user not found:', devError?.message);
      process.exit(1);
    }

    console.log(`✅ Found dev user: ${devUser.email} (ID: ${devUser.id})\n`);

    // Get ALL progress records for dev user (not just completed)
    const { data: allProgress, error: progressError } = await supabase
      .from('task_based_progress')
      .select('*, task_based_simulations!inner(id, title, slug, tasks)')
      .eq('user_id', devUser.id)
      .order('created_at', { ascending: false });

    if (progressError) {
      console.error('❌ Error fetching progress:', progressError);
      process.exit(1);
    }

    console.log(`📊 Found ${allProgress?.length || 0} progress records for dev user\n`);

    if (!allProgress || allProgress.length === 0) {
      console.log('⚠️  No progress records found. The user may not have started any simulations.');
      return;
    }

    // Check each progress record
    for (const progress of allProgress) {
      const sim = progress.task_based_simulations;
      console.log(`\n📦 Simulation: ${sim.title} (${sim.slug})`);
      console.log(`   Progress ID: ${progress.id}`);
      console.log(`   Started: ${progress.started_at}`);
      console.log(`   Completed: ${progress.completed_at || '❌ NOT COMPLETED'}`);
      console.log(`   Progress: ${progress.progress_percentage || 0}%`);
      console.log(`   Completed Tasks: ${progress.completed_tasks?.length || 0} / ${sim.tasks?.length || 0}`);
      console.log(`   Final Score: ${progress.final_score || 'N/A'}`);

      // Check if should be completed
      const totalTasks = sim.tasks?.length || 0;
      const completedTasks = progress.completed_tasks?.length || 0;
      const isFullyComplete = completedTasks >= totalTasks && progress.progress_percentage >= 99.9;

      if (isFullyComplete && !progress.completed_at) {
        console.log(`   ⚠️  SHOULD BE COMPLETED but completed_at is NULL!`);
        
        // Get submissions to calculate score
        const { data: submissions } = await supabase
          .from('task_submissions')
          .select('score')
          .eq('user_id', devUser.id)
          .eq('simulation_id', progress.simulation_id)
          .not('score', 'is', null);

        let finalScore = progress.final_score;
        if (!finalScore && submissions && submissions.length > 0) {
          const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
          finalScore = Math.round(totalScore / submissions.length);
        } else if (!finalScore) {
          finalScore = Math.round(progress.progress_percentage);
        }

        // Fix it
        console.log(`   🔧 Fixing... Setting completed_at and final_score: ${finalScore}%`);
        const { error: updateError } = await supabase
          .from('task_based_progress')
          .update({
            completed_at: progress.last_updated_at || new Date().toISOString(),
            final_score: finalScore,
            last_updated_at: new Date().toISOString()
          })
          .eq('id', progress.id);

        if (updateError) {
          console.error(`   ❌ Error updating: ${updateError.message}`);
        } else {
          console.log(`   ✅ Fixed!`);
        }
      } else if (!isFullyComplete) {
        console.log(`   ℹ️  Not fully complete yet (${completedTasks}/${totalTasks} tasks)`);
      } else {
        console.log(`   ✅ Already completed`);
      }
    }

    // Now check if recruiter can see it
    console.log('\n\n🔐 Testing recruiter visibility...\n');

    const { data: recruiter } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', 'recruiter@gmail.com')
      .single();

    if (recruiter) {
      for (const progress of allProgress) {
        if (progress.completed_at) {
          // Check if recruiter can see this
          const { data: recruiterView, error: rlsError } = await supabase
            .from('task_based_progress')
            .select('*')
            .eq('id', progress.id)
            .single();

          // Use service role to check what recruiter should see
          const { data: sim } = await supabase
            .from('task_based_simulations')
            .select('id, created_by, title')
            .eq('id', progress.simulation_id)
            .single();

          if (sim) {
            const isOwned = sim.created_by === recruiter.id || sim.created_by === null;
            console.log(`📊 Progress for ${sim.title}:`);
            console.log(`   Simulation owned by: ${sim.created_by || 'NULL'} (recruiter: ${recruiter.id})`);
            console.log(`   Ownership match: ${isOwned ? '✅' : '❌'}`);
            console.log(`   Completed: ${progress.completed_at ? '✅' : '❌'}`);
            console.log(`   Should be visible: ${isOwned && progress.completed_at ? '✅ YES' : '❌ NO'}`);
          }
        }
      }
    }

    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDevUserProgress();


