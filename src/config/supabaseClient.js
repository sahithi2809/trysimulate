import { createClient } from '@supabase/supabase-js'

// Production Supabase credentials (fallback if env vars not set)
const PROD_SUPABASE_URL = 'https://iryabjeigjtwditxfnfh.supabase.co'
const PROD_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeWFiamVpZ2p0d2RpdHhmbmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTk1MzksImV4cCI6MjA3NjMzNTUzOX0.i9TxNkVHCPCv6pVXrjsyVq64jpb_YyrY9v_7eXTvt-w'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || PROD_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || PROD_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

