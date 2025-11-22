/**
 * Seed Task-Based Simulations
 * Adds the Noah simulation to the database
 * 
 * Usage:
 *   node scripts/seed-task-based-simulations.js
 * 
 * Environment Variables Required:
 *   VITE_SUPABASE_URL or SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

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

// Import simulation data
import { 
  companyInfo, 
  personas, 
  competitors, 
  industryStats, 
  roleOptions, 
  techStackOptions, 
  analyticsData 
} from '../src/data/demoSimulationData.js';

/**
 * Noah Smart Fitness Watch Simulation
 */
const noahSimulation = {
  title: 'Noah Smart Fitness Watch - Product Management',
  slug: 'noah-smart-fitness-watch',
  description: 'End-to-end product management simulation: from market research to post-launch analytics. Practice real PM skills with 7 comprehensive tasks covering the entire product lifecycle.',
  category: 'Product Management',
  difficulty: 'Intermediate',
  estimated_duration: '6-8 hours',
  
  // Company information
  company_info: companyInfo,
  
  // Task definitions
  tasks: [
    {
      id: 'task0',
      type: 'intro',
      name: 'Introduction',
      icon: '📋',
      estimated_time: '5 min',
      component: null
    },
    {
      id: 'task1',
      type: 'multi-text-input',
      name: 'Market Research',
      icon: '🔍',
      estimated_time: '60-90 min',
      config: {
        inputs: [
          {
            id: 'targetMarket',
            label: 'Target Market & Primary Persona (max 150 words)',
            type: 'rich-text',
            required: true,
            maxLength: 150
          },
          {
            id: 'userNeeds',
            label: 'Top 5 User Needs & How Watch Serves Them',
            type: 'rich-text',
            required: true
          },
          {
            id: 'competitiveDiff',
            label: 'Key Competitive Differentiators',
            type: 'rich-text',
            required: true
          },
          {
            id: 'constraints',
            label: 'Feasibility & Constraints Awareness',
            type: 'rich-text',
            required: true
          }
        ],
        fileUpload: {
          enabled: true,
          accept: ['.pdf', '.png', '.jpg'],
          optional: true
        },
        referenceData: {
          personas: true,
          competitors: true,
          industryStats: true
        }
      },
      validation: {
        method: 'rule-based',
        validator: 'validateTask1',
        rubric: {
          targetMarket: { weight: 0.3, maxScore: 30 },
          userNeeds: { weight: 0.3, maxScore: 30 },
          competitiveDiff: { weight: 0.2, maxScore: 20 },
          constraints: { weight: 0.2, maxScore: 20 }
        },
        keywords: {
          targetMarket: ['persona', 'target', 'demographic', 'segment', 'user', 'customer', 'age'],
          userNeeds: ['need', 'requirement', 'want', 'desire', 'pain', 'problem', 'challenge'],
          competitiveDiff: ['competitor', 'competitive', 'differentiator', 'advantage', 'unique', 'vs', 'versus'],
          constraints: ['regulatory', 'hipaa', 'privacy', 'battery', 'price', 'cost', 'budget', 'constraint', 'limit', 'regulation']
        }
      },
      skills_tested: ['Product Sense', 'Market Research', 'Analytical Thinking']
    },
    {
      id: 'task2',
      type: 'multi-select-form',
      name: 'Team & Tech Stack',
      icon: '👥',
      estimated_time: '30-45 min',
      config: {
        roleSelection: {
          options: 'roles',
          multiple: true,
          required: true
        },
        techStack: {
          fields: [
            { id: 'backend', label: 'Backend Language', options: 'techStack.backend' },
            { id: 'database', label: 'Database', options: 'techStack.database' },
            { id: 'mobile', label: 'Mobile Stack', options: 'techStack.mobile' },
            { id: 'cloud', label: 'Cloud Provider', options: 'techStack.cloud' }
          ],
          required: true
        }
      },
      validation: {
        method: 'rule-based',
        validator: 'validateTask2'
      },
      skills_tested: ['Team Building', 'Technical Planning', 'Resource Management']
    },
    {
      id: 'task3',
      type: 'roadmap',
      name: 'Roadmap & Phases',
      icon: '🗺️',
      estimated_time: '30-45 min',
      config: {
        phases: true,
        milestones: true
      },
      validation: {
        method: 'rule-based',
        validator: 'validateTask3'
      },
      skills_tested: ['Strategic Planning', 'Prioritization', 'Project Management']
    },
    {
      id: 'task4',
      type: 'wireframe',
      name: 'Wireframe Design',
      icon: '🎨',
      estimated_time: '30-60 min',
      config: {
        upload: true,
        sketch: true
      },
      validation: {
        method: 'rule-based',
        validator: 'validateTask4'
      },
      skills_tested: ['UX Design', 'Product Design', 'User Experience']
    },
    {
      id: 'task5',
      type: 'gtm-strategy',
      name: 'GTM Strategy',
      icon: '🚀',
      estimated_time: '45-60 min',
      config: {
        channels: true,
        partnerships: true,
        pricing: true
      },
      validation: {
        method: 'rule-based',
        validator: 'validateTask5'
      },
      skills_tested: ['GTM Strategy', 'Marketing', 'Business Strategy']
    },
    {
      id: 'task6',
      type: 'analytics-dashboard',
      name: 'Post-Launch Analytics',
      icon: '📊',
      estimated_time: '60-90 min',
      config: {
        charts: ['dau', 'nps', 'metrics'],
        dataSource: 'analyticsData',
        actions: {
          type: 'multi-select',
          maxSelections: 3,
          options: 'actionOptions'
        },
        customerReplies: {
          count: 2,
          source: 'reviews',
          filter: { sentiment: 'negative' }
        }
      },
      validation: {
        method: 'rule-based',
        validator: 'validateTask6'
      },
      skills_tested: ['Data Analysis', 'Customer Empathy', 'Problem Solving']
    },
    {
      id: 'task7',
      type: 'final-submission',
      name: 'Final Submission',
      icon: '✅',
      estimated_time: '30-45 min',
      config: {
        reflection: true,
        summary: true
      },
      validation: {
        method: 'rule-based',
        validator: 'validateTask7'
      },
      skills_tested: ['Communication', 'Synthesis', 'Presentation']
    }
  ],
  
  // Skills tested across all tasks
  skills_tested: [
    'Product Sense',
    'Technical Feasibility',
    'Teaming & Planning',
    'UX Design',
    'GTM Strategy',
    'Data Insights',
    'Communication'
  ],
  
  // Learning objectives
  learning_objectives: [
    'Market analysis and user research',
    'Team formation and resource planning',
    'Roadmap planning and prioritization',
    'Product design and UX thinking',
    'Go-to-market strategy and positioning',
    'Post-launch analytics and data interpretation',
    'Stakeholder communication and presentation'
  ],
  
  // Skill mapping: which tasks test which skills
  skill_mapping: {
    'Product Sense': ['task1', 'task3', 'task5'],
    'Technical Feasibility': ['task2', 'task3'],
    'Teaming & Planning': ['task2', 'task3'],
    'UX Design': ['task4'],
    'GTM Strategy': ['task5'],
    'Data Insights': ['task6'],
    'Communication': ['task1', 'task6', 'task7']
  },
  
  // Reference data for tasks
  task_data: {
    personas,
    competitors,
    industryStats,
    roleOptions,
    techStackOptions,
    analyticsData
  },
  
  // Validation rules (references to functions in demoValidation.js)
  validation_rules: {
    task1: {
      method: 'rule-based',
      validator: 'validateTask1'
    },
    task2: {
      method: 'rule-based',
      validator: 'validateTask2'
    },
    task3: {
      method: 'rule-based',
      validator: 'validateTask3'
    },
    task4: {
      method: 'rule-based',
      validator: 'validateTask4'
    },
    task5: {
      method: 'rule-based',
      validator: 'validateTask5'
    },
    task6: {
      method: 'rule-based',
      validator: 'validateTask6'
    },
    task7: {
      method: 'rule-based',
      validator: 'validateTask7'
    }
  },
  
  // Metadata
  metadata: {
    version: '1.0',
    created_via: 'seed-script',
    last_updated: new Date().toISOString()
  },
  
  is_published: true,
  is_active: true
};

async function seedSimulations() {
  try {
    console.log('🌱 Seeding task-based simulations...');
    console.log(`   Supabase URL: ${SUPABASE_URL}`);
    
    // Check if simulation already exists
    const { data: existing } = await supabase
      .from('task_based_simulations')
      .select('id, title, slug')
      .eq('slug', noahSimulation.slug)
      .maybeSingle();

    if (existing) {
      console.log(`⚠️  Simulation "${noahSimulation.title}" already exists`);
      console.log(`   ID: ${existing.id}`);
      console.log('   Updating...');
      
      const { data, error } = await supabase
        .from('task_based_simulations')
        .update({
          ...noahSimulation,
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
        .insert(noahSimulation)
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

