/**
 * Types pour ContentGrid - Séparation responsabilités
 */

import { type VariantProps } from "class-variance-authority"
import * as React from "react"

// Configuration responsive columns personnalisée
export interface ResponsiveColumns {
  default?: number
  sm?: number  // >= 640px
  md?: number  // >= 768px
  lg?: number  // >= 1024px
  xl?: number  // >= 1280px
}

// Configuration pagination
export interface PaginationConfig {
  enabled: boolean
  pageSize: number
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
}

// Props du ContentGrid (sera référencé depuis variants)
export interface ContentGridBaseProps<T = any> {
  // === DONNÉES ===
  /** Items à afficher */
  items: T[]
  /** Fonction de rendu pour chaque item */
  renderItem: (item: T, index: number) => React.ReactNode
  
  // === LAYOUT ===
  /** Configuration colonnes responsive personnalisée */
  columns?: ResponsiveColumns
  /** Classe CSS personnalisée */
  className?: string
  
  // === PAGINATION ===
  /** Configuration pagination */
  pagination?: PaginationConfig
  
  // === ÉTATS ===
  /** État de chargement */
  isLoading?: boolean
  /** Nombre d'éléments skeleton à afficher */
  loadingCount?: number
  /** Erreur d'affichage */
  error?: string | null
  /** Message si vide */
  emptyMessage?: string
  /** Titre de la grille */
  title?: string
  /** Description de la grille */
  description?: string
  
  // === PERFORMANCE ===
  /** Activer virtualisation (grandes listes) */
  virtualized?: boolean
  /** Hauteur des items pour virtualisation */
  itemHeight?: number
  /** Lazy loading des images */
  lazyLoad?: boolean
  
  // === ACTIONS ===
  /** Actions globales (filtres, tri, etc.) */
  actions?: React.ReactNode
  /** Toggle vue grille/liste */
  allowViewToggle?: boolean
  /** Vue actuelle */
  currentView?: 'grid' | 'list'
  /** Callback changement vue */
  onViewChange?: (view: 'grid' | 'list') => void
}