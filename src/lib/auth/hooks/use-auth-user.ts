/**
 * Auth User Hooks
 * 
 * User-specific authentication hooks and utilities
 */

"use client"

import { useAuthState } from './use-auth-state'

/**
 * Hook principal compatible tests TDD
 * Combine state + interface attendue par tests
 */
export function useAuth() {
  const authState = useAuthState()
  
  return {
    user: authState.user,
    role: authState.role,
    isLoading: authState.loading,
    isAuthenticated: !!authState.user && !authState.loading,
    error: authState.error
  }
}

/**
 * Hook utilisateur simplifié - Compatible tests
 */
export function useAuthUser() {
  const { user, role, loading } = useAuthState()
  
  if (loading || !user) return null
  
  return {
    id: user.id,
    email: user.email,
    role: role || 'user',
    metadata: user.user_metadata || {},
    createdAt: user.created_at,
    lastSignIn: user.last_sign_in_at
  }
}

/**
 * Hook vérification rôles
 */
export function useUserRole() {
  const { role, loading } = useAuthState()
  
  const hasRole = (requiredRole: string | string[]) => {
    if (loading || !role) return false
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role)
    }
    
    return role === requiredRole
  }

  const isAdmin = () => hasRole(['admin', 'dev'])
  const isUser = () => hasRole('user')
  const isDev = () => hasRole('dev')

  return {
    role,
    hasRole,
    isAdmin,
    isUser,
    isDev,
    loading
  }
}