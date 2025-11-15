import { createClient } from '@supabase/supabase-js'

const REQUIRED_TITLES = [
  'PM Prioritization Simulation',
  'Sales Negotiation: Price Pushback',
  'Customer Comment Response Simulation',
]

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

async function main() {
  try {
    console.log('🔁 Fetching simulations to update metadata flags...')

    const { data, error } = await supabase.from('simulations').select('id,title,metadata,is_published')

    if (error) {
      throw new Error(`Failed to fetch simulations: ${error.message}`)
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ No simulations found to update.')
      process.exit(0)
    }

    for (const row of data) {
      const shouldBeActive = REQUIRED_TITLES.includes(row.title)
      const metadata = {
        ...(row.metadata || {}),
        is_active: shouldBeActive,
      }

      const { error: updateError } = await supabase
        .from('simulations')
        .update({
          metadata,
          ...(shouldBeActive ? { is_published: true } : {}),
        })
        .eq('id', row.id)

      if (updateError) {
        throw new Error(`Failed to update simulation "${row.title}": ${updateError.message}`)
      }
    }

    console.log('✅ Updated metadata flags on all simulations.')
    console.log('🎉 Soft-delete operation complete.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Operation failed:', error.message)
    process.exit(1)
  }
}

main()


