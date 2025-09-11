/**
 * ROOT: DATA CONTRACT — PRODUCTS MVP (Source of Truth)
 * Table unique: products (13 tables MVP - pas de product_variants/product_images)
 * DTO_VERSION: 1
 * ProductDTO:
 *  - id: uuid; slug: string(unique); name: string; description_short/long: string|null
 *  - status: 'active'|'inactive'|'draft'
 *  - price: number (en unités 19.90, PAS en cents); currency: 'EUR'
 *  - image_url: string|null (UNE seule image MVP)
 *  - labels: ProductLabel[] (7 labels HerbisVeritas fixes)
 *  - category_id: uuid|null; inci_list: string[]|null
 *  - stock: number; unit: string; is_active: boolean; is_new: boolean
 *  - translations: JSONB { fr?: {...}, en?: {...} } (inline, pas table séparée)
 *  - timestamps: created_at, updated_at
 * Invariants:
 *  - Tableaux optionnels => [] (jamais `undefined`)
 *  - Prix TOUJOURS en unités (pas cents - différence avec dataflow générique)
 *  - Labels: enum strict 7 valeurs HerbisVeritas (pas extensible MVP)
 *  - Changement de shape => bump DTO_VERSION + MAJ clés React Query + tests + docs
 */

// Version DTO pour cache invalidation
export const DTO_VERSION = 1

// Labels : simple string array pour badges et filtres

// Statuts produit MVP
export type ProductStatus = 'active' | 'inactive' | 'draft'

// Traductions i18n inline (JSONB)
export interface ProductTranslations {
  fr: {
    name?: string
    description_short?: string
    description_long?: string
  }
  en: {
    name?: string
    description_short?: string
    description_long?: string
  }
}

// DTO Principal - Source of Truth pour cache et API
export interface ProductDTO {
  // Identifiants
  id: string
  slug: string
  category_id: string | null
  
  // Informations de base
  name: string
  description_short: string | null
  description_long: string | null
  
  // Commerce (prix EN UNITÉS, pas cents)
  price: number
  currency: string
  stock: number
  unit: string
  
  // Média (UNE seule image MVP)
  image_url: string | null
  
  // Spécificités cosmétique HerbisVeritas
  inci_list: string[]
  labels: string[]
  
  // États
  status: ProductStatus
  is_active: boolean
  is_new: boolean
  
  // i18n JSONB inline
  translations: ProductTranslations
  
  // Timestamps
  created_at: string
  updated_at: string
}

// ViewModel pour UI (après passage par mapper)
export interface ProductViewModel {
  // Identifiants
  id: string
  slug: string
  
  // Affichage localisé
  name: string
  description_short: string | null
  description_long: string | null
  
  // Commerce formaté
  price: number
  priceFormatted: string
  currency: string
  stock: number
  unit: string
  isInStock: boolean
  isLowStock: boolean
  
  // Média avec fallback
  image_url: string
  image_alt: string
  
  // Cosmétique
  inci_list: string[]
  labels: string[]
  
  // États UI
  is_active: boolean
  is_new: boolean
  
  // Métadonnées
  created_at: string
  updated_at: string
}

// Props composants UI
export interface ProductCardProps {
  product: ProductViewModel
  onAddToCart?: (product: ProductViewModel) => Promise<void>
  onToggleFavorite?: (product: ProductViewModel) => void
  variant?: 'default' | 'compact'
  className?: string
  isLoading?: boolean
}

export interface ProductGridProps {
  products: ProductViewModel[]
  loading?: boolean
  className?: string
}

// Filtres de recherche
export interface ProductFilters {
  category_id?: string
  labels?: string[]
  priceMin?: number
  priceMax?: number
  search?: string
  inStock?: boolean
}

// Pagination
export interface ProductPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

// Réponse API standardisée
export interface ProductsResponse {
  products: ProductDTO[]
  pagination?: ProductPagination
}

export interface ProductResponse {
  product: ProductDTO
}

// Constantes métier
export const PRODUCT_CONSTANTS = {
  LOW_STOCK_THRESHOLD: 10,
  DEFAULT_CURRENCY: 'EUR',
  DEFAULT_UNIT: 'pièce',
  DEFAULT_PAGE_SIZE: 24,
  MAX_PAGE_SIZE: 100,
} as const

