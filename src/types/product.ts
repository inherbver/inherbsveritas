// Types produits MVP alignés sur DATABASE_SCHEMA_MVP.md

export type ProductLabel = 
  | 'recolte_main'           // "Récolté à la main"
  | 'bio'                    // "Bio"
  | 'origine_occitanie'      // "Origine Occitanie"
  | 'partenariat_producteurs' // "Partenariat producteurs locaux"
  | 'rituel_bien_etre'       // "Rituel de bien-être"
  | 'rupture_recolte'        // "Rupture de récolte"
  | 'essence_precieuse'      // "Essence précieuse"

export interface Product {
  id: string
  slug: string
  category_id?: string
  
  // Informations de base
  name: string
  description_short?: string
  description_long?: string
  
  // Commerce
  price: number
  currency: string
  stock: number
  unit: string
  
  // Médias
  image_url?: string
  
  // Spécificités cosmétique HerbisVeritas
  inci_list?: string[]
  labels: ProductLabel[]
  
  // États
  status: string
  is_active: boolean
  is_new?: boolean
  is_on_promotion?: boolean
  
  // Champs détaillés ProductDetail
  properties?: string
  compositionText?: string
  usageInstructions?: string

  // i18n JSONB
  translations?: Record<string, {
    name?: string
    description_short?: string
    description_long?: string
  }>
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface ProductCardProps {
  /** Product data */
  product: Product
  /** Callback when adding to cart */
  onAddToCart?: (product: Product) => Promise<void>
  /** Callback when toggling favorite */
  onToggleFavorite?: (product: Product) => void
  /** Visual variant */
  variant?: 'default' | 'compact'
  /** Custom className */
  className?: string
  /** Loading state */
  isLoading?: boolean
}

export interface ProductFilters {
  category?: string
  labels?: ProductLabel[]
  priceMin?: number
  priceMax?: number
  search?: string
}

// Label display mapping
export const LABEL_DISPLAY: Record<ProductLabel, string> = {
  'recolte_main': 'Récolté à la main',
  'bio': 'Bio',
  'origine_occitanie': 'Origine Occitanie',
  'partenariat_producteurs': 'Partenariat producteurs',
  'rituel_bien_etre': 'Rituel bien-être',
  'rupture_recolte': 'Rupture de récolte',
  'essence_precieuse': 'Essence précieuse'
}

// Badge variant mapping for labels
export const LABEL_BADGE_VARIANTS: Record<ProductLabel, string> = {
  'bio': 'bio',
  'recolte_main': 'recolte',
  'origine_occitanie': 'origine',
  'partenariat_producteurs': 'partenariat',
  'rituel_bien_etre': 'rituel',
  'rupture_recolte': 'rupture',
  'essence_precieuse': 'essence'
}