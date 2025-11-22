/**
 * Script to fix progress records that should be marked as completed
 * This ensures completed_at is set when all tasks are done
 * Run with: node ./scripts/fix-completed-progress.js
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
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL or SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixCompletedProgress() {
  try {
    console.log('🔧 Fixing completed progress records...\n');

    // Get all progress records where completed_at is NULL but progress is 100%
    const { data: incompleteProgress, error: fetchError } = await supabase
      .from('task_based_progress')
      .select('*, task_based_simulations!inner(id, tasks)')
      .is('completed_at', null)
      .gte('progress_percentage', 99.9); // 100% or very close

    if (fetchError) {
      console.error('❌ Error fetching progress:', fetchError);
      process.exit(1);
    }

    console.log(`📊 Found ${incompleteProgress?.length || 0} progress records that might need completion\n`);

    if (!incompleteProgress || incompleteProgress.length === 0) {
      console.log('✅ No records need fixing!');
      return;
    }

    let fixedCount = 0;
    let skippedCount = 0;

    for (const progress of incompleteProgress) {
      const simulation = progress.task_based_simulations;
      const totalTasks = simulation?.tasks?.length || 0;
      const completedTasks = progress.completed_tasks?.length || 0;

      // Check if all tasks are completed
      if (totalTasks > 0 && completedTasks >= totalTasks && progress.progress_percentage >= 99.9) {
        console.log(`🔧 Fixing progress for user ${progress.user_id} (simulation: ${progress.simulation_id})`);
        console.log(`   Progress: ${progress.progress_percentage}%, Tasks: ${completedTasks}/${totalTasks}`);

        // Calculate final score if not set
        let finalScore = progress.final_score;
        if (!finalScore) {
          // Get all submissions and calculate average
          const { data: submissions } = await supabase
            .from('task_submissions')
            .select('score')
            .eq('user_id', progress.user_id)
            .eq('simulation_id', progress.simulation_id)
            .not('score', 'is', null);

          if (submissions && submissions.length > 0) {
            const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
            finalScore = Math.round(totalScore / submissions.length);
          } else {
            finalScore = Math.round(progress.progress_percentage); // Fallback
          }
        }

        // Update progress with completed_at
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
          skippedCount++;
        } else {
          console.log(`   ✅ Fixed! Set completed_at and final_score: ${finalScore}%`);
          fixedCount++;
        }
      } else {
        console.log(`   ⏭️  Skipping (not fully complete: ${completedTasks}/${totalTasks} tasks)`);
        skippedCount++;
      }
    }

    console.log(`\n✅ Done! Fixed ${fixedCount} records, skipped ${skippedCount} records`);
  } catch (error) {
    console.error('❌ Error fixing progress:', error);
    process.exit(1);
  }
}

fixCompletedProgress();


