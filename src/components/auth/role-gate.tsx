/**
 * Role Gate Component - HerbisVeritas V2 MVP
 * 
 * Affichage conditionnel basé sur rôles utilisateur
 * Plus léger qu'AuthGuard pour simples vérifications
 */

'use client'

import { type UserRole } from '@/lib/auth/types'
import { canAccess } from '@/lib/auth/permissions'
import { useAuthState } from './auth-guard'

interface RoleGateProps {
  children: React.ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
  fallback?: React.ReactNode
  inverse?: boolean // Afficher si PAS le rôle requis
}

export function RoleGate({
  children,
  requiredRole,
  allowedRoles,
  fallback = null,
  inverse = false
}: RoleGateProps) {
  const { isLoading, isAuthenticated, userRole } = useAuthState()

  // Loading ou non auth → pas d'affichage
  if (isLoading || !isAuthenticated) {
    return <>{fallback}</>
  }

  const hasAccess = checkRoleAccess(userRole, requiredRole, allowedRoles)
  const shouldShow = inverse ? !hasAccess : hasAccess

  return shouldShow ? <>{children}</> : <>{fallback}</>
}

function checkRoleAccess(
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
  
  return true
}

/**
 * Composants spécialisés pour rôles courants
 */

export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGate requiredRole="admin" fallback={fallback}>
      {children}
    </RoleGate>
  )
}

export function DevOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGate requiredRole="dev" fallback={fallback}>
      {children}
    </RoleGate>
  )
}

export function UserOrHigher({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGate allowedRoles={['user', 'admin', 'dev']} fallback={fallback}>
      {children}
    </RoleGate>
  )
}

export function AdminOrDev({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGate allowedRoles={['admin', 'dev']} fallback={fallback}>
      {children}
    </RoleGate>
  )
}

export default RoleGate