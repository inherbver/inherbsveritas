/**
 * Auth Permissions Hook
 * 
 * Role hierarchy and permission checks
 */

"use client"

import { useAuthState } from './use-auth-state'
import { type UserRole } from '@/lib/auth/types'

/**
 * Hook vérification permissions
 */
export function usePermissions() {
  const { role } = useAuthState()

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role) return false
    
    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      admin: 2,
      dev: 3
    }
    
    return roleHierarchy[role] >= roleHierarchy[requiredRole]
  }

  const isAdmin = (): boolean => hasRole('admin')
  const isDev = (): boolean => hasRole('dev')
  const isUser = (): boolean => role === 'user'

  return {
    role,
    hasRole,
    isAdmin,
    isDev,
    isUser
  }
}