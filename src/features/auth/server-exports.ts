/**
 * Feature Auth - Exports SERVER uniquement
 * 
 * Pour imports dans Server Components et Server Actions uniquement
 */

// Server-side helpers
export {
  requireAuth,
  requireRole, 
  getServerSession,
  hasServerPermission
} from './server'

// Middleware pour Next.js
export { updateSession } from './middleware'

// Types auth
export type { UserRole, UserSession } from './types'
export { ROLE_PERMISSIONS } from './types'