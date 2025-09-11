/**
 * ROOT: REACT QUERY POLICY — PRODUCTS (LIST)
 * QueryKey: ['products', { category, labels, search, page, limit, DTO_VERSION: 1 }]
 * Cache: staleTime=60_000ms; placeholderData=page précédente
 * select(): map DTO -> ViewModel via mapper (jamais dans les composants)
 * Retry: 3x avec backoff exponentiel
 * Interdits: fetch direct dans composants; keys non déterministes; mutation state côté client
 */

'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { 
  type ProductViewModel,
  type ProductFilters,
  type ProductPagination,
  DTO_VERSION
} from '@/lib/types/domain/product'
import { mapProductDTOListToViewModelList, normalizeLocale } from '@/lib/mappers/product.mapper'

interface UseProductsOptions {
  filters?: ProductFilters
  page?: number
  limit?: number
  locale?: string
  enabled?: boolean
}

interface UseProductsResult {
  products: ProductViewModel[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  pagination: ProductPagination | undefined
  refetch: () => void
  isFetching: boolean
  isPreviousData: boolean
}

/**
 * Hook React Query pour récupérer la liste des produits
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const { 
    filters, 
    page = 1, 
    limit = 24, 
    locale = 'fr',
    enabled = true 
  } = options

  const normalizedLocale = normalizeLocale(locale)

  // Query key déterministe avec DTO_VERSION
  const queryKey = [
    'products',
    {
      category_id: filters?.category_id,
      labels: filters?.labels?.sort(), // Sort pour key stable
      search: filters?.search,
      priceMin: filters?.priceMin,
      priceMax: filters?.priceMax,
      inStock: filters?.inStock,
      page,
      limit,
      locale: normalizedLocale,
      DTO_VERSION
    }
  ]

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })

      // Ajouter les filtres à la query
      if (filters?.category_id) {
        searchParams.append('category', filters.category_id)
      }

      if (filters?.labels && filters.labels.length > 0) {
        searchParams.append('labels', filters.labels.join(','))
      }

      if (filters?.search) {
        searchParams.append('search', filters.search)
      }

      if (filters?.priceMin !== undefined) {
        searchParams.append('priceMin', filters.priceMin.toString())
      }

      if (filters?.priceMax !== undefined) {
        searchParams.append('priceMax', filters.priceMax.toString())
      }

      if (filters?.inStock !== undefined) {
        searchParams.append('inStock', filters.inStock.toString())
      }

      const response = await fetch(`/api/products?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.products || !Array.isArray(data.products)) {
        throw new Error('Invalid API response: products array missing')
      }

      return {
        products: data.products,
        pagination: data.pagination
      }
    },
    select: (data) => ({
      products: mapProductDTOListToViewModelList(data.products, normalizedLocale),
      pagination: data.pagination
    }),
    enabled,
    staleTime: 60_000, // 1 minute
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000)
  })

  return {
    products: query.data?.products ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    pagination: query.data?.pagination,
    refetch: query.refetch,
    isFetching: query.isFetching,
    isPreviousData: query.isPlaceholderData
  }
}