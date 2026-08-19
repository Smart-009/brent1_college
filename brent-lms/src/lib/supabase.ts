import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://vxqnnggpurdjxzdodjmj.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cW5uZ2dwdXJkanh6ZG9kam1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNjM3MzYsImV4cCI6MjEwMjczOTczNn0.7vgmCjg7ANA8d2Pi7JLHkdpSJSMoOR2jmkw_ZfmxYtw'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
