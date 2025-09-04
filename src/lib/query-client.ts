'use client'

/**
 * TanStack Query v5 Configuration Optimisée
 * 
 * QueryClient centralisé avec cache strategy adaptée aux patterns HerbisVeritas
 * Support mutations optimistes pour UX réactive
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'

// Configuration cache optimisée pour e-commerce
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache strategy par défaut : balance performance/fraîcheur
      staleTime: 1000 * 60 * 5, // 5 minutes - données considérées fraîches
      gcTime: 1000 * 60 * 30, // 30 minutes - garde en cache après unmount (était cacheTime v4)
      retry: 2, // 2 tentatives avant échec
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Performance réseau
      refetchOnWindowFocus: false, // Évite re-fetch inutiles
      refetchOnReconnect: 'always', // Re-fetch après reconnexion
      refetchOnMount: true, // Re-fetch au montage composant
    },
    
    mutations: {
      // Retry automatique mutations critiques
      retry: 1,
      retryDelay: 1000,
    }
  },
  
  // Cache global avec gestion erreurs
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Log erreurs sans casser l'app
      console.error(`Query failed [${query.queryKey.join(', ')}]:`, error)
      
      // Toast notifications pour UX (à implémenter plus tard)
      // toast.error('Erreur lors du chargement des données')
    },
    
    onSuccess: (_data, query) => {
      // Optionnel : analytics succès queries importantes
      if (query.queryKey[0] === 'products' || query.queryKey[0] === 'cart') {
        console.log(`Query succeeded [${query.queryKey.join(', ')}]`)
      }
    }
  }),
  
  // Cache mutations avec optimistic updates
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      console.error(`Mutation failed [${mutation.options.mutationKey?.join(', ') || 'unknown'}]:`, error)
      
      // Toast error specifique à la mutation
      // toast.error('Action échouée, veuillez réessayer')
    },
    
    onSuccess: (_data, _variables, _context, mutation) => {
      // Toast success pour mutations importantes (cart, orders)
      const mutationKey = mutation.options.mutationKey?.[0]
      if (mutationKey === 'addToCart' || mutationKey === 'createOrder') {
        // toast.success('Action réussie')
      }
    }
  })
})

// Types pour une meilleure DX
export type QueryKeys = {
  // Produits
  products: ['products', ...unknown[]]
  product: ['product', string]
  productsByCategory: ['products', 'category', string]
  
  // Panier  
  cart: ['cart', string?] // guest ou user ID
  cartCount: ['cart', 'count', string?]
  
  // Utilisateur
  user: ['user', string]
  userOrders: ['user', string, 'orders']
  
  // Categories
  categories: ['categories']
  category: ['category', string]
  categoryTree: ['categories', 'tree']
  
  // Articles/Magazine
  articles: ['articles']
  article: ['article', string]
  articlesByCategory: ['articles', 'category', string]
  
  // Partenaires
  partners: ['partners']
  partner: ['partner', string]
}

// Factory pour générer query keys consistantes
export const queryKeys = {
  // Produits
  products: {
    all: () => ['products'] as const,
    lists: () => ['products', 'list'] as const,
    list: (filters: Record<string, unknown>) => ['products', 'list', filters] as const,
    details: () => ['products', 'detail'] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    byCategory: (categorySlug: string) => ['products', 'category', categorySlug] as const,
    search: (query: string) => ['products', 'search', query] as const,
  },
  
  // Panier
  cart: {
    all: () => ['cart'] as const,
    detail: (sessionId?: string) => ['cart', sessionId || 'guest'] as const,
    count: (sessionId?: string) => ['cart', 'count', sessionId || 'guest'] as const,
  },
  
  // Categories
  categories: {
    all: () => ['categories'] as const,
    tree: () => ['categories', 'tree'] as const,
    detail: (slug: string) => ['category', slug] as const,
  },
  
  // Articles
  articles: {
    all: () => ['articles'] as const,
    lists: () => ['articles', 'list'] as const,
    list: (filters: Record<string, unknown>) => ['articles', 'list', filters] as const,
    detail: (slug: string) => ['article', slug] as const,
    byCategory: (categorySlug: string) => ['articles', 'category', categorySlug] as const,
  },
  
  // Utilisateur
  user: {
    detail: (id: string) => ['user', id] as const,
    orders: (id: string) => ['user', id, 'orders'] as const,
    favorites: (id: string) => ['user', id, 'favorites'] as const,
  }
} as const

// Configuration cache spécialisée par domaine
export const cacheConfigs = {
  // Produits : cache long pour catalog stable
  products: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 heure
  },
  
  // Panier : cache court pour données dynamiques
  cart: {
    staleTime: 1000 * 30, // 30 secondes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  },
  
  // Categories : cache très long pour hiérarchie stable
  categories: {
    staleTime: 1000 * 60 * 60, // 1 heure
    gcTime: 1000 * 60 * 60 * 24, // 24 heures
  },
  
  // Articles : cache moyen pour contenu évolutif
  articles: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  },
  
  // User data : cache court pour données sensibles
  user: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
  }
}

export { queryClient }
export default queryClient