/**
 * Feature Auth - Point d'entrée CLIENT
 * 
 * Export UNIQUEMENT les parties client-safe pour éviter next/headers dans client components
 */

// Services auth client
export * from './auth-service'

// Hooks auth (client uniquement)
export * from './hooks'

// Types auth
export type { UserRole, UserSession, RouteProtection } from './types'
export { ROLE_PERMISSIONS, PROTECTED_ROUTES, PUBLIC_ROUTES } from './types'

// Permissions helpers (fonctions pures)
export {
  hasPermission,
  canAccess,
  getRolePermissions,
  canAccessAny,
  canAccessAll,
  filterByPermissions
} from './permissions'

// NOTA: Pour server-side helpers, importer directement depuis './server'