/**
 * Map Argo and Noah simulations to recruiter@gmail.com
 * 
 * Usage:
 *   node scripts/map-simulations-to-recruiter.js
 * 
 * Environment Variables Required:
 *   VITE_SUPABASE_URL or SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
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

async function mapSimulationsToRecruiter() {
  try {
    console.log('🔍 Looking for recruiter@gmail.com...');

    // Find the user by email from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('email', 'recruiter@gmail.com')
      .single();

    if (profileError || !profile) {
      console.error('❌ User with email recruiter@gmail.com not found.');
      console.error('   Please create the user first or check the email address.');
      console.error('   Error:', profileError?.message || 'No user found');
      process.exit(1);
    }

    const recruiterId = profile.id;
    const creatorName = profile.full_name || profile.email;

    console.log(`✅ Found recruiter: ${profile.email} (ID: ${recruiterId})`);

    // Update Argo simulation
    console.log('\n📝 Updating Argo simulation...');
    const { data: argoSim, error: argoError } = await supabase
      .from('task_based_simulations')
      .update({
        created_by: recruiterId,
        creator_name: creatorName,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'argo-marketing-foundations')
      .select()
      .single();

    if (argoError) {
      throw argoError;
    }

    if (argoSim) {
      console.log(`   ✅ Argo simulation mapped successfully`);
    } else {
      console.log(`   ⚠️  Argo simulation not found (slug: argo-marketing-foundations)`);
    }

    // Update Noah simulation
    console.log('\n📝 Updating Noah simulation...');
    const { data: noahSim, error: noahError } = await supabase
      .from('task_based_simulations')
      .update({
        created_by: recruiterId,
        creator_name: creatorName,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'noah-smart-fitness-watch')
      .select()
      .single();

    if (noahError) {
      throw noahError;
    }

    if (noahSim) {
      console.log(`   ✅ Noah simulation mapped successfully`);
    } else {
      console.log(`   ⚠️  Noah simulation not found (slug: noah-smart-fitness-watch)`);
    }

    // Verify the updates
    console.log('\n📊 Verification:');
    const { data: simulations, error: verifyError } = await supabase
      .from('task_based_simulations')
      .select(`
        slug,
        title,
        created_by,
        creator_name
      `)
      .in('slug', ['argo-marketing-foundations', 'noah-smart-fitness-watch']);

    if (verifyError) {
      throw verifyError;
    }

    console.log('\n📋 Mapped Simulations:');
    simulations.forEach(sim => {
      const isMapped = sim.created_by === recruiterId;
      const status = isMapped ? '✅' : '❌';
      console.log(`   ${status} ${sim.title} (${sim.slug})`);
      console.log(`      Creator: ${sim.creator_name || 'N/A'} (${sim.created_by || 'Not set'})`);
    });

    console.log('\n✅ Done! Simulations have been mapped to recruiter@gmail.com');
  } catch (error) {
    console.error('❌ Error mapping simulations:', error);
    process.exit(1);
  }
}

mapSimulationsToRecruiter();

