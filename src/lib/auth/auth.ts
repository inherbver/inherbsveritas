// TODO: Implémentation Supabase Auth selon architecture MVP 13 tables
// - Table `users` avec 3 rôles (user/admin/dev)
// - RLS policies appropriées
// - Integration auth.users → public.users

import { createClient } from '@/lib/supabase/server';
import type { User } from '@/types/database';

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authUser) {
    return null;
  }

  // Get profile from public.users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (profileError || !profile) {
    // TODO: Create profile logic when MVP schema is deployed
    console.warn('Profile not found for user:', authUser.id);
    return null;
  }

  return profile;
}

export async function signOut() {
  const supabase = await createClient();
  return supabase.auth.signOut();
}

// TODO: Ajouter autres fonctions auth selon besoins MVP
// - signUp avec email verification
// - resetPassword
// - updateProfile
// - etc.