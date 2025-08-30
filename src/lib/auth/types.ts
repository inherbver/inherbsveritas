/**
 * Types Auth - HerbisVeritas V2 MVP
 * Définit les types pour authentification et RBAC
 */

// Rôles système MVP (strictement 3 rôles)
export type UserRole = 'user' | 'admin' | 'dev'

// Session utilisateur avec custom claims
export interface UserSession {
  userId: string
  email: string
  role: UserRole
  exp: number
  iat: number
}

// Métadonnées JWT Supabase
export interface SupabaseUserMetadata {
  role?: UserRole
  [key: string]: any
}

// Configuration protection routes
export interface RouteProtection {
  path: string
  allowedRoles: UserRole[]
  redirectTo?: string
}

// Permissions par rôle (aligné avec 002_auth_rbac_security.sql)
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  user: [
    'users:read_own',
    'users:update_own', 
    'products:read_active',
    'orders:read_own',
    'orders:create_own',
    'articles:read_published',
    'carts:full_own'
  ],
  admin: [
    'users:admin',
    'products:admin', 
    'orders:admin',
    'articles:admin',
    'categories:admin',
    'partners:admin',
    'featured_items:admin'
  ],
  dev: [
    'users:admin',
    'products:admin',
    'orders:admin', 
    'articles:admin',
    'categories:admin',
    'partners:admin',
    'featured_items:admin',
    'newsletter_subscribers:admin',
    'addresses:admin',
    'carts:admin',
    'cart_items:admin',
    'order_items:admin',
    'next_events:admin'
  ]
}

// Matrix des routes protégées MVP
export const PROTECTED_ROUTES: RouteProtection[] = [
  // User routes
  { path: '/profile', allowedRoles: ['user', 'admin', 'dev'] },
  { path: '/profile/addresses', allowedRoles: ['user', 'admin', 'dev'] },
  { path: '/profile/orders', allowedRoles: ['user', 'admin', 'dev'] },
  
  // Admin routes
  { path: '/admin', allowedRoles: ['admin', 'dev'], redirectTo: '/unauthorized' },
  { path: '/admin/users', allowedRoles: ['admin', 'dev'], redirectTo: '/unauthorized' },
  { path: '/admin/products', allowedRoles: ['admin', 'dev'], redirectTo: '/unauthorized' },
  { path: '/admin/orders', allowedRoles: ['admin', 'dev'], redirectTo: '/unauthorized' },
  { path: '/admin/articles', allowedRoles: ['admin', 'dev'], redirectTo: '/unauthorized' },
  { path: '/admin/categories', allowedRoles: ['admin', 'dev'], redirectTo: '/unauthorized' },
  { path: '/admin/partners', allowedRoles: ['admin', 'dev'], redirectTo: '/unauthorized' },
  
  // Dev routes
  { path: '/dev', allowedRoles: ['dev'], redirectTo: '/unauthorized' },
  { path: '/dev/database', allowedRoles: ['dev'], redirectTo: '/unauthorized' },
  { path: '/dev/migrations', allowedRoles: ['dev'], redirectTo: '/unauthorized' },
  
  // API Routes protection
  { path: '/api/admin', allowedRoles: ['admin', 'dev'] },
  { path: '/api/dev', allowedRoles: ['dev'] },
  { path: '/api/users', allowedRoles: ['user', 'admin', 'dev'] }
]

// Routes publiques (pas de auth requise)
export const PUBLIC_ROUTES = [
  '/',
  '/boutique',
  '/boutique/categories',
  '/boutique/produits',
  '/magazine',
  '/magazine/articles', 
  '/partenaires',
  '/contact',
  '/login',
  '/signup',
  '/auth',
  '/unauthorized'
]