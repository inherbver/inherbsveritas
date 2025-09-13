/**
 * Tests Integration - Filtrage Labels Simplifiés
 * Validation que les labels string simple fonctionnent pour filtrage
 * Tests avec mock Supabase et React Query
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useProducts } from '@/hooks/use-products'
import type { ProductDTO } from '@/lib/types/domain/product'

// Mock Supabase
const mockSupabaseSelect = jest.fn()
const mockSupabaseFrom = jest.fn(() => ({
  select: mockSupabaseSelect,
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis()
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockSupabaseFrom
  })
}))

// Mock fetch pour API routes
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Labels Filtering Integration - MVP', () => {
  let queryClient: QueryClient
  
  const mockProducts: ProductDTO[] = [
    {
      id: '1',
      slug: 'creme-bio',
      name: 'Crème Bio',
      description_short: null,
      description_long: null,
      price: 19.90,
      currency: 'EUR',
      stock: 10,
      unit: 'pièce',
      image_url: null,
      inci_list: ['Aqua'],
      labels: ['bio', 'artisanal'], // Labels simples
      status: 'active',
      is_active: true,
      is_new: false,
      translations: { fr: {}, en: {} },
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
      category_id: null
    },
    {
      id: '2', 
      slug: 'savon-local',
      name: 'Savon Local',
      description_short: null,
      description_long: null,
      price: 8.50,
      currency: 'EUR',
      stock: 5,
      unit: 'pièce',
      image_url: null,
      inci_list: ['Sodium Palmitate'],
      labels: ['local', 'artisanal'], // Labels différents
      status: 'active',
      is_active: true,
      is_new: false,
      translations: { fr: {}, en: {} },
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
      category_id: null
    },
    {
      id: '3',
      slug: 'huile-premium',
      name: 'Huile Premium',
      description_short: null,
      description_long: null,
      price: 45.00,
      currency: 'EUR', 
      stock: 3,
      unit: 'pièce',
      image_url: null,
      inci_list: ['Olea Europaea'],
      labels: ['bio', 'premium', 'origine_occitanie'], // Mix de labels
      status: 'active',
      is_active: true,
      is_new: false,
      translations: { fr: {}, en: {} },
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
      category_id: null
    }
  ]

  const createTestWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })

    return ({ children }: { children: React.ReactNode }) => (
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    queryClient?.clear()
  })

  describe('Filtrage Labels Simple', () => {
    it('should filter products by single label', async () => {
      // Mock API response pour label "bio"
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: [mockProducts[0], mockProducts[2]] // Produits avec "bio"
        })
      })

      const wrapper = createTestWrapper()
      
      const { result } = renderHook(
        () => useProducts({ filters: { labels: ['bio'] } }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/products?labels=bio',
        expect.any(Object)
      )
      
      expect(result.current.products).toHaveLength(2)
      expect(result.current.products[0]?.labels).toContain('bio')
      expect(result.current.products[1]?.labels).toContain('bio')
    })

    it('should filter products by multiple labels (OR logic)', async () => {
      // Mock API response pour labels "bio" OU "local"
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: mockProducts // Tous les produits ont au moins un des labels
        })
      })

      const wrapper = createTestWrapper()
      
      const { result } = renderHook(
        () => useProducts({ filters: { labels: ['bio', 'local'] } }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/products?labels=bio%2Clocal', // URL encoded
        expect.any(Object)
      )
      
      expect(result.current.products).toHaveLength(3)
    })

    it('should handle empty labels filter', async () => {
      // Mock API response sans filtrage labels
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: mockProducts
        })
      })

      const wrapper = createTestWrapper()
      
      const { result } = renderHook(
        () => useProducts({ filters: { labels: [] } }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Pas de paramètre labels dans l'URL
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/products',
        expect.any(Object)
      )
    })

    it('should handle nonexistent labels gracefully', async () => {
      // Mock API response pour label inexistant
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: [] // Aucun produit
        })
      })

      const wrapper = createTestWrapper()
      
      const { result } = renderHook(
        () => useProducts({ filters: { labels: ['nonexistent_label'] } }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.products).toHaveLength(0)
    })
  })

  describe('Combinaison Filtres', () => {
    it('should combine labels with price range', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: [mockProducts[0]] // Seul le premier match bio + prix
        })
      })

      const wrapper = createTestWrapper()
      
      const { result } = renderHook(
        () => useProducts({ filters: {
          labels: ['bio'], 
          priceMin: 15,
          priceMax: 25
        }}),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/products?labels=bio&priceMin=15&priceMax=25',
        expect.any(Object)
      )
    })

    it('should combine labels with search term', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: [mockProducts[0]]
        })
      })

      const wrapper = createTestWrapper()
      
      const { result } = renderHook(
        () => useProducts({ filters: {
          labels: ['bio'], 
          search: 'crème'
        }}),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/products?labels=bio&search=cr%C3%A8me', // URL encoded avec accents
        expect.any(Object)
      )
    })
  })

  describe('Performance Filtrage', () => {
    it('should debounce rapid filter changes', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ products: [] })
      })

      const wrapper = createTestWrapper()
      
      const { result, rerender } = renderHook(
        ({ labels }) => useProducts({ filters: { labels } }),
        { 
          wrapper,
          initialProps: { labels: ['bio'] }
        }
      )

      // Changements rapides
      rerender({ labels: ['bio', 'artisanal'] })
      rerender({ labels: ['bio', 'artisanal', 'local'] })
      rerender({ labels: ['local'] })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Doit faire un seul appel avec les derniers filtres
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenLastCalledWith(
        '/api/products?labels=local',
        expect.any(Object)
      )
    })
  })

  describe('Client-Side Label Logic', () => {
    it('should implement client-side label filtering as fallback', () => {
      const products = mockProducts
      
      // Fonction utilitaire pour filtrage côté client
      const filterByLabels = (products: ProductDTO[], targetLabels: string[]) => {
        if (targetLabels.length === 0) return products
        
        return products.filter(product => 
          targetLabels.some(label => product.labels.includes(label))
        )
      }

      // Test filtrage bio
      const bioProducts = filterByLabels(products, ['bio'])
      expect(bioProducts).toHaveLength(2)
      expect(bioProducts.every(p => p.labels.includes('bio'))).toBe(true)

      // Test filtrage multiple
      const artisanalProducts = filterByLabels(products, ['artisanal'])
      expect(artisanalProducts).toHaveLength(2)
      
      // Test filtrage inexistant
      const noneProducts = filterByLabels(products, ['nonexistent'])
      expect(noneProducts).toHaveLength(0)
    })

    it('should handle label case sensitivity correctly', () => {
      const products = mockProducts
      
      const filterByLabels = (products: ProductDTO[], targetLabels: string[]) => {
        return products.filter(product => 
          targetLabels.some(label => 
            product.labels.some(productLabel => 
              productLabel.toLowerCase() === label.toLowerCase()
            )
          )
        )
      }

      // Test case insensitive
      const bioProducts = filterByLabels(products, ['BIO'])
      expect(bioProducts).toHaveLength(2)
      
      const mixedCaseProducts = filterByLabels(products, ['Bio', 'LOCAL'])
      expect(mixedCaseProducts).toHaveLength(3) // Tous les produits
    })
  })
})