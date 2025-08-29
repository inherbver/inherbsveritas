/**
 * Supabase Browser Client Configuration
 * Used for client-side operations and real-time subscriptions
 */
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
  )
}

// Export for convenience
export const supabase = createClient()