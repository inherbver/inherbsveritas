/**
 * ROOT: PRICE FORMATTER MVP (SINGLE SOURCE OF TRUTH)
 * formatPrice(price: number, currency='EUR', locale='fr-FR'): string
 * Entrée: prix en unités (19.90, pas 1990 cents)
 * Sortie: "19,90 €" ou "€19.90"
 * Interdits: dupliquer la logique prix dans l'UI; convertir cents ↔ unités (MVP pas de cents)
 */

// Locales supportées MVP
type SupportedLocale = 'fr' | 'en'
type SupportedCurrency = 'EUR'

/**
 * Formate un prix en unités vers string localisé
 */
export function formatPrice(
  price: number, 
  currency: SupportedCurrency = 'EUR',
  locale: SupportedLocale = 'fr'
): string {
  // Validation entrée
  if (typeof price !== 'number' || !isFinite(price)) {
    throw new Error('Price must be a finite number')
  }
  
  if (price < 0) {
    throw new Error('Price cannot be negative')
  }
  
  // Mapping locale vers Intl locale
  const intlLocale = getIntlLocale(locale)
  
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  } catch (error) {
    // Fallback en cas d'erreur Intl
    console.warn('Price formatting failed, using fallback:', error)
    return formatPriceFallback(price, currency, locale)
  }
}

/**
 * Formate un prix sans symbole monétaire
 */
export function formatPriceNumber(
  price: number,
  locale: SupportedLocale = 'fr'
): string {
  if (typeof price !== 'number' || !isFinite(price)) {
    throw new Error('Price must be a finite number')
  }
  
  const intlLocale = getIntlLocale(locale)
  
  try {
    return new Intl.NumberFormat(intlLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  } catch (error) {
    return price.toFixed(2).replace('.', locale === 'fr' ? ',' : '.')
  }
}

/**
 * Parse un prix string vers number (inverse de formatPrice)
 */
export function parsePrice(priceString: string, locale: SupportedLocale = 'fr'): number {
  if (!priceString || typeof priceString !== 'string') {
    throw new Error('Price string is required')
  }
  
  // Nettoyer la string (supprimer monnaie et espaces)
  const cleaned = priceString
    .replace(/[€$£]/g, '')
    .replace(/\s/g, '')
    .trim()
  
  // Remplacer séparateur décimal selon locale
  const normalized = locale === 'fr' 
    ? cleaned.replace(',', '.')
    : cleaned
  
  const parsed = parseFloat(normalized)
  
  if (!isFinite(parsed) || parsed < 0) {
    throw new Error('Invalid price format')
  }
  
  return Math.round(parsed * 100) / 100 // Arrondir à 2 décimales
}

/**
 * Formate une plage de prix
 */
export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  currency: SupportedCurrency = 'EUR',
  locale: SupportedLocale = 'fr'
): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currency, locale)
  }
  
  const formattedMin = formatPrice(minPrice, currency, locale)
  const formattedMax = formatPrice(maxPrice, currency, locale)
  
  const separator = locale === 'fr' ? ' - ' : ' - '
  return `${formattedMin}${separator}${formattedMax}`
}

/**
 * Calcule un prix avec remise
 */
export function calculateDiscountPrice(
  originalPrice: number,
  discountPercent: number
): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount percent must be between 0 and 100')
  }
  
  const discountAmount = originalPrice * (discountPercent / 100)
  const discountedPrice = originalPrice - discountAmount
  
  return Math.round(discountedPrice * 100) / 100
}

/**
 * Formate un prix avec remise (prix barré + nouveau prix)
 */
export function formatDiscountPrice(
  originalPrice: number,
  discountPercent: number,
  currency: SupportedCurrency = 'EUR',
  locale: SupportedLocale = 'fr'
): { original: string; discounted: string; savings: string } {
  const discountedPrice = calculateDiscountPrice(originalPrice, discountPercent)
  const savings = originalPrice - discountedPrice
  
  return {
    original: formatPrice(originalPrice, currency, locale),
    discounted: formatPrice(discountedPrice, currency, locale),
    savings: formatPrice(savings, currency, locale)
  }
}

// Helpers privés

function getIntlLocale(locale: SupportedLocale): string {
  switch (locale) {
    case 'fr':
      return 'fr-FR'
    case 'en':
      return 'en-US'
    default:
      return 'fr-FR'
  }
}

function formatPriceFallback(
  price: number,
  currency: SupportedCurrency,
  locale: SupportedLocale
): string {
  const formatted = price.toFixed(2)
  const localized = locale === 'fr' 
    ? formatted.replace('.', ',')
    : formatted
  
  switch (currency) {
    case 'EUR':
      return locale === 'fr' 
        ? `${localized} €`
        : `€${localized}`
    default:
      return `${localized} ${currency}`
  }
}

// Constantes
export const PRICE_CONSTANTS = {
  MAX_SAFE_PRICE: 999999.99,
  MIN_PRICE: 0.01,
  DECIMAL_PLACES: 2
} as const