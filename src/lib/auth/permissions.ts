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