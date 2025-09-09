/**
 * === 🚚 Tests Shipping Calculator ===
 * Tests TDD pour les calculs TVA et frais de port
 */

import { 
  calculateShipping, 
  formatShippingPrice, 
  getFreeShippingMessage,
  SHIPPING_METHODS,
  FREE_SHIPPING_CONFIG,
  getShippingZone 
} from '@/lib/shipping/shipping-calculator'

describe('Shipping Calculator - TDD Frais de Port', () => {
  
  describe('getShippingZone', () => {
    it('devrait retourner zone France pour code FR', () => {
      const zone = getShippingZone('FR')
      expect(zone.name).toBe('France métropolitaine')
      expect(zone.multiplier).toBe(1.0)
    })

    it('devrait retourner zone DOM-TOM pour codes outre-mer', () => {
      const zone = getShippingZone('GP') // Guadeloupe
      expect(zone.name).toBe('DOM-TOM')
      expect(zone.multiplier).toBe(2.5)
    })

    it('devrait retourner zone UE pour codes européens', () => {
      const zone = getShippingZone('DE') // Allemagne
      expect(zone.name).toBe('Union européenne')
      expect(zone.multiplier).toBe(1.8)
    })

    it('devrait retourner zone France par défaut pour codes inconnus', () => {
      const zone = getShippingZone('XX')
      expect(zone.name).toBe('France métropolitaine')
      expect(zone.multiplier).toBe(1.0)
    })
  })

  describe('calculateShipping', () => {
    it('devrait calculer frais standard pour panier France < seuil gratuit', () => {
      const result = calculateShipping({
        subtotal: 3000, // 30€ en centimes
        destinationCountry: 'FR'
      })

      expect(result.isFreeShipping).toBe(false)
      expect(result.freeShippingRemaining).toBe(2000) // 50€ - 30€ = 20€
      expect(result.recommendedMethod.id).toBe('mondial_relay') // Le moins cher
      expect(result.recommendedMethod.basePrice).toBe(350) // 3,50€
    })

    it('devrait appliquer livraison gratuite pour panier >= seuil', () => {
      const result = calculateShipping({
        subtotal: 6000, // 60€ en centimes
        destinationCountry: 'FR'
      })

      expect(result.isFreeShipping).toBe(true)
      expect(result.freeShippingRemaining).toBe(0)
      expect(result.recommendedMethod.basePrice).toBe(0) // Gratuit
    })

    it('devrait appliquer multiplicateur zone pour DOM-TOM', () => {
      const result = calculateShipping({
        subtotal: 3000,
        destinationCountry: 'GP' // Guadeloupe
      })

      const expectedPrice = Math.round(490 * 2.5) // Colissimo * 2.5
      expect(result.recommendedMethod.basePrice).toBe(expectedPrice)
      expect(result.eligibleMethods).toHaveLength(2) // Colissimo std + express seulement
    })

    it('devrait appliquer multiplicateur zone pour UE', () => {
      const result = calculateShipping({
        subtotal: 3000,
        destinationCountry: 'DE' // Allemagne
      })

      const expectedPrice = Math.round(490 * 1.8) // Colissimo * 1.8
      expect(result.recommendedMethod.basePrice).toBe(expectedPrice)
    })

    it('devrait filtrer méthodes selon poids maximum', () => {
      const result = calculateShipping({
        subtotal: 3000,
        totalWeight: 25000, // 25kg
        destinationCountry: 'FR'
      })

      const mondialRelay = result.eligibleMethods.find(m => m.id === 'mondial_relay')
      expect(mondialRelay).toBeUndefined() // Poids max 20kg pour Mondial Relay
      
      const colissimo = result.eligibleMethods.find(m => m.id === 'colissimo_standard')
      expect(colissimo).toBeDefined() // Poids max 30kg pour Colissimo
    })
  })

  describe('formatShippingPrice', () => {
    it('devrait formater prix gratuit en français', () => {
      expect(formatShippingPrice(0, 'fr')).toBe('Gratuit')
    })

    it('devrait formater prix gratuit en anglais', () => {
      expect(formatShippingPrice(0, 'en')).toBe('Free')
    })

    it('devrait formater prix en euros français', () => {
      const formatted = formatShippingPrice(490, 'fr')
      expect(formatted).toContain('4,90')
      expect(formatted).toContain('€')
    })

    it('devrait formater prix en euros anglais', () => {
      expect(formatShippingPrice(490, 'en')).toBe('€4.90')
    })
  })

  describe('getFreeShippingMessage', () => {
    it('devrait retourner message encouragement en français', () => {
      const message = getFreeShippingMessage(1500, 'fr') // 15€
      expect(message).toContain('Ajoutez')
      expect(message).toContain('15,00')
      expect(message).toContain('€')
      expect(message).toContain('livraison gratuite')
    })

    it('devrait retourner message encouragement en anglais', () => {
      const message = getFreeShippingMessage(1500, 'en')
      expect(message).toContain('Add')
      expect(message).toContain('€15.00')
      expect(message).toContain('free shipping')
    })
  })

  describe('Configuration shipping methods', () => {
    it('devrait avoir toutes les méthodes configurées', () => {
      expect(SHIPPING_METHODS.colissimo_standard).toBeDefined()
      expect(SHIPPING_METHODS.colissimo_express).toBeDefined()
      expect(SHIPPING_METHODS.mondial_relay).toBeDefined()
      expect(SHIPPING_METHODS.chronopost).toBeDefined()
    })

    it('devrait avoir seuil livraison gratuite configuré', () => {
      expect(FREE_SHIPPING_CONFIG.threshold).toBe(5000) // 50€
      expect(FREE_SHIPPING_CONFIG.methods).toContain('colissimo_standard')
    })

    it('devrait avoir Mondial Relay comme option la moins chère', () => {
      const mondialRelay = SHIPPING_METHODS.mondial_relay
      const colissimoStd = SHIPPING_METHODS.colissimo_standard
      
      expect(mondialRelay.basePrice).toBeLessThan(colissimoStd.basePrice)
    })
  })

  describe('Calculs complets panier avec TVA', () => {
    it('devrait calculer total TTC avec frais de port France', () => {
      // Simulation panier 30€ + 4,90€ port + TVA 20%
      const subtotalHT = 3000 // 30€ en centimes
      const shippingCalc = calculateShipping({
        subtotal: subtotalHT,
        destinationCountry: 'FR'
      })
      
      const shippingCost = shippingCalc.recommendedMethod.basePrice // 350 centimes (3,50€)
      const totalHT = subtotalHT + shippingCost // 33,50€
      const tva = Math.round(totalHT * 0.2) // TVA 20%
      const totalTTC = totalHT + tva
      
      expect(totalTTC).toBe(4020) // 40,20€ TTC
    })

    it('devrait calculer total TTC avec livraison gratuite', () => {
      // Simulation panier 60€ + 0€ port + TVA 20%
      const subtotalHT = 6000 // 60€ en centimes
      const shippingCalc = calculateShipping({
        subtotal: subtotalHT,
        destinationCountry: 'FR'
      })
      
      const shippingCost = shippingCalc.recommendedMethod.basePrice // 0 centimes (gratuit)
      const totalHT = subtotalHT + shippingCost // 60€
      const tva = Math.round(totalHT * 0.2) // TVA 20%
      const totalTTC = totalHT + tva
      
      expect(shippingCost).toBe(0)
      expect(totalTTC).toBe(7200) // 72€ TTC
    })
  })
})