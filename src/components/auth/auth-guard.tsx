/**
 * Auth Guard Component - HerbisVeritas V2 MVP
 * 
 * Protège composants côté client selon rôles RBAC
 * Fallback: redirect ou component alternatif
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type UserRole } from '@/lib/auth/types'
import { canAccess } from '@/lib/auth/permissions'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
  fallback?: React.ReactNode
  redirectTo?: string
  showLoading?: boolean
}

interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  userRole: UserRole
  hasAccess: boolean
}

export function AuthGuard({
  children,
  requiredRole,
  allowedRoles,
  fallback,
  redirectTo,
  showLoading = true
}: AuthGuardProps) {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    userRole: 'user',
    hasAccess: false
  })

  useEffect(() => {
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function checkAuth() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          userRole: 'user',
          hasAccess: false
        })
        
        if (redirectTo) {
          router.push(redirectTo)
        }
        return
      }

      const userRole = getUserRole(user)
      const hasRequiredAccess = checkAccess(userRole, requiredRole, allowedRoles)

      setAuthState({
        isLoading: false,
        isAuthenticated: true,
        userRole,
        hasAccess: hasRequiredAccess
      })

      // Redirection si accès insuffisant
      if (!hasRequiredAccess && redirectTo) {
        router.push(redirectTo)
      }

    } catch (error) {
      console.error('Auth Guard error:', error)
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        userRole: 'user',
        hasAccess: false
      })
    }
  }

  function getUserRole(user: any): UserRole {
    const role = user.app_metadata?.['role'] as UserRole
    return (role && ['user', 'admin', 'dev'].includes(role)) ? role : 'user'
  }

  function checkAccess(
    userRole: UserRole, 
    requiredRole?: UserRole, 
    allowedRoles?: UserRole[]
  ): boolean {
    if (allowedRoles) {
      return allowedRoles.includes(userRole)
    }
    
    if (requiredRole) {
      return canAccess(userRole, requiredRole)
    }
    
    return true // Pas de restriction
  }

  // Loading state
  if (authState.isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Non authentifié
  if (!authState.isAuthenticated) {
    return fallback || (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Connexion requise</p>
      </div>
    )
  }

  // Accès insuffisant
  if (!authState.hasAccess) {
    return fallback || (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Permissions insuffisantes</p>
      </div>
    )
  }

  // Accès autorisé
  return <>{children}</>
}

/**
 * Hook pour obtenir état auth dans composants
 * Usage: const { isAuthenticated, userRole } = useAuthState()
 */
export function useAuthState() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    userRole: 'user',
    hasAccess: true
  })

  useEffect(() => {
    checkAuthState()
  }, [])

  async function checkAuthState() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false
        }))
        return
      }

      const userRole = user.app_metadata?.['role'] as UserRole || 'user'
      
      setAuthState({
        isLoading: false,
        isAuthenticated: true,
        userRole,
        hasAccess: true
      })

    } catch (error) {
      console.error('Auth state error:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false
      }))
    }
  }

  return authState
}

export default AuthGuard