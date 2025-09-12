/**
 * API Client - HerbisVeritas MVP
 * 
 * Point d'entrée centralisé pour toutes les requêtes API
 * - Export du client ofetch configuré
 * - Re-export des types pour convenience
 * - Helpers pour construction URLs et queries
 */

// Export du client principal
export { api, apiClient } from './fetch-client'

// Export des types pour réutilisation
export type {
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiResponse,
  ApiClient
} from './fetch-client'

// Export des helpers
export { buildSupabaseQuery } from './fetch-client'

// Helpers convenience pour URLs fréquentes
export const apiRoutes = {
  // Products
  products: {
    list: '/products',
    byId: (id: string) => `/products?id=eq.${id}`,
    bySlug: (slug: string) => `/products?slug=eq.${slug}&select=*`
  },
  
  // Users
  users: {
    profile: '/profiles'
  },
  
  // Cart (future MVP extension)
  cart: {
    items: '/cart_items'
  },
  
  // Orders (future MVP extension)
  orders: {
    list: '/orders',
    byId: (id: string) => `/orders?id=eq.${id}`
  }
} as const

export type ApiRoutes = typeof apiRoutes