import { supabase } from '../config/supabaseClient'

/**
 * Test Supabase connection
 * Call this function to verify your Supabase setup is working
 */
export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test basic connection by getting the current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('Session:', session ? 'Active session found' : 'No active session')
    
    return true
  } catch (error) {
    console.error('❌ Supabase test error:', error)
    return false
  }
}

/**
 * Get Supabase client info
 */
export function getSupabaseInfo() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY
  
  return {
    url: url || 'Not configured',
    hasKey,
    isConfigured: !!(url && hasKey)
  }
}



