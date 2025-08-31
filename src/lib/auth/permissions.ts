/**
 * Permissions Helper - HerbisVeritas V2 MVP
 * 
 * Fonctions utilitaires pour vérifications permissions RBAC
 * Aligné avec private.role_permissions du schéma 002_auth_rbac_security.sql
 */

import { type UserRole, ROLE_PERMISSIONS } from '@/lib/auth/types'

/**
 * Vérifier si user a permission pour ressource
 * Ex: hasPermission('admin', 'products:admin') → true
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false
}

/**
 * Vérifier si user peut accéder à une ressource
 * Ex: canAccess('user', 'admin') → false
 */
export function canAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  // Hiérarchie des rôles: dev > admin > user
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    admin: 2, 
    dev: 3
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Obtenir toutes les permissions d'un rôle
 * Ex: getRolePermissions('admin') → ['users:admin', 'products:admin', ...]
 */
export function getRolePermissions(userRole: UserRole): string[] {
  return ROLE_PERMISSIONS[userRole] || []
}

/**
 * Vérifier accès multiple routes
 * Ex: canAccessAny('user', ['admin', 'dev']) → false
 */
export function canAccessAny(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => canAccess(userRole, role))
}

/**
 * Vérifier accès toutes routes
 * Ex: canAccessAll('dev', ['admin', 'user']) → true
 */
export function canAccessAll(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.every(role => canAccess(userRole, role))
}

/**
 * Filtrer items selon permissions user
 * Ex: filterByPermissions(items, 'admin', item => item.adminOnly)
 */
export function filterByPermissions<T>(
  items: T[],
  userRole: UserRole,
  permissionCheck: (item: T, role: UserRole) => boolean
): T[] {
  return items.filter(item => permissionCheck(item, userRole))
}

/**
 * Vérifier accès panel admin
 */
export function canAccessAdminPanel(userRole: UserRole): boolean {
  return canAccess(userRole, 'admin')
}

/**
 * Vérifier modification produits
 */
export function canModifyProduct(userRole: UserRole): boolean {
  return hasPermission(userRole, 'products:admin')
}

/**
 * Vérifier consultation détails commande
 */
export function canViewOrderDetails(userRole: UserRole, userId?: string, order?: { user_id: string }): boolean {
  // Admin/dev peuvent voir toutes les commandes
  if (canAccess(userRole, 'admin')) {
    return true
  }
  
  // User peut voir seulement ses propres commandes
  if (userRole === 'user' && userId && order) {
    return order.user_id === userId
  }
  
  // Fallback: vérifier permission générale
  return hasPermission(userRole, 'orders:read')
}

/**
 * Obtenir permissions pour rôle spécifique
 */
export function getPermissionsForRole(userRole: UserRole): string[] {
  return getRolePermissions(userRole)
}

/**
 * Valider accès ressource spécifique - Version simple
 */
export function validateResourceAccess(
  userRole: UserRole, 
  resource: string, 
  action: string
): boolean

/**
 * Valider accès ressource spécifique - Version avec ownership
 */
export function validateResourceAccess(
  userRole: UserRole, 
  userId: string,
  resourceData: { type: string; owner_id: string }
): { allowed: boolean; reason?: string }

export function validateResourceAccess(
  userRole: UserRole, 
  resourceOrUserId: string,
  actionOrResourceData: string | { type: string; owner_id: string }
): boolean | { allowed: boolean; reason?: string } {
  // Version simple: validateResourceAccess('admin', 'orders', 'admin')
  if (typeof actionOrResourceData === 'string') {
    return hasPermission(userRole, `${resourceOrUserId}:${actionOrResourceData}`)
  }
  
  // Version avec ownership: validateResourceAccess('user', 'user-123', { type: 'order', owner_id: 'user-123' })
  const userId = resourceOrUserId
  const resourceData = actionOrResourceData
  
  // Admin/dev peuvent tout faire
  if (canAccess(userRole, 'admin')) {
    return { allowed: true }
  }
  
  // User ne peut accéder qu'à ses propres ressources
  if (userRole === 'user') {
    if (resourceData.owner_id === userId) {
      return { allowed: true }
    } else {
      return { allowed: false, reason: 'Insufficient permissions' }
    }
  }
  
  return { allowed: false, reason: 'Insufficient permissions' }
}