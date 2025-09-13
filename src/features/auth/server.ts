/**
 * Server Auth Utils - HerbisVeritas V2 MVP
 * 
 * Helpers pour Server Components et Server Actions
 * Utilise le client Supabase server-side existant
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type UserRole } from './types'
import { canAccess } from './permissions'

/**
 * Obtenir user authentifié ou rediriger vers login
 * Usage dans Server Component: const user = await requireAuth()
 */
export async function requireAuth() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  return user
}

/**
 * Obtenir user avec rôle spécifique ou rediriger
 * Usage: const user = await requireRole('admin')
 */
export async function requireRole(requiredRole: UserRole) {
  const user = await requireAuth()
  const userRole = getUserRoleFromUser(user)
  
  if (!canAccess(userRole, requiredRole)) {
    redirect('/unauthorized')
  }
  
  return { user, role: userRole }
}

/**
 * Obtenir user + rôle sans redirection (pour conditionnels)
 * Usage: const session = await getServerSession()
 */
export async function getServerSession() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return {
    user,
    role: getUserRoleFromUser(user)
  }
}

/**
 * Vérifier permissions sans redirection
 * Usage: if (await hasServerPermission('admin')) { ... }
 */
export async function hasServerPermission(requiredRole: UserRole): Promise<boolean> {
  const session = await getServerSession()
  
  if (!session) return false
  
  return canAccess(session.role, requiredRole)
}

/**
 * Extraire rôle depuis user Supabase
 * Cohérent avec middleware.ts
 */
function getUserRoleFromUser(user: any): UserRole {
  const role = user.app_metadata?.role as UserRole
  
  if (role && ['user', 'admin', 'dev'].includes(role)) {
    return role
  }
  
  return 'user'
}