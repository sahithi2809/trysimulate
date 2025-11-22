/**
 * Script to check if anyone has completed Argo or Noah simulations
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

async function checkCompletedSimulations() {
  try {
    console.log('🔍 Checking for completed Argo and Noah simulations...\n');

    // Get simulation IDs
    const { data: simulations, error: simsError } = await supabase
      .from('task_based_simulations')
      .select('id, title, slug')
      .in('slug', ['argo-marketing-foundations', 'noah-smart-fitness-watch']);

    if (simsError) {
      console.error('❌ Error fetching simulations:', simsError);
      process.exit(1);
    }

    console.log(`📋 Found ${simulations.length} simulations:\n`);
    simulations.forEach(sim => {
      console.log(`   - ${sim.title} (${sim.slug})`);
      console.log(`     ID: ${sim.id}\n`);
    });

    // Check progress for each simulation
    for (const sim of simulations) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 ${sim.title} (${sim.slug})`);
      console.log('='.repeat(60));

      // Get ALL progress (completed and in-progress)
      const { data: allProgress, error: progressError } = await supabase
        .from('task_based_progress')
        .select('*')
        .eq('simulation_id', sim.id)
        .order('created_at', { ascending: false });

      if (progressError) {
        console.error(`   ❌ Error fetching progress: ${progressError.message}`);
        continue;
      }

      // Get user profiles separately
      let profilesMap = new Map();
      if (allProgress && allProgress.length > 0) {
        const userIds = [...new Set(allProgress.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        if (profiles) {
          profilesMap = new Map(profiles.map(p => [p.id, p]));
        }

        // Attach profiles to progress
        allProgress.forEach(progress => {
          progress.user_profiles = profilesMap.get(progress.user_id) || {
            id: progress.user_id,
            email: 'Unknown',
            full_name: 'Unknown User'
          };
        });
      }

      console.log(`\n📊 Total progress records: ${allProgress?.length || 0}`);

      if (!allProgress || allProgress.length === 0) {
        console.log(`   ⚠️  No one has started this simulation yet`);
        continue;
      }

      // Separate completed and in-progress
      const completed = allProgress.filter(p => p.completed_at !== null);
      const inProgress = allProgress.filter(p => p.completed_at === null);

      console.log(`\n✅ Completed: ${completed.length}`);
      console.log(`⏳ In Progress: ${inProgress.length}`);

      // Show completed users
      if (completed.length > 0) {
        console.log(`\n   🎉 Completed by:`);
        completed.forEach((progress, idx) => {
          const profile = progress.user_profiles;
          console.log(`\n   ${idx + 1}. ${profile.email} (${profile.full_name || 'No name'})`);
          console.log(`      Progress ID: ${progress.id}`);
          console.log(`      Started: ${new Date(progress.started_at).toLocaleString()}`);
          console.log(`      Completed: ${new Date(progress.completed_at).toLocaleString()}`);
          console.log(`      Final Score: ${progress.final_score || 'N/A'}%`);
          console.log(`      Progress: ${progress.progress_percentage || 0}%`);
          console.log(`      Tasks Completed: ${progress.completed_tasks?.length || 0}`);
        });
      } else {
        console.log(`\n   ⚠️  No one has completed this simulation yet`);
      }

      // Show in-progress users
      if (inProgress.length > 0) {
        console.log(`\n   ⏳ In Progress:`);
        inProgress.forEach((progress, idx) => {
          const profile = progress.user_profiles;
          console.log(`\n   ${idx + 1}. ${profile.email} (${profile.full_name || 'No name'})`);
          console.log(`      Progress ID: ${progress.id}`);
          console.log(`      Started: ${new Date(progress.started_at).toLocaleString()}`);
          console.log(`      Progress: ${progress.progress_percentage || 0}%`);
          console.log(`      Tasks Completed: ${progress.completed_tasks?.length || 0}`);
        });
      }

      // Check submissions
      const { data: submissions, error: subsError } = await supabase
        .from('task_submissions')
        .select('user_id, task_id, submitted_at, score')
        .eq('simulation_id', sim.id)
        .order('submitted_at', { ascending: false });

      if (!subsError && submissions) {
        const uniqueUsers = [...new Set(submissions.map(s => s.user_id))];
        console.log(`\n   📝 Submissions: ${submissions.length} total from ${uniqueUsers.length} users`);
      }
    }

    // Summary
    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));

    for (const sim of simulations) {
      const { data: completed } = await supabase
        .from('task_based_progress')
        .select('id')
        .eq('simulation_id', sim.id)
        .not('completed_at', 'is', null);

      const count = completed?.length || 0;
      const status = count > 0 ? '✅' : '❌';
      console.log(`   ${status} ${sim.title}: ${count} completion(s)`);
    }

    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCompletedSimulations();

