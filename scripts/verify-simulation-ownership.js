/**
 * Verification script to check simulation ownership and participant visibility
 * Run with: node ./scripts/verify-simulation-ownership.js
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

async function verifySimulationOwnership() {
  try {
    console.log('🔍 Verifying simulation ownership and participant visibility...\n');

    // Find recruiter
    const { data: recruiter, error: recruiterError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, user_role')
      .eq('email', 'recruiter@gmail.com')
      .single();

    if (recruiterError || !recruiter) {
      console.error('❌ Recruiter not found:', recruiterError?.message);
      process.exit(1);
    }

    console.log(`✅ Found recruiter: ${recruiter.email} (ID: ${recruiter.id})`);
    console.log(`   Role: ${recruiter.user_role}\n`);

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

    // Get all simulations
    const { data: simulations, error: simsError } = await supabase
      .from('task_based_simulations')
      .select('id, title, slug, created_by, creator_name')
      .in('slug', ['argo-marketing-foundations', 'noah-smart-fitness-watch']);

    if (simsError) {
      console.error('❌ Error fetching simulations:', simsError);
      process.exit(1);
    }

    console.log(`📋 Found ${simulations.length} simulations:\n`);

    for (const sim of simulations) {
      console.log(`\n📦 Simulation: ${sim.title} (${sim.slug})`);
      console.log(`   ID: ${sim.id}`);
      console.log(`   Created by: ${sim.created_by || 'NULL'} (${sim.creator_name || 'N/A'})`);
      
      const isOwned = sim.created_by === recruiter.id || sim.created_by === null;
      console.log(`   Ownership: ${isOwned ? '✅ Owned by recruiter' : '❌ NOT owned by recruiter'}`);

      // Check dev user's progress
      const { data: progress, error: progressError } = await supabase
        .from('task_based_progress')
        .select('*')
        .eq('simulation_id', sim.id)
        .eq('user_id', devUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error(`   ❌ Error checking progress: ${progressError.message}`);
      } else if (!progress) {
        console.log(`   ⚠️  No progress found for dev user`);
      } else {
        console.log(`   📊 Dev user progress:`);
        console.log(`      Started: ${progress.started_at}`);
        console.log(`      Completed: ${progress.completed_at || 'NOT COMPLETED'}`);
        console.log(`      Final Score: ${progress.final_score || 'N/A'}`);
        console.log(`      Progress: ${progress.progress_percentage || 0}%`);
        console.log(`      Completed Tasks: ${progress.completed_tasks?.length || 0}`);

        if (!progress.completed_at) {
          console.log(`   ⚠️  WARNING: Progress exists but completed_at is NULL!`);
        }
      }

      // Check all completed participants
      const { data: allCompleted, error: allError } = await supabase
        .from('task_based_progress')
        .select('user_id, completed_at, final_score')
        .eq('simulation_id', sim.id)
        .not('completed_at', 'is', null);

      if (allError) {
        console.error(`   ❌ Error checking all completed: ${allError.message}`);
      } else {
        console.log(`   📈 Total completed participants: ${allCompleted?.length || 0}`);
        if (allCompleted && allCompleted.length > 0) {
          console.log(`   👥 User IDs with completed progress:`);
          allCompleted.forEach(p => {
            console.log(`      - ${p.user_id} (Score: ${p.final_score || 'N/A'}, Completed: ${p.completed_at})`);
          });
        }
      }
    }

    // Test RLS from recruiter's perspective
    console.log('\n\n🔐 Testing RLS policies...\n');
    
    // Create a client as the recruiter
    const { data: { session } } = await supabase.auth.signInWithPassword({
      email: 'recruiter@gmail.com',
      password: 'test123' // This might fail, but we'll try
    }).catch(() => ({ data: { session: null } }));

    if (!session) {
      console.log('⚠️  Could not sign in as recruiter to test RLS. Using service role instead.');
      console.log('   (This is expected if password is not set)');
    } else {
      console.log('✅ Signed in as recruiter for RLS test');
      
      const recruiterClient = createClient(SUPABASE_URL, session.access_token, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      for (const sim of simulations) {
        const { data: rlsProgress, error: rlsError } = await recruiterClient
          .from('task_based_progress')
          .select('*')
          .eq('simulation_id', sim.id)
          .not('completed_at', 'is', null);

        if (rlsError) {
          console.log(`\n❌ RLS blocked access to ${sim.title}: ${rlsError.message}`);
        } else {
          console.log(`\n✅ RLS allowed access to ${sim.title}: ${rlsProgress?.length || 0} records`);
        }
      }
    }

    console.log('\n\n✅ Verification complete!');
    console.log('\n💡 Recommendations:');
    console.log('   1. Ensure simulations have created_by set to recruiter ID');
    console.log('   2. Verify completed_at is set when users finish simulations');
    console.log('   3. Check RLS policies allow recruiters to see completed progress');
    console.log('   4. Run: npm run map:simulations to map simulations to recruiter');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  }
}

verifySimulationOwnership();


