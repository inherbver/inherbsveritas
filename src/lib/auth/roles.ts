/**
 * Configuration des rôles utilisateur - Architecture MVP
 * Rôles: guest, user, dev, admin
 * IMPORTANT: dev et admin ont les mêmes privilèges pour MVP
 */

// === DÉFINITION DES RÔLES ===
export const USER_ROLES = {
  GUEST: 'guest',
  USER: 'user', 
  DEV: 'dev',
  ADMIN: 'admin'
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// === HIÉRARCHIE DES RÔLES ===
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  dev: 2,    // Même niveau que admin pour MVP
  admin: 2   // Même niveau que dev pour MVP
} as const

// === REDIRECTIONS PAR RÔLE ===
export const ROLE_REDIRECTS: Record<UserRole, string> = {
  guest: '/',
  user: '/profile',
  dev: '/admin',    // Même redirection que admin
  admin: '/admin'   // Interface admin partagée dev/admin
} as const

// === ROUTES PUBLIQUES ===
export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact', 
  '/products',
  '/magazine',
  '/partners',
  '/login',
  '/signup',
  '/auth/reset-password'
] as const

// === ROUTES PAR RÔLE ===
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  guest: [
    ...PUBLIC_ROUTES,
    // Guest n'a accès qu'aux routes publiques
  ],
  user: [
    ...PUBLIC_ROUTES,
    '/profile',
    '/orders',
    '/addresses'
    // Routes utilisateur authentifié
  ],
  dev: [
    ...PUBLIC_ROUTES,
    '/profile',
    '/orders', 
    '/addresses',
    '/admin',
    '/admin/products',
    '/admin/categories',
    '/admin/orders',
    '/admin/users',
    '/admin/articles',
    '/admin/partners',
    '/dev'
    // Routes développeur (même accès que admin + routes dev)
  ],
  admin: [
    ...PUBLIC_ROUTES,
    '/profile',
    '/orders',
    '/addresses', 
    '/admin',
    '/admin/products',
    '/admin/categories',
    '/admin/orders',
    '/admin/users',
    '/admin/articles',
    '/admin/partners'
    // Routes admin (même accès que dev sauf /dev)
  ]
} as const

// === PERMISSIONS FONCTIONNELLES ===
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  guest: [
    'view_public_content',
    'add_to_cart',
    'guest_checkout'
  ],
  user: [
    'view_public_content',
    'add_to_cart',
    'user_checkout',
    'manage_profile',
    'view_orders',
    'manage_addresses'
  ],
  dev: [
    // Toutes les permissions user +
    'view_public_content',
    'add_to_cart', 
    'user_checkout',
    'manage_profile',
    'view_orders',
    'manage_addresses',
    // Permissions admin/dev
    'manage_products',
    'manage_categories',
    'manage_orders',
    'manage_users',
    'manage_articles',
    'manage_partners',
    'view_analytics',
    'access_dev_tools'
  ],
  admin: [
    // Mêmes permissions que dev pour MVP
    'view_public_content',
    'add_to_cart',
    'user_checkout', 
    'manage_profile',
    'view_orders',
    'manage_addresses',
    'manage_products',
    'manage_categories',
    'manage_orders',
    'manage_users',
    'manage_articles',
    'manage_partners',
    'view_analytics'
    // Note: pas 'access_dev_tools' pour admin
  ]
} as const

// === HELPERS ===

/**
 * Vérifie si un utilisateur a un rôle donné ou supérieur
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Vérifie si un utilisateur a accès à une route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  return ROLE_ROUTES[userRole].includes(route)
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission)
}

/**
 * Récupère la redirection appropriée pour un rôle
 */
export function getRoleRedirect(role: UserRole): string {
  return ROLE_REDIRECTS[role] || ROLE_REDIRECTS.guest
}

/**
 * Vérifie si un rôle est privilégié (dev ou admin)
 */
export function isPrivilegedRole(role: UserRole): boolean {
  return role === USER_ROLES.DEV || role === USER_ROLES.ADMIN
}

/**
 * Normalise le rôle depuis Supabase app_metadata
 */
export function normalizeRole(supabaseRole?: string): UserRole {
  switch (supabaseRole?.toLowerCase()) {
    case 'admin':
      return USER_ROLES.ADMIN
    case 'dev':
    case 'developer':
      return USER_ROLES.DEV
    case 'user':
      return USER_ROLES.USER
    default:
      return USER_ROLES.GUEST
  }
}