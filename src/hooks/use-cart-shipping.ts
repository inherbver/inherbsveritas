/**
 * === 🛒🚚 Cart Shipping Hook ===
 * Hook pour gérer les calculs de panier avec frais de port
 * Intégration avec useCartStore et shipping calculator
 */

import { useMemo } from 'react'
import { useCartState } from '@/stores/cart-store'
import { calculateShipping, formatShippingPrice, getFreeShippingMessage } from '@/lib/shipping/shipping-calculator'

export interface CartShippingCalculation {
  // Montants
  subtotal: number
  shippingCost: number
  tva: number
  total: number
  
  // Livraison gratuite
  isFreeShipping: boolean
  freeShippingRemaining: number
  freeShippingMessage: string
  
  // Méthodes disponibles
  availableShippingMethods: ReturnType<typeof calculateShipping>['eligibleMethods']
  recommendedMethod: ReturnType<typeof calculateShipping>['recommendedMethod']
  
  // Formatage
  formattedSubtotal: string
  formattedShipping: string
  formattedTva: string
  formattedTotal: string
}

export function useCartShipping(
  destinationCountry: string = 'FR',
  locale: 'fr' | 'en' = 'fr'
): CartShippingCalculation {
  const { cart, subtotal, tva, total } = useCartState()
  
  const calculation = useMemo(() => {
    if (!cart || cart.items.length === 0) {
      return {
        subtotal: 0,
        shippingCost: 0,
        tva: 0,
        total: 0,
        isFreeShipping: false,
        freeShippingRemaining: 0,
        freeShippingMessage: '',
        availableShippingMethods: [],
        recommendedMethod: null,
        formattedSubtotal: formatShippingPrice(0, locale),
        formattedShipping: formatShippingPrice(0, locale),
        formattedTva: formatShippingPrice(0, locale),
        formattedTotal: formatShippingPrice(0, locale)
      }
    }
    
    // Calcul du poids total approximatif (500g par produit par défaut)
    const totalWeight = cart.items.reduce((weight, item) => {
      const productWeight = item.product?.weight || 500 // 500g par défaut
      return weight + (productWeight * item.quantity)
    }, 0)
    
    // Calcul des frais de port
    const shippingCalc = calculateShipping({
      subtotal: subtotal * 100, // Convertir en centimes
      totalWeight,
      destinationCountry
    })
    
    const shippingCost = shippingCalc.recommendedMethod.basePrice
    const shippingCostEuros = shippingCost / 100
    
    // Calcul TVA sur total HT + port
    const tvaAmount = (subtotal + shippingCostEuros) * 0.2
    const totalAmount = subtotal + shippingCostEuros + tvaAmount
    
    // Messages livraison gratuite
    const freeShippingRemaining = shippingCalc.freeShippingRemaining || 0
    const freeShippingMessage = freeShippingRemaining > 0 ? 
      getFreeShippingMessage(freeShippingRemaining, locale) : ''
    
    return {
      subtotal,
      shippingCost: shippingCostEuros,
      tva: tvaAmount,
      total: totalAmount,
      isFreeShipping: shippingCalc.isFreeShipping,
      freeShippingRemaining: freeShippingRemaining / 100, // Convertir en euros
      freeShippingMessage,
      availableShippingMethods: shippingCalc.eligibleMethods,
      recommendedMethod: shippingCalc.recommendedMethod,
      formattedSubtotal: formatShippingPrice(subtotal * 100, locale),
      formattedShipping: formatShippingPrice(shippingCost, locale),
      formattedTva: formatShippingPrice(tvaAmount * 100, locale),
      formattedTotal: formatShippingPrice(totalAmount * 100, locale)
    }
  }, [cart, subtotal, destinationCountry, locale])
  
  return calculation as CartShippingCalculation
}