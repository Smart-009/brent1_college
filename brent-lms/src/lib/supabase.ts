import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://mxfuivzgcnxwyslrmzqa.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_WDU0daQwIsyyjx28HakaMA_I2lmQ7F9'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
