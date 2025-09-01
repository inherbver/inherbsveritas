'use client'

import { useState, useEffect, useCallback } from 'react'
import { Product, ProductFilters } from '@/types/product'

interface UseProductsResult {
  products: Product[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    totalPages: number
    total: number
    hasMore: boolean
  }
  refetch: () => void
}

interface UseProductsOptions {
  filters?: ProductFilters
  page?: number
  limit?: number
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    total: 0,
    hasMore: false
  })

  const { filters, page = 1, limit = 12 } = options

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })

      if (filters?.category) {
        searchParams.append('category', filters.category)
      }

      if (filters?.labels && filters.labels.length > 0) {
        searchParams.append('labels', filters.labels.join(','))
      }

      if (filters?.search) {
        searchParams.append('search', filters.search)
      }

      const response = await fetch(`/api/products?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      setProducts(data.products || [])
      setPagination(data.pagination || {
        page: 1,
        totalPages: 0,
        total: 0,
        hasMore: false
      })

    } catch (error) {
      console.error('Error fetching products:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement des produits')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts
  }
}