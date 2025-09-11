/**
 * ROOT: MAPPER — PRODUCTS MVP
 * Pipeline:
 *  DBRow (table products) -> ProductDTO (via schema) -> ProductViewModel (UI-ready)
 * Règles:
 *  - Prix RESTENT en unités (19.90, pas 1990 cents)
 *  - Arrays jamais `undefined` (-> [])
 *  - i18n: sélectionner champs localisés JSONB ou fallback documenté
 *  - image_url null => placeholder image par défaut
 *  - Labels: mapper enum -> display text via LABEL_DISPLAY
 * Interdits:
 *  - AUCUN accès réseau ni lecture storage
 *  - AUCUNE mutation globale
 *  - AUCUNE conversion prix (restent en unités)
 */

import { 
  type ProductDTO, 
  type ProductViewModel,
  LABEL_DISPLAY,
  PRODUCT_CONSTANTS
} from '@/lib/types/domain/product'
import { validateProductDBRow } from '@/lib/schemas/product'
import { formatPrice } from '@/lib/format/price'
import { getDefaultProductImage, getProductImageAlt } from '@/lib/images/product-images'

// Locale type pour i18n
type SupportedLocale = 'fr' | 'en'

/**
 * Convertit une row DB en ProductDTO validé
 */
export function mapDBRowToProductDTO(dbRow: unknown): ProductDTO {
  return validateProductDBRow(dbRow)
}

/**
 * Convertit un ProductDTO en ProductViewModel pour l'UI
 */
export function mapProductDTOToViewModel(
  dto: ProductDTO, 
  locale: SupportedLocale = 'fr'
): ProductViewModel {
  // Sélection des champs localisés avec fallback
  const localizedName = getLocalizedField(dto, locale, 'name') ?? dto.name
  const localizedShortDesc = getLocalizedField(dto, locale, 'description_short') ?? dto.description_short
  const localizedLongDesc = getLocalizedField(dto, locale, 'description_long') ?? dto.description_long
  
  // Formatage du prix (déjà en unités)
  const priceFormatted = formatPrice(dto.price, dto.currency as 'EUR', locale)
  
  // Image avec fallback
  const image_url = dto.image_url ?? getDefaultProductImage()
  const image_alt = getProductImageAlt(localizedName, dto.labels)
  
  // Conversion labels -> textes d'affichage
  const labelDisplayTexts = dto.labels.map(label => LABEL_DISPLAY[label])
  
  // Calculs stock
  const isInStock = dto.stock > 0
  const isLowStock = dto.stock > 0 && dto.stock <= PRODUCT_CONSTANTS.LOW_STOCK_THRESHOLD
  
  return {
    // Identifiants
    id: dto.id,
    slug: dto.slug,
    
    // Affichage localisé
    name: localizedName,
    description_short: localizedShortDesc,
    description_long: localizedLongDesc,
    
    // Commerce formaté (prix restent en unités)
    price: dto.price,
    priceFormatted,
    currency: dto.currency,
    stock: dto.stock,
    unit: dto.unit,
    isInStock,
    isLowStock,
    
    // Média avec fallback
    image_url,
    image_alt,
    
    // Cosmétique
    inci_list: dto.inci_list,
    labels: dto.labels,
    labelDisplayTexts,
    
    // États UI
    is_active: dto.is_active,
    is_new: dto.is_new,
    
    // Métadonnées
    created_at: dto.created_at,
    updated_at: dto.updated_at
  }
}

/**
 * Batch mapper pour listes de produits
 */
export function mapProductDTOListToViewModelList(
  dtos: ProductDTO[],
  locale: SupportedLocale = 'fr'
): ProductViewModel[] {
  return dtos.map(dto => mapProductDTOToViewModel(dto, locale))
}

/**
 * Mapper direct DB -> ViewModel (combine les 2 étapes)
 */
export function mapDBRowToViewModel(
  dbRow: unknown,
  locale: SupportedLocale = 'fr'
): ProductViewModel {
  const dto = mapDBRowToProductDTO(dbRow)
  return mapProductDTOToViewModel(dto, locale)
}

/**
 * Batch mapper direct DB -> ViewModel
 */
export function mapDBRowListToViewModelList(
  dbRows: unknown[],
  locale: SupportedLocale = 'fr'
): ProductViewModel[] {
  return dbRows.map(row => mapDBRowToViewModel(row, locale))
}

// Helpers privés

/**
 * Extrait un champ localisé du JSONB translations avec fallback
 */
function getLocalizedField(
  dto: ProductDTO,
  locale: SupportedLocale,
  field: 'name' | 'description_short' | 'description_long'
): string | null {
  // Priorité 1: champ localisé
  const localizedValue = dto.translations?.[locale]?.[field]
  if (localizedValue) return localizedValue
  
  // Priorité 2: fallback vers autre langue disponible
  const fallbackLocale: SupportedLocale = locale === 'fr' ? 'en' : 'fr'
  const fallbackValue = dto.translations?.[fallbackLocale]?.[field]
  if (fallbackValue) return fallbackValue
  
  // Priorité 3: pas de traduction trouvée
  return null
}

/**
 * Détermine la locale à partir du code langue
 */
export function normalizeLocale(locale?: string): SupportedLocale {
  if (!locale) return 'fr'
  
  const normalized = locale.toLowerCase().split('-')[0]
  switch (normalized) {
    case 'en':
      return 'en'
    case 'fr':
    default:
      return 'fr'
  }
}

/**
 * Validation que le DTO est utilisable pour l'UI
 */
export function validateViewModelRequirements(dto: ProductDTO): void {
  if (!dto.name.trim()) {
    throw new Error('Product name is required for UI display')
  }
  
  if (dto.price <= 0) {
    throw new Error('Product price must be positive for UI display')
  }
  
  if (!dto.currency) {
    throw new Error('Product currency is required for UI display')
  }
}