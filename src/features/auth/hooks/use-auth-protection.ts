/**
 * Auth Protection & Route Guards
 * 
 * Route protection and authorization hooks
 */

"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth-user'
import { type UserRole } from '@/lib/auth/types'

/**
 * Hook redirection auth required - Compatible tests TDD
 */
export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (isLoading) return
    
    // Pas d'utilisateur = redirection login
    if (!user) {
      router.push('/login')
      return
    }
    
    // Vérifier rôles si spécifiés
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.push('/unauthorized')
      return
    }
  }, [user, role, isLoading, allowedRoles, router])
  
  return {
    user,
    role,
    isLoading,
    isAuthorized: !!user && (!allowedRoles || (role && allowedRoles.includes(role)))
  }
}