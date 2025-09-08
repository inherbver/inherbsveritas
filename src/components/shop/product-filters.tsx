/**
 * @file Composant principal filtres boutique - Semaine 4 MVP
 * @description Orchestration des filtres réactifs avec navigation côté client
 */

'use client'

import { cn } from '@/lib/utils'
import { useProductFilters } from '@/hooks/use-product-filters'
import { SearchFilter } from './search-filter'
import { CategoryFilter } from './category-filter'
import { LabelsFilter } from './labels-filter'
import { ActiveFilters } from './active-filters'
import type { ProductFiltersProps } from '@/lib/filters/filter-types'

/**
 * Composant principal gérant tous les filtres avec navigation
 */
export function ProductFilters({ 
  className,
  categories = [],
  selectedCategoryId,
  selectedLabels = [],
  searchTerm = '',
  onFiltersChange
}: ProductFiltersProps) {
  const {
    handleClearAll,
    handleClearCategory,
    handleClearLabel,
    handleClearSearch,
    handleSearchChange,
    handleCategoryChange,
    handleLabelsChange
  } = useProductFilters({ onFiltersChange })

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filtres actifs */}
      <ActiveFilters
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        selectedLabels={selectedLabels}
        searchTerm={searchTerm}
        onClearCategory={handleClearCategory}
        onClearLabel={(label) => handleClearLabel(label, selectedLabels)}
        onClearSearch={handleClearSearch}
        onClearAll={handleClearAll}
      />
      
      {/* Recherche */}
      <SearchFilter
        value={searchTerm}
        onSearchChange={handleSearchChange}
      />
      
      {/* Catégories */}
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={handleCategoryChange}
      />
      
      {/* Labels */}
      <LabelsFilter
        selectedLabels={selectedLabels}
        onLabelsChange={handleLabelsChange}
      />
    </div>
  )
}

// Exports nommés pour compatibility
export { SearchFilter } from './search-filter'
export { CategoryFilter } from './category-filter'
export { LabelsFilter } from './labels-filter'
export { ActiveFilters } from './active-filters'