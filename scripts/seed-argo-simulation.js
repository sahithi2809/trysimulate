/**
 * Seed Argo Marketing Foundations Simulation
 * 
 * Usage:
 *   node scripts/seed-argo-simulation.js
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

// Import Argo simulation data
import { 
  argoCompanyInfo,
  campaignData,
  customerQuote,
  seoKeywords,
  creativeHeadlines,
  argoTaskWeights,
  argoSkillMapping
} from '../src/data/argoSimulationData.js';

/**
 * Argo Marketing Foundations Simulation
 */
const argoSimulation = {
  title: 'Marketing Foundations — Argo',
  slug: 'argo-marketing-foundations',
  description: 'Practice entry-level marketing skills across creative writing, data analysis, customer insight, SEO, and reflection. Five hands-on tasks to experience real marketing roles.',
  category: 'Marketing',
  difficulty: 'Beginner',
  estimated_duration: '50-60 min',
  
  // Company information
  company_info: argoCompanyInfo,
  
  // Task definitions
  tasks: [
    {
      id: 'task0',
      type: 'intro',
      name: 'Introduction',
      icon: '📋',
      estimated_time: '5 min',
      config: {
        headline: 'Heard of These Marketing Jobs?',
        bullets: [
          'Social Media Coordinator',
          'Brand Strategist',
          'Growth Marketing Analyst',
          'Customer Insights Associate'
        ],
        body: 'This simulation walks through five hands-on marketing tasks to show what entry-level marketing roles feel like. By the end you\'ll practice creative writing, data analysis, customer insight, SEO selection, and reflection.'
      }
    },
    {
      id: 'task1',
      type: 'mcq',
      name: 'Creative Strategist',
      icon: '✍️',
      estimated_time: '10 min',
      config: {
        instruction: 'You\'re a junior creative at an agency. The client: a new savings app targeting Gen Z. Tone: friendly, modern, reassuring. Goal: build trust + get signups.',
        prompt: 'You\'re reviewing four headline options. Based on the brief, which headline fits best?',
        options: creativeHeadlines.options,
        correctAnswer: creativeHeadlines.correct
      },
      skills_tested: ['Creative Writing', 'Brand Tone']
    },
    {
      id: 'task2',
      type: 'short-text',
      name: 'Marketing Analyst',
      icon: '📊',
      estimated_time: '10 min',
      config: {
        instruction: 'You\'re analyzing campaign results for a student-discount subscription.',
        referenceData: campaignData,
        prompt: 'Data summary above. In 1–2 sentences, what is the most important problem the team should investigate?',
        minWords: 8,
        maxWords: 50
      },
      skills_tested: ['Analytics', 'Data Insight']
    },
    {
      id: 'task3',
      type: 'short-text',
      name: 'Customer & Product Marketer',
      icon: '💬',
      estimated_time: '10 min',
      config: {
        instruction: `Customer quote: "${customerQuote.text}"`,
        prompt: 'What does this customer value most?',
        minWords: 5,
        maxWords: 30
      },
      skills_tested: ['Customer Insight', 'Product Recommendation']
    },
    {
      id: 'task4',
      type: 'mcq',
      name: 'Digital Marketer (SEO)',
      icon: '🔍',
      estimated_time: '10 min',
      config: {
        instruction: 'Goal: attract parents who want to teach teens money skills. Choose the best keyword.',
        prompt: 'Which keyword would be most effective for this goal?',
        options: seoKeywords.options,
        correctAnswer: seoKeywords.correct
      },
      skills_tested: ['SEO', 'Keyword Selection']
    },
    {
      id: 'task5',
      type: 'reflection',
      name: 'Reflection',
      icon: '🤔',
      estimated_time: '10 min',
      config: {
        instruction: 'Which marketing role did you like most and why?',
        prompt: 'In 3–4 sentences, which marketing role did you like most and why?',
        minWords: 20
      },
      skills_tested: ['Reflection']
    }
  ],
  
  // Skills tested across all tasks
  skills_tested: [
    'Creative Writing',
    'Brand Tone',
    'Analytics',
    'Data Insight',
    'Customer Insight',
    'Product Recommendation',
    'SEO',
    'Keyword Selection',
    'Reflection'
  ],
  
  // Learning objectives
  learning_objectives: [
    'Creative writing and brand tone alignment',
    'Data analysis and campaign insights',
    'Customer insight extraction',
    'SEO keyword selection',
    'Self-reflection on marketing career interests'
  ],
  
  // Skill mapping
  skill_mapping: argoSkillMapping,
  
  // Task data
  task_data: {
    campaignData,
    customerQuote,
    seoKeywords,
    creativeHeadlines
  },
  
  // Validation rules
  validation_rules: {
    task1: {
      method: 'rule-based',
      validator: 'validateArgoTask1'
    },
    task2: {
      method: 'rule-based',
      validator: 'validateArgoTask2'
    },
    task3: {
      method: 'rule-based',
      validator: 'validateArgoTask3'
    },
    task4: {
      method: 'rule-based',
      validator: 'validateArgoTask4'
    },
    task5: {
      method: 'rule-based',
      validator: 'validateArgoTask5'
    }
  },
  
  // Metadata (includes task weights for final score calculation)
  metadata: {
    version: '1.0',
    created_via: 'seed-script',
    last_updated: new Date().toISOString(),
    task_weights: argoTaskWeights
  },
  
  is_published: true,
  is_active: true
};

async function seedSimulations() {
  try {
    console.log('🌱 Seeding Argo Marketing Foundations simulation...');
    console.log(`   Supabase URL: ${SUPABASE_URL}`);
    
    // Check if simulation already exists
    const { data: existing } = await supabase
      .from('task_based_simulations')
      .select('id, title, slug')
      .eq('slug', argoSimulation.slug)
      .maybeSingle();

    if (existing) {
      console.log(`⚠️  Simulation "${argoSimulation.title}" already exists`);
      console.log(`   ID: ${existing.id}`);
      console.log('   Updating...');
      
      const { data, error } = await supabase
        .from('task_based_simulations')
        .update({
          ...argoSimulation,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating simulation:', error);
        throw error;
      }

      console.log('✅ Successfully updated simulation:', data.title);
      console.log('   Slug:', data.slug);
      console.log('   ID:', data.id);
    } else {
      // Insert new simulation
      const { data, error } = await supabase
        .from('task_based_simulations')
        .insert(argoSimulation)
        .select()
        .single();

      if (error) {
        console.error('❌ Error seeding simulation:', error);
        throw error;
      }

      console.log('✅ Successfully seeded simulation:', data.title);
      console.log('   Slug:', data.slug);
      console.log('   ID:', data.id);
      console.log(`   Tasks: ${data.tasks?.length || 0}`);
      console.log(`   Skills: ${data.skills_tested?.length || 0}`);
    }
    
    console.log('\n✨ Seeding complete!');
    
  } catch (error) {
    console.error('❌ Failed to seed simulations:', error);
    console.error('   Error details:', error.message);
    process.exit(1);
  }
}

// Run seed
seedSimulations();

