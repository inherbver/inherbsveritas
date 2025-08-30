/**
 * Auth Hooks - HerbisVeritas V2 MVP
 * 
 * Hooks React pour gestion authentification côté client
 * Intégration Supabase Auth avec middleware SSR
 */

"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type UserRole } from '@/lib/auth/types'
import { type User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  role: UserRole | null
  loading: boolean
  error: string | null
}

/**
 * Hook principal authentification
 * Synchronisé avec middleware SSR
 */
export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const supabase = createClient()

    // État initial
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }))
          return
        }

        const role = getUserRole(user)
        setState({
          user,
          role,
          loading: false,
          error: null
        })
      } catch (err) {
        setState(prev => ({ 
          ...prev, 
          error: err instanceof Error ? err.message : 'Erreur authentification',
          loading: false 
        }))
      }
    }

    // Écouter changements auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      const role = getUserRole(user)
      
      setState({
        user,
        role,
        loading: false,
        error: null
      })
    })

    getInitialSession()

    return () => subscription.unsubscribe()
  }, [])

  return state
}

/**
 * Hook actions authentification
 */
export function useAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const signIn = async (email: string, password: string, redirectTo?: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      // Redirection gérée par middleware
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.push('/profile')
      }

      return { success: true }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur de connexion'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      setLoading(true)
      setError(null)

      const signUpParams: any = {
        email,
        password
      }
      
      if (metadata) {
        signUpParams.options = {
          data: metadata
        }
      }

      const { data, error } = await supabase.auth.signUp(signUpParams)

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { 
        success: true, 
        user: data.user,
        needsEmailConfirmation: !data.session
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur d\'inscription'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      router.push('/login')
      return { success: true }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur de déconnexion'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur reset mot de passe'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    loading,
    error,
    clearError: () => setError(null)
  }
}

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

/**
 * Extraire rôle depuis user Supabase
 * Cohérent avec middleware.ts
 */
function getUserRole(user: User | null): UserRole | null {
  if (!user) return null
  
  const role = user.app_metadata?.['role'] as UserRole
  
  if (role && ['user', 'admin', 'dev'].includes(role)) {
    return role
  }
  
  return 'user'
}