import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const simulationsDir = path.resolve(__dirname, '../simulations')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '❌ Missing Supabase credentials. Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY before running this script.'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const simulationDefinitions = [
  {
    file: 'pm_prioritization_simulation.html',
    title: 'PM Prioritization Simulation',
    description:
      "Drag-and-drop a product manager's hectic day into the right order while balancing urgent customer issues, leadership updates, and scheduled commitments.",
    category: 'Product Management',
    difficulty: 'Intermediate',
    duration: '15-20 min',
    learningObjectives: [
      'Practice prioritising competing product tasks based on impact and urgency',
      'Balance stakeholder expectations with mandatory deadlines',
      'Recognise when to defer or delegate lower value work',
    ],
    skillsTested: ['Prioritisation', 'Decision Making', 'Stakeholder Management'],
    tags: ['prioritisation', 'product management', 'daily planning'],
  },
  {
    file: 'sales_negotiation1.html',
    title: 'Sales Negotiation: Price Pushback',
    description:
      'Respond to a SaaS buyer who is requesting a steep discount, protect your pricing, and keep the deal moving toward close.',
    category: 'Sales',
    difficulty: 'Intermediate',
    duration: '10-15 min',
    learningObjectives: [
      'Demonstrate empathetic tone while addressing pricing objections',
      'Reinforce product value with relevant outcomes and proof points',
      'Offer creative, conditional alternatives instead of blanket discounts',
      'Drive to a clear next step that maintains deal momentum',
    ],
    skillsTested: ['Negotiation', 'Value Selling', 'Closing Skills'],
    tags: ['negotiation', 'value based selling', 'discount handling'],
  },
  {
    file: 'comment_simulation3.html',
    title: 'Customer Comment Response Simulation',
    description:
      'Reply to a trio of frustrated customers and craft clear, empathetic responses that acknowledge issues and provide next steps.',
    category: 'Customer Support',
    difficulty: 'Beginner',
    duration: '10 min',
    learningObjectives: [
      'Respond to customer complaints with empathy and ownership',
      'Provide concise resolutions and next steps for different scenarios',
      'Maintain a consistent, brand-aligned tone across multiple replies',
    ],
    skillsTested: ['Customer Communication', 'Empathy', 'Issue Resolution'],
    tags: ['customer experience', 'support', 'communication'],
  },
]

async function readHtmlFile(relativePath) {
  const absolutePath = path.join(simulationsDir, relativePath)
  return fs.readFile(absolutePath, 'utf8')
}

async function upsertSimulation(definition, htmlContent) {
  const now = new Date().toISOString()

  const { data: existing, error: fetchError } = await supabase
    .from('simulations')
    .select('id')
    .eq('title', definition.title)
    .maybeSingle()

  if (fetchError) {
    throw new Error(`Failed to check existing simulation "${definition.title}": ${fetchError.message}`)
  }

  const payload = {
    title: definition.title,
    description: definition.description,
    category: definition.category,
    difficulty: definition.difficulty,
    duration: definition.duration,
    learning_objectives: definition.learningObjectives,
    skills_tested: definition.skillsTested,
    html_content: htmlContent,
    is_ai_generated: false,
    is_published: true,
    tags: definition.tags || [],
    created_by: existing ? undefined : null,
    creator_name: existing ? undefined : 'Simulate Team',
    metadata: {
      imported_from: 'legacy_local_storage',
      original_file: definition.file,
      seeded_at: now,
      seeded_version: 'importSimulationsScript@1',
    },
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from('simulations')
      .update({
        ...payload,
        updated_at: now,
      })
      .eq('id', existing.id)

    if (updateError) {
      throw new Error(`Failed to update simulation "${definition.title}": ${updateError.message}`)
    }

    console.log(`🔁 Updated existing simulation: ${definition.title}`)
    return existing.id
  }

  const { data, error: insertError } = await supabase
    .from('simulations')
    .insert({
      ...payload,
      created_at: now,
    })
    .select('id')
    .single()

  if (insertError) {
    throw new Error(`Failed to insert simulation "${definition.title}": ${insertError.message}`)
  }

  console.log(`✅ Inserted new simulation: ${definition.title}`)
  return data?.id
}

async function main() {
  try {
    console.log('📦 Importing simulations from local HTML files...')
    console.log(`   Supabase URL: ${SUPABASE_URL}`)
    console.log(`   Source directory: ${simulationsDir}`)

    const results = []

    for (const definition of simulationDefinitions) {
      const htmlContent = await readHtmlFile(definition.file)
      const id = await upsertSimulation(definition, htmlContent)
      results.push({ title: definition.title, id })
    }

    console.log('\n🎉 Import complete!')
    results.forEach((item) => {
      console.log(`   • ${item.title} (${item.id})`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

main()


