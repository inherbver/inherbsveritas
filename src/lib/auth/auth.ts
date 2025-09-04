// TODO: Implémentation Supabase Auth selon architecture MVP 13 tables
// - Table `users` avec 3 rôles (user/admin/dev) 
// - RLS policies appropriées
// - Integration auth.users → public.users
// TEMPORAIRE: Version stub pour permettre le build

import type { User } from '@/types/database';

export async function getCurrentUser(): Promise<User | null> {
  // TODO: Réimplémenter avec Supabase client corrigé
  return null;
}

export async function requireAuth() {
  // TODO: Réimplémenter avec Supabase client corrigé
  throw new Error('Authentication required');
}

export async function requireRole(role: string) {
  // TODO: Réimplémenter avec Supabase client corrigé
  throw new Error(`Role ${role} required`);
}