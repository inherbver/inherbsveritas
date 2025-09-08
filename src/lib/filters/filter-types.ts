/**
 * @file Types et constantes pour les filtres produits - Semaine 4 MVP
 * @description Définitions TypeScript pour les filtres boutique
 */

import type { CategoryWithChildren, ProductLabel } from '@/types/database'

// Re-export for convenience
export type { CategoryWithChildren, ProductLabel } from '@/types/database'

// Configuration labels HerbisVeritas
export const HERBIS_VERITAS_LABELS = [
  { key: 'bio' as ProductLabel, label: 'Bio', description: 'Certification biologique' },
  { key: 'recolte_main' as ProductLabel, label: 'Récolté à la main', description: 'Récolte manuelle traditionnelle' },
  { key: 'origine_occitanie' as ProductLabel, label: 'Origine Occitanie', description: 'Produits de notre région' },
  { key: 'partenariat_producteurs' as ProductLabel, label: 'Partenariat producteurs', description: 'Collaboration directe' },
  { key: 'rituel_bien_etre' as ProductLabel, label: 'Rituel bien-être', description: 'Pour votre routine beauté' },
  { key: 'essence_precieuse' as ProductLabel, label: 'Essence précieuse', description: 'Ingrédients rares et précieux' },
  { key: 'rupture_recolte' as ProductLabel, label: 'Rupture de récolte', description: 'Stock limité cette saison' }
] as const

// Interfaces communes
export interface FilterState {
  category?: string | null
  labels?: ProductLabel[]
  search?: string
}

export interface ProductFiltersProps {
  className?: string
  categories?: CategoryWithChildren[]
  selectedCategoryId?: string | undefined
  selectedLabels?: ProductLabel[]
  searchTerm?: string | undefined
  onFiltersChange?: ((filters: FilterState) => void) | undefined
}

export interface SearchFilterProps {
  value?: string
  onSearchChange?: (search: string) => void
  placeholder?: string
  className?: string
}

export interface CategoryFilterProps {
  categories?: CategoryWithChildren[]
  selectedCategoryId?: string | undefined
  onCategoryChange?: (categoryId: string | null) => void
  className?: string
}

export interface LabelsFilterProps {
  selectedLabels?: ProductLabel[]
  onLabelsChange?: (labels: ProductLabel[]) => void
  className?: string
}

export interface ActiveFiltersProps {
  categories?: CategoryWithChildren[]
  selectedCategoryId?: string | undefined
  selectedLabels?: ProductLabel[]
  searchTerm?: string | undefined
  onClearCategory?: () => void
  onClearLabel?: (label: ProductLabel) => void
  onClearSearch?: () => void
  onClearAll?: () => void
  className?: string
}