/**
 * @file Hook pour gestion des filtres produits - Semaine 4 MVP
 * @description Logique métier centralisée pour les filtres boutique
 */

'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { ProductLabel } from '@/types/database'
import type { FilterState } from '@/lib/filters/filter-types'

interface UseProductFiltersProps {
  onFiltersChange?: ((filters: FilterState) => void) | undefined
}

export function useProductFilters({ onFiltersChange }: UseProductFiltersProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  /**
   * Met à jour les filtres avec navigation URL
   */
  const updateFilters = React.useCallback((updates: {
    category?: string | null
    labels?: ProductLabel[]
    search?: string
  }) => {
    const params = new URLSearchParams(searchParams)
    
    // Mise à jour catégorie
    if (updates.category !== undefined) {
      if (updates.category) {
        params.set('category', updates.category)
      } else {
        params.delete('category')
      }
    }
    
    // Mise à jour labels
    if (updates.labels !== undefined) {
      if (updates.labels.length > 0) {
        params.set('labels', updates.labels.join(','))
      } else {
        params.delete('labels')
      }
    }
    
    // Mise à jour recherche
    if (updates.search !== undefined) {
      if (updates.search.trim()) {
        params.set('search', updates.search.trim())
      } else {
        params.delete('search')
      }
    }
    
    // Reset à la page 1 quand on change les filtres
    params.delete('page')
    
    router.push(`${pathname}?${params.toString()}`)
    onFiltersChange?.(updates as FilterState)
  }, [router, pathname, searchParams, onFiltersChange])

  /**
   * Efface tous les filtres
   */
  const handleClearAll = React.useCallback(() => {
    updateFilters({ category: null, labels: [], search: '' })
  }, [updateFilters])

  /**
   * Efface une catégorie spécifique
   */
  const handleClearCategory = React.useCallback(() => {
    updateFilters({ category: null })
  }, [updateFilters])

  /**
   * Efface un label spécifique
   */
  const handleClearLabel = React.useCallback((label: ProductLabel, currentLabels: ProductLabel[]) => {
    updateFilters({ labels: currentLabels.filter(l => l !== label) })
  }, [updateFilters])

  /**
   * Efface la recherche
   */
  const handleClearSearch = React.useCallback(() => {
    updateFilters({ search: '' })
  }, [updateFilters])

  /**
   * Met à jour la recherche
   */
  const handleSearchChange = React.useCallback((search: string) => {
    updateFilters({ search })
  }, [updateFilters])

  /**
   * Met à jour la catégorie
   */
  const handleCategoryChange = React.useCallback((category: string | null) => {
    updateFilters({ category })
  }, [updateFilters])

  /**
   * Met à jour les labels
   */
  const handleLabelsChange = React.useCallback((labels: ProductLabel[]) => {
    updateFilters({ labels })
  }, [updateFilters])

  return {
    updateFilters,
    handleClearAll,
    handleClearCategory,
    handleClearLabel,
    handleClearSearch,
    handleSearchChange,
    handleCategoryChange,
    handleLabelsChange
  }
}