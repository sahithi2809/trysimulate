/**
 * Seed Persona Finding Simulation
 * "Finding the Ideal Persona for a Day-1 Product"
 * 
 * Usage:
 *   node scripts/seed-persona-simulation.js
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

// Import persona simulation data
import { 
  personaCompanyInfo,
  personaSimulationConfig,
  loop1Decisions,
  loop2Decisions,
  loop3Decisions,
  loop4Decisions,
  endings,
  personaSkillMapping,
  personaTaskWeights
} from '../src/data/personaSimulationData.js';

/**
 * Persona Finding Simulation
 */
const personaSimulation = {
  title: 'Finding the Ideal Persona for a Day-1 Product',
  slug: 'persona-finding',
  description: 'A 7-day marketing simulation where you play a Marketing Associate tasked with finding the ideal customer persona for a new 2-in-1 skincare product. Make strategic decisions with a limited budget, navigate team disagreements, and deliver results under pressure.',
  category: 'Marketing',
  difficulty: 'Intermediate',
  estimated_duration: '45-60 min',
  
  // Company information
  company_info: personaCompanyInfo,
  
  // Task definitions (4 loops)
  tasks: [
    {
      id: 'task0',
      type: 'intro',
      name: 'Introduction',
      icon: '📋',
      estimated_time: '5 min',
      config: {
        headline: 'Finding the Ideal Persona for a Day-1 Product',
        bullets: [
          'Product: 2-in-1 Moisturizer + SPF 30',
          'Your Role: Marketing Associate',
          'Horizon: 7 days',
          'Total Budget: ₹15,000',
          'Pressure: CEO wants initial persona signals for investor pitch'
        ],
        body: 'You\'re a Marketing Associate at a startup. The CEO gives you a vague brief: "People are busy. They don\'t want separate sunscreen + moisturizer. We don\'t know who exactly this product is for. I want initial signals by Friday. Just do something quick." You have ₹15,000 for the entire mission. Navigate through 4 decision loops to find the ideal persona.'
      }
    },
    {
      id: 'task1',
      type: 'decision-loop',
      name: 'Loop 1 — Divergence',
      icon: '🟦',
      estimated_time: '15 min',
      config: {
        loopNumber: 1,
        context: loop1Decisions.context,
        options: loop1Decisions.options,
        feedback: loop1Decisions.feedback
      },
      skills_tested: ['Market Research', 'Exploratory Analysis']
    },
    {
      id: 'task2',
      type: 'decision-loop',
      name: 'Loop 2 — Convergence',
      icon: '🟩',
      estimated_time: '15 min',
      config: {
        loopNumber: 2,
        context: loop2Decisions.context,
        options: loop2Decisions.options,
        feedback: loop2Decisions.feedback
      },
      skills_tested: ['Strategic Thinking', 'Data Analysis']
    },
    {
      id: 'task3',
      type: 'decision-loop',
      name: 'Loop 3 — Persona Decision',
      icon: '🟨',
      estimated_time: '10 min',
      config: {
        loopNumber: 3,
        context: loop3Decisions.context,
        options: loop3Decisions.options,
        feedback: loop3Decisions.feedback
      },
      skills_tested: ['Decision Making', 'Stakeholder Management']
    },
    {
      id: 'task4',
      type: 'decision-loop',
      name: 'Loop 4 — Final Validation',
      icon: '🟥',
      estimated_time: '10 min',
      config: {
        loopNumber: 4,
        context: loop4Decisions.context,
        options: loop4Decisions.options,
        feedback: loop4Decisions.feedback
      },
      skills_tested: ['Validation', 'Experiment Design']
    }
  ],
  
  // Skills tested across all tasks
  skills_tested: [
    'Market Research',
    'Exploratory Analysis',
    'Strategic Thinking',
    'Data Analysis',
    'Decision Making',
    'Stakeholder Management',
    'Validation',
    'Experiment Design'
  ],
  
  // Learning objectives
  learning_objectives: [
    'Navigate ambiguous briefs and conflicting stakeholder signals',
    'Make strategic research decisions with limited budget',
    'Synthesize data from multiple sources to form hypotheses',
    'Make decisive persona choices under pressure',
    'Validate persona hypotheses with targeted experiments'
  ],
  
  // Skill mapping
  skill_mapping: personaSkillMapping,
  
  // Task data
  task_data: {
    simulationConfig: personaSimulationConfig,
    endings
  },
  
  // Validation rules (simplified - choices tracked but not strictly validated)
  validation_rules: {
    task1: {
      method: 'rule-based',
      validator: 'validatePersonaTask1'
    },
    task2: {
      method: 'rule-based',
      validator: 'validatePersonaTask2'
    },
    task3: {
      method: 'rule-based',
      validator: 'validatePersonaTask3'
    },
    task4: {
      method: 'rule-based',
      validator: 'validatePersonaTask4'
    }
  },
  
  // Metadata
  metadata: {
    version: '1.0',
    created_via: 'seed-script',
    last_updated: new Date().toISOString(),
    task_weights: personaTaskWeights
  },
  
  is_published: true,
  is_active: true
};

/**
 * Main seeding function
 */
async function seedSimulations() {
  try {
    console.log('🌱 Seeding Persona Finding simulation...\n');

    // Upsert simulation
    const { data, error } = await supabase
      .from('task_based_simulations')
      .upsert(personaSimulation, {
        onConflict: 'slug',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error seeding simulation:', error);
      throw error;
    }

    console.log('✅ Successfully seeded Persona Finding simulation!');
    console.log(`   ID: ${data.id}`);
    console.log(`   Title: ${data.title}`);
    console.log(`   Slug: ${data.slug}`);
    console.log(`   Category: ${data.category}`);
    console.log(`   Tasks: ${data.tasks?.length || 0}`);
    console.log(`   Skills: ${data.skills_tested?.length || 0}`);
    console.log('\n🎉 Done!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run seeding
seedSimulations();

