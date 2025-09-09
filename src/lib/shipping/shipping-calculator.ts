/**
 * === 🚚 Shipping Calculator HerbisVeritas MVP ===
 * Calculs des frais de livraison pour la France
 * Intégration Colissimo + La Poste
 */

export interface ShippingMethod {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  basePrice: number // Prix en centimes
  maxWeight?: number // Poids max en grammes
  estimatedDays: string
  estimatedDaysEn: string
  icon?: string
}

export interface ShippingCalculationParams {
  subtotal: number // Montant en centimes
  totalWeight?: number // Poids total en grammes
  destinationCountry?: string // Code pays ISO (default: FR)
  destinationPostalCode?: string // Code postal
}

export interface ShippingCalculationResult {
  eligibleMethods: ShippingMethod[]
  recommendedMethod: ShippingMethod
  freeShippingThreshold: number
  freeShippingRemaining?: number // Montant restant pour livraison gratuite
  isFreeShipping: boolean
}

/**
 * Méthodes de livraison disponibles (prix en centimes)
 */
export const SHIPPING_METHODS: Record<string, ShippingMethod> = {
  colissimo_standard: {
    id: 'colissimo_standard',
    name: 'Colissimo',
    nameEn: 'Standard Delivery',
    description: 'Livraison standard sous 2-3 jours ouvrés',
    descriptionEn: 'Standard delivery within 2-3 working days',
    basePrice: 490, // 4,90€
    maxWeight: 30000, // 30kg
    estimatedDays: '2-3 jours ouvrés',
    estimatedDaysEn: '2-3 working days',
    icon: '📦'
  },
  colissimo_express: {
    id: 'colissimo_express',
    name: 'Colissimo Express',
    nameEn: 'Express Delivery', 
    description: 'Livraison express 24h-48h',
    descriptionEn: 'Express delivery 24h-48h',
    basePrice: 890, // 8,90€
    maxWeight: 30000,
    estimatedDays: '24h-48h',
    estimatedDaysEn: '24h-48h',
    icon: '⚡'
  },
  mondial_relay: {
    id: 'mondial_relay',
    name: 'Mondial Relay',
    nameEn: 'Pickup Point',
    description: 'Retrait en point relais sous 2-4 jours',
    descriptionEn: 'Pickup point delivery within 2-4 days',
    basePrice: 350, // 3,50€
    maxWeight: 20000, // 20kg
    estimatedDays: '2-4 jours ouvrés',
    estimatedDaysEn: '2-4 working days',
    icon: '🏪'
  },
  chronopost: {
    id: 'chronopost',
    name: 'Chronopost',
    nameEn: 'Next Day Delivery',
    description: 'Livraison garantie le lendemain avant 13h',
    descriptionEn: 'Guaranteed next day delivery before 1pm',
    basePrice: 1490, // 14,90€
    maxWeight: 30000,
    estimatedDays: 'Lendemain avant 13h',
    estimatedDaysEn: 'Next day before 1pm',
    icon: '🚀'
  }
}

/**
 * Configuration livraison gratuite
 */
export const FREE_SHIPPING_CONFIG = {
  threshold: 5000, // 50€ en centimes
  methods: ['colissimo_standard'], // Méthodes éligibles à la gratuité
}

/**
 * Zones de livraison et prix
 */
export const SHIPPING_ZONES = {
  FR: {
    name: 'France métropolitaine',
    nameEn: 'Metropolitan France',
    multiplier: 1.0,
    methods: ['colissimo_standard', 'colissimo_express', 'mondial_relay', 'chronopost']
  },
  DOM_TOM: {
    name: 'DOM-TOM',
    nameEn: 'French Overseas',
    multiplier: 2.5,
    methods: ['colissimo_standard', 'colissimo_express']
  },
  EU: {
    name: 'Union européenne',
    nameEn: 'European Union',
    multiplier: 1.8,
    methods: ['colissimo_standard', 'colissimo_express']
  }
}

