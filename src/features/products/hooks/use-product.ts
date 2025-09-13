/**
 * ROOT: REACT QUERY POLICY — PRODUCT (DETAIL)
 * QueryKey: ['product', { slug, DTO_VERSION: 1 }]
 * Cache: staleTime=300_000ms (5min - contenu stable)
 * Règles: toujours passer par mapper -> ViewModel; jamais d'accès DB brut depuis l'UI
 * Enabled: uniquement si slug fourni et non vide
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { 
  type ProductViewModel,
  DTO_VERSION
} from '@/lib/types/domain/product'
import { mapProductDTOToViewModel, normalizeLocale } from '@/lib/mappers/product.mapper'

interface UseProductOptions {
  slug: string
  locale?: string
  enabled?: boolean
}

interface UseProductResult {
  product: ProductViewModel | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
  isFetching: boolean
}

/**
 * Hook React Query pour récupérer le détail d'un produit
 */
export function useProduct(options: UseProductOptions): UseProductResult {
  const { slug, locale = 'fr', enabled = true } = options
  
  const normalizedLocale = normalizeLocale(locale)
  
  // Query key déterministe avec DTO_VERSION
  const queryKey = [
    'product',
    {
      slug,
      locale: normalizedLocale,
      DTO_VERSION
    }
  ]

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!slug || slug.trim() === '') {
        throw new Error('Product slug is required')
      }

      const response = await fetch(`/api/products/${encodeURIComponent(slug)}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found')
        }
        throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.product) {
        throw new Error('Invalid API response: product missing')
      }

      return data.product
    },
    select: (productDTO) => mapProductDTOToViewModel(productDTO, normalizedLocale),
    enabled: enabled && Boolean(slug?.trim()),
    staleTime: 300_000, // 5 minutes (contenu produit stable)
    retry: (failureCount, error) => {
      // Ne pas retry les 404 (produit inexistant)
      if (error.message === 'Product not found') {
        return false
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000)
  })

  return {
    product: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching
  }
}

/**
 * Hook pour précharger un produit (utile pour hover states)
 */
export function usePrefetchProduct(slug: string) {
  // Retourne une fonction de prefetch
  return () => {
    if (!slug?.trim()) return

    // TODO: Implémenter avec queryClient.prefetchQuery quand disponible
    fetch(`/api/products/${encodeURIComponent(slug)}`).catch(() => {
      // Ignore les erreurs de prefetch
    })
  }
}