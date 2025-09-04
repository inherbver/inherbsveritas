'use client'

/**
 * useCartQuery - Hook TanStack Query pour queries panier
 * 
 * Data fetching optimisé panier avec cache adaptatif
 * Support guest sessions + authenticated users
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { queryKeys, cacheConfigs } from '@/lib/query-client'
import { CartItem } from './use-cart-mutation'
import { Product } from '@/types/product'

// Types réponses API
export interface CartResponse {
  items: CartItem[]
  total_items: number
  subtotal: number
  tax_amount?: number
  total_amount: number
  currency: string
  session_id?: string
  user_id?: string
}

export interface CartSummary {
  count: number
  subtotal: number
  currency: string
}

// Simulation API calls (à remplacer par Supabase)
const cartQueryApi = {
  getCart: async (sessionId?: string): Promise<CartResponse> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock data - à remplacer par appel Supabase
    const mockItems: CartItem[] = [
      {
        id: 'cart-1',
        product_id: 'prod-1',
        session_id: sessionId || 'guest',
        quantity: 2,
        unit_price: 29.99,
        product: {
          id: 'prod-1',
          name: 'Sérum Vitamine C Bio',
          slug: 'serum-vitamine-c-bio',
          price: 29.99,
          currency: 'EUR',
          unit: 'ml',
          images: ['/products/serum-vitamine-c.jpg'],
          description: 'Sérum anti-âge à la vitamine C naturelle',
          stock: 15,
          is_active: true,
          status: 'active',
          labels: ['bio', 'vegan'],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        } as Product,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }
    ]
    
    const subtotal = mockItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
    
    return {
      items: mockItems,
      total_items: mockItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      total_amount: subtotal,
      currency: 'EUR',
      session_id: sessionId || 'guest'
    }
  },
  
  getCartCount: async (_sessionId?: string): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Mock - à remplacer
    return 2
  },
  
  getCartSummary: async (_sessionId?: string): Promise<CartSummary> => {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    return {
      count: 2,
      subtotal: 59.98,
      currency: 'EUR'
    }
  }
}

// Hook principal pour récupérer le panier complet
export function useCart(sessionId?: string): UseQueryResult<CartResponse, Error> {
  return useQuery({
    queryKey: queryKeys.cart.detail(sessionId),
    queryFn: () => cartQueryApi.getCart(sessionId),
    
    // Configuration cache adaptée aux données panier
    ...cacheConfigs.cart,
    
    // Gestion erreurs
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
    
    // Meta pour debugging
    meta: {
      errorMessage: 'Erreur lors du chargement du panier'
    }
  })
}

// Hook léger pour le compteur panier (header/badge)
export function useCartCount(sessionId?: string): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: queryKeys.cart.count(sessionId),
    queryFn: () => cartQueryApi.getCartCount(sessionId),
    
    // Cache très court pour compteur réactif
    staleTime: 1000 * 15, // 15 secondes
    gcTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    
    // Fallback à 0 pour UX
    placeholderData: 0,
    
    meta: {
      errorMessage: 'Erreur compteur panier'
    }
  })
}

// Hook pour résumé panier (prix, nombre items)
export function useCartSummary(sessionId?: string): UseQueryResult<CartSummary, Error> {
  return useQuery({
    queryKey: [...queryKeys.cart.detail(sessionId), 'summary'],
    queryFn: () => cartQueryApi.getCartSummary(sessionId),
    
    // Cache moyen pour données calculées
    staleTime: 1000 * 30, // 30 secondes
    gcTime: 1000 * 60 * 5, // 5 minutes
    
    meta: {
      errorMessage: 'Erreur résumé panier'
    }
  })
}

// Hook combiné pour page panier complète
export function useCartPage(sessionId?: string) {
  const cartQuery = useCart(sessionId)
  const countQuery = useCartCount(sessionId)
  const summaryQuery = useCartSummary(sessionId)
  
  return {
    cart: cartQuery.data,
    count: countQuery.data || 0,
    summary: summaryQuery.data,
    
    // États combinés
    isLoading: cartQuery.isLoading || summaryQuery.isLoading,
    isFetching: cartQuery.isFetching || countQuery.isFetching || summaryQuery.isFetching,
    
    // Erreurs
    error: cartQuery.error || countQuery.error || summaryQuery.error,
    
    // Actions
    refetch: () => {
      cartQuery.refetch()
      countQuery.refetch()
      summaryQuery.refetch()
    }
  }
}

// Hook pour vérifier si produit dans panier
export function useIsInCart(productId: string, sessionId?: string) {
  const { data: cart } = useCart(sessionId)
  
  return {
    isInCart: cart?.items.some(item => item.product_id === productId) || false,
    cartItem: cart?.items.find(item => item.product_id === productId),
    quantity: cart?.items.find(item => item.product_id === productId)?.quantity || 0
  }
}

// Types exports