/**
 * Déterminer la zone de livraison selon le code pays
 */
export function getShippingZone(countryCode: string = 'FR') {
  const upperCode = countryCode.toUpperCase()
  
  if (upperCode === 'FR') return SHIPPING_ZONES.FR
  
  // DOM-TOM codes (simplifiés pour MVP)
  const domTomCodes = ['GP', 'MQ', 'GF', 'RE', 'YT', 'NC', 'PF', 'WF', 'PM', 'BL', 'MF']
  if (domTomCodes.includes(upperCode)) return SHIPPING_ZONES.DOM_TOM
  
  // UE codes (principaux pour MVP)
  const euCodes = ['BE', 'DE', 'ES', 'IT', 'LU', 'NL', 'PT', 'AT', 'IE', 'DK', 'SE', 'FI']
  if (euCodes.includes(upperCode)) return SHIPPING_ZONES.EU
  
  // Par défaut: France
  return SHIPPING_ZONES.FR
}

/**
 * Calculer les frais de livraison selon les paramètres
 */
export function calculateShipping(params: ShippingCalculationParams): ShippingCalculationResult {
  const { subtotal, totalWeight = 500, destinationCountry = 'FR' } = params
  
  const zone = getShippingZone(destinationCountry)
  const eligibleMethods: ShippingMethod[] = []
  
  // Filtrer les méthodes disponibles pour la zone
  for (const methodId of zone.methods) {
    const method = SHIPPING_METHODS[methodId]
    if (!method) continue
    
    // Vérifier contrainte de poids
    if (method.maxWeight && totalWeight > method.maxWeight) continue
    
    // Calculer prix avec multiplicateur de zone
    const adjustedPrice = Math.round(method.basePrice * zone.multiplier)
    
    eligibleMethods.push({
      ...method,
      basePrice: adjustedPrice
    })
  }
  
  // Vérifier éligibilité livraison gratuite
  const isFreeShipping = subtotal >= FREE_SHIPPING_CONFIG.threshold
  const freeShippingRemaining = isFreeShipping ? 
    0 : FREE_SHIPPING_CONFIG.threshold - subtotal
  
  // Appliquer gratuité si éligible
  if (isFreeShipping) {
    eligibleMethods.forEach(method => {
      if (FREE_SHIPPING_CONFIG.methods.includes(method.id)) {
        method.basePrice = 0
      }
    })
  }
  
  // Méthode recommandée : gratuite prioritaire, sinon la moins chère
  const recommendedMethod = eligibleMethods.reduce((best, method) => {
    // Si livraison gratuite, priorité aux méthodes gratuites
    if (isFreeShipping) {
      const isBestFree = best.basePrice === 0
      const isCurrentFree = method.basePrice === 0
      
      if (!isBestFree && isCurrentFree) return method
      if (isBestFree && !isCurrentFree) return best
    }
    
    // Sinon, la moins chère
    return method.basePrice < best.basePrice ? method : best
  }, eligibleMethods[0]!)
  
  return {
    eligibleMethods,
    recommendedMethod,
    freeShippingThreshold: FREE_SHIPPING_CONFIG.threshold,
    freeShippingRemaining,
    isFreeShipping
  }
}

/**
 * Formater prix en euros pour affichage
 */
export function formatShippingPrice(priceInCents: number, locale: 'fr' | 'en' = 'fr'): string {
  if (priceInCents === 0) {
    return locale === 'fr' ? 'Gratuit' : 'Free'
  }
  
  const price = priceInCents / 100
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

/**
 * Obtenir message encouragement livraison gratuite
 */
export function getFreeShippingMessage(remainingAmount: number, locale: 'fr' | 'en' = 'fr'): string {
  const formatted = formatShippingPrice(remainingAmount, locale)
  
  if (locale === 'en') {
    return `Add ${formatted} for free shipping!`
  }
  
  return `Ajoutez ${formatted} pour la livraison gratuite !`
}