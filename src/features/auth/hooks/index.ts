/**
 * Auth Hooks - HerbisVeritas V2 MVP
 * 
 * Centralized exports for authentication hooks
 * Refactored from single 329-line file for maintainability
 */

// Core state management
export { useAuthState } from './use-auth-state'
export type { AuthState } from './use-auth-state'

// Authentication actions
export { useAuthActions } from './use-auth-actions'

// User utilities and role management
export { 
  useAuth, 
  useAuthUser, 
  useUserRole 
} from './use-auth-user'

// Route protection and guards
export { useRequireAuth } from './use-auth-protection'

// Permission system
export { usePermissions } from './use-permissions'