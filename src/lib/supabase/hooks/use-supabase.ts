/**
 * Hook Supabase principal - HerbisVeritas V2
 * 
 * Combine authentification et user management
 */

"use client"

import { useAuth } from '@/features/auth'
import { useAuthActions } from '@/features/auth'

/**
 * Hook principal pour Supabase - Compatible avec Header
 */
export function useSupabase() {
  const auth = useAuth()
  const actions = useAuthActions()

  return {
    // User data
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    
    // Actions
    signIn: actions.signIn,
    signUp: actions.signUp,
    signOut: actions.signOut,
    resetPassword: actions.resetPassword,
    
    // Loading states
    loading: actions.loading,
    authError: actions.error,
    clearError: actions.clearError
  }
}