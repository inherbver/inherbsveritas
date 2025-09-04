/**
 * Auth Module Exports - HerbisVeritas V2 MVP
 * 
 * Point d'entrée centralisé pour tous les helpers auth
 */

// Types
export type { UserRole, UserSession, RouteProtection } from './types'
export { ROLE_PERMISSIONS, PROTECTED_ROUTES, PUBLIC_ROUTES } from './types'

// Permissions helpers
export {
  hasPermission,
  canAccess,
  getRolePermissions,
  canAccessAny,
  canAccessAll,
  filterByPermissions
} from './permissions'

// Server-side helpers
export {
  requireAuth,
  requireRole, 
  getServerSession,
  hasServerPermission
} from './server'

// Client components
export { AuthGuard, useAuthState } from '../../components/auth/auth-guard'
export { 
  RoleGate,
  AdminOnly,
  DevOnly, 
  UserOrHigher,
  AdminOrDev
} from '../../components/auth/role-gate'

// Middleware (internal use)
export { updateSession } from './middleware'