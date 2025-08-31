// TODO: Replace with Supabase Auth configuration (Semaine 2 MVP)
// Currently disabled to prevent build errors - legacy Prisma code

/*
 * LEGACY PRISMA AUTH CODE - TO BE REPLACED WITH SUPABASE
 * 
 * This file contains NextAuth configuration using Prisma adapter.
 * In Phase 1 Semaine 2, this will be completely rewritten to use:
 * - Supabase Auth
 * - 3 roles (user/admin/dev) 
 * - Supabase client instead of Prisma
 * 
 * Current providers: Credentials, GitHub, Google, Email
 */

// Placeholder export to prevent build errors
export const authOptions = null;

// export type { NextAuthOptions } from "next-auth";

// Fonctions utilitaires pour les tests
export async function hashPassword(password: string): Promise<string> {
  // Implémentation basique pour les tests
  return `hashed_${password}`;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return hashedPassword === `hashed_${password}`;
}

export function generateSessionToken(): string {
  return `session_${Math.random().toString(36).substring(2, 15)}`;
}

export function validateSessionToken(token: string): boolean {
  return token.startsWith('session_');
}

export function extractUserFromJWT(jwt: string): { id: string; email: string } | null {
  if (!jwt) return null;
  return {
    id: 'user_123',
    email: 'test@herbisveritas.fr'
  };
}