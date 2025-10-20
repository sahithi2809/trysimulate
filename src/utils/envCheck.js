/**
 * Environment Variables Check
 * Run this to verify your .env file is loaded correctly
 */

export function checkEnvironment() {
  const checks = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    openaiKey: import.meta.env.VITE_OPENAI_API_KEY
  }

  console.group('🔍 Environment Variables Check')
  
  console.log('VITE_SUPABASE_URL:', checks.supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('  Value:', checks.supabaseUrl || 'NOT SET')
  
  console.log('VITE_SUPABASE_ANON_KEY:', checks.supabaseAnonKey ? '✅ Set' : '❌ Missing')
  console.log('  Value:', checks.supabaseAnonKey ? `${checks.supabaseAnonKey.substring(0, 20)}...` : 'NOT SET')
  
  console.log('VITE_OPENAI_API_KEY:', checks.openaiKey ? '✅ Set (not used for Edge Functions)' : '❌ Missing (optional)')
  
  console.groupEnd()

  const allRequiredSet = checks.supabaseUrl && checks.supabaseAnonKey
  
  if (!allRequiredSet) {
    console.error('❌ Missing required environment variables!')
    console.error('Make sure you have a .env file in the root of CODEBASE/ with:')
    console.error('VITE_SUPABASE_URL=your_supabase_url')
    console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key')
  } else {
    console.log('✅ All required environment variables are set!')
  }

  return allRequiredSet
}

// Auto-run on import in development
if (import.meta.env.DEV) {
  checkEnvironment()
}

