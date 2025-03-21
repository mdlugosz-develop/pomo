import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create Supabase client with auth configuration for better security
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      // Set persistence to 'session' for better security
      persistSession: true,
      // Session expires after 24 hours (in seconds)
      autoRefreshToken: true,
      // Detect session activity and refresh token when appropriate
      detectSessionInUrl: true,
    },
  }
)