/**
 * Script to create progress records from existing submissions
 * This helps when users completed simulations but progress records are missing
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

async function createProgressFromSubmissions() {
  try {
    console.log('🔍 Creating progress records from submissions...\n');

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

    // Get all submissions for dev user
    const { data: allSubmissions, error: subsError } = await supabase
      .from('task_submissions')
      .select('*, task_based_simulations!inner(id, title, slug, tasks)')
      .eq('user_id', devUser.id)
      .order('simulation_id')
      .order('submitted_at');

    if (subsError) {
      console.error('❌ Error fetching submissions:', subsError);
      process.exit(1);
    }

    console.log(`📊 Found ${allSubmissions?.length || 0} submissions\n`);

    if (!allSubmissions || allSubmissions.length === 0) {
      console.log('⚠️  No submissions found. User needs to complete a simulation while logged in.');
      return;
    }

    // Group submissions by simulation
    const submissionsBySim = {};
    for (const sub of allSubmissions) {
      const simId = sub.simulation_id;
      if (!submissionsBySim[simId]) {
        submissionsBySim[simId] = {
          simulation: sub.task_based_simulations,
          submissions: []
        };
      }
      submissionsBySim[simId].submissions.push(sub);
    }

    // Process each simulation
    for (const [simId, data] of Object.entries(submissionsBySim)) {
      const { simulation, submissions } = data;
      console.log(`\n📦 Processing: ${simulation.title} (${simulation.slug})`);
      console.log(`   Submissions: ${submissions.length}`);

      // Check if progress already exists
      const { data: existingProgress } = await supabase
        .from('task_based_progress')
        .select('*')
        .eq('user_id', devUser.id)
        .eq('simulation_id', simId)
        .single();

      if (existingProgress) {
        console.log(`   ✅ Progress record already exists (ID: ${existingProgress.id})`);
        
        // Check if it should be marked as completed
        const totalTasks = simulation.tasks?.length || 0;
        const completedTasks = existingProgress.completed_tasks?.length || 0;
        const submissionTaskIds = [...new Set(submissions.map(s => s.task_id))];
        
        if (submissionTaskIds.length >= totalTasks && !existingProgress.completed_at) {
          console.log(`   🔧 Marking as completed...`);
          
          // Calculate final score
          const scores = submissions.filter(s => s.score !== null).map(s => s.score);
          const finalScore = scores.length > 0
            ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
            : Math.round(existingProgress.progress_percentage);

          const { error: updateError } = await supabase
            .from('task_based_progress')
            .update({
              completed_at: submissions[submissions.length - 1].submitted_at || new Date().toISOString(),
              final_score: finalScore,
              progress_percentage: 100,
              completed_tasks: submissionTaskIds,
              last_updated_at: new Date().toISOString()
            })
            .eq('id', existingProgress.id);

          if (updateError) {
            console.error(`   ❌ Error updating: ${updateError.message}`);
          } else {
            console.log(`   ✅ Updated! Final score: ${finalScore}%`);
          }
        }
        continue;
      }

      // Create new progress record
      console.log(`   🔧 Creating new progress record...`);

      // Get unique task IDs from submissions
      const taskIds = [...new Set(submissions.map(s => s.task_id))];
      const totalTasks = simulation.tasks?.length || 0;
      const progressPercentage = totalTasks > 0
        ? Math.round((taskIds.length / totalTasks) * 100)
        : 100;

      // Calculate final score
      const scores = submissions.filter(s => s.score !== null).map(s => s.score);
      const finalScore = scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : progressPercentage;

      // Get earliest submission time
      const earliestSubmission = submissions.reduce((earliest, sub) => {
        return !earliest || new Date(sub.submitted_at) < new Date(earliest.submitted_at)
          ? sub
          : earliest;
      }, null);

      // Get latest submission time
      const latestSubmission = submissions.reduce((latest, sub) => {
        return !latest || new Date(sub.submitted_at) > new Date(latest.submitted_at)
          ? sub
          : latest;
      }, null);

      // Check if all tasks are completed
      const isCompleted = taskIds.length >= totalTasks;

      // Get or create session
      let sessionId = submissions[0]?.session_id;
      if (!sessionId) {
        // Create a session
        const { data: session, error: sessionError } = await supabase
          .from('simulation_sessions')
          .insert({
            user_id: devUser.id,
            simulation_id: simId,
            status: isCompleted ? 'completed' : 'in_progress',
            progress_percentage: progressPercentage,
            final_score: isCompleted ? finalScore : null,
            started_at: earliestSubmission?.submitted_at || new Date().toISOString(),
            completed_at: isCompleted ? latestSubmission?.submitted_at : null
          })
          .select()
          .single();

        if (sessionError) {
          console.error(`   ❌ Error creating session: ${sessionError.message}`);
          continue;
        }
        sessionId = session.id;
        console.log(`   ✅ Created session: ${sessionId}`);
      }

      // Create progress record
      const { data: newProgress, error: progressError } = await supabase
        .from('task_based_progress')
        .insert({
          user_id: devUser.id,
          simulation_id: simId,
          session_id: sessionId,
          current_task: isCompleted ? totalTasks - 1 : taskIds.length - 1,
          completed_tasks: taskIds,
          progress_percentage: progressPercentage,
          final_score: isCompleted ? finalScore : null,
          started_at: earliestSubmission?.submitted_at || new Date().toISOString(),
          completed_at: isCompleted ? latestSubmission?.submitted_at : null,
          last_updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (progressError) {
        console.error(`   ❌ Error creating progress: ${progressError.message}`);
      } else {
        console.log(`   ✅ Created progress record!`);
        console.log(`      Progress: ${progressPercentage}%`);
        console.log(`      Tasks: ${taskIds.length}/${totalTasks}`);
        console.log(`      Final Score: ${isCompleted ? finalScore + '%' : 'N/A'}`);
        console.log(`      Completed: ${isCompleted ? '✅' : '❌'}`);
      }
    }

    console.log('\n✅ Done!');
    console.log('\n💡 Now run: npm run verify:ownership to check if recruiter can see it');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createProgressFromSubmissions();


