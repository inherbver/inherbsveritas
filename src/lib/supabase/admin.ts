/**
 * Supabase Admin Client Configuration
 * Used for administrative operations requiring service role permissions
 */
import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export function createAdminClient() {
  if (!process.env['SUPABASE_SERVICE_ROLE_KEY']) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations')
  }

  return createClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}