/**
 * === 🛒 Cart Summary Component ===
 * Résumé détaillé du panier avec TVA et frais de port
 * Affichage des calculs complets pour validation utilisateur
 */

import React from 'react'
import { useCartShipping } from '@/hooks/use-cart-shipping'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Truck, Gift } from 'lucide-react'

interface CartSummaryProps {
  destinationCountry?: string
  locale?: 'fr' | 'en'
  showShippingMethods?: boolean
  className?: string
}

export function CartSummary({ 
  destinationCountry = 'FR',
  locale = 'fr',
  showShippingMethods = true,
  className = ''
}: CartSummaryProps) {
  const shipping = useCartShipping(destinationCountry, locale)
  
  const labels = {
    fr: {
      subtotal: 'Sous-total',
      shipping: 'Frais de livraison',
      tva: 'TVA (20%)',
      total: 'Total TTC',
      freeShipping: 'Livraison gratuite !',
      shippingMethods: 'Modes de livraison',
      recommended: 'Recommandé'
    },
    en: {
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tva: 'VAT (20%)',
      total: 'Total incl. VAT',
      freeShipping: 'Free shipping!',
      shippingMethods: 'Shipping methods',
      recommended: 'Recommended'
    }
  }
  
  const t = labels[locale]
  
  if (shipping.subtotal === 0) {
    return null
  }
  
  return (
    <section className={`space-y-4 ${className}`} aria-labelledby="cart-summary">
      <header>
        <h3 id="cart-summary" className="font-semibold text-lg">
          {locale === 'fr' ? 'Récapitulatif' : 'Summary'}
        </h3>
      </header>
      
      <div className="space-y-3">
        {/* Sous-total */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{t.subtotal}</span>
          <span className="font-medium">{shipping.formattedSubtotal}</span>
        </div>
        
        {/* Frais de livraison */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t.shipping}</span>
          </div>
          <div className="flex items-center gap-2">
            {shipping.isFreeShipping && (
              <Badge variant="secondary" className="text-xs">
                <Gift className="h-3 w-3 mr-1" />
                {t.freeShipping}
              </Badge>
            )}
            <span className={`font-medium ${shipping.isFreeShipping ? 'text-green-600' : ''}`}>
              {shipping.formattedShipping}
            </span>
          </div>
        </div>
        
        {/* Message livraison gratuite */}
        {shipping.freeShippingMessage && (
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border">
            <p className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              {shipping.freeShippingMessage}
            </p>
          </div>
        )}
        
        <Separator />
        
        {/* TVA */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{t.tva}</span>
          <span className="font-medium">{shipping.formattedTva}</span>
        </div>
        
        <Separator className="border-2" />
        
        {/* Total */}
        <div className="flex justify-between items-center text-lg font-bold">
          <span>{t.total}</span>
          <span>{shipping.formattedTotal}</span>
        </div>
        
        {/* Méthodes de livraison */}
        {showShippingMethods && shipping.availableShippingMethods.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <h4 className="font-medium text-sm text-muted-foreground">
              {t.shippingMethods}
            </h4>
            <div className="space-y-2">
              {shipping.availableShippingMethods.map((method) => (
                <div 
                  key={method.id}
                  className={`flex justify-between items-center p-3 rounded-lg border ${
                    method.id === shipping.recommendedMethod?.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{method.icon}</span>
                    <div>
                      <p className="font-medium text-sm">
                        {locale === 'fr' ? method.name : method.nameEn}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {locale === 'fr' ? method.estimatedDays : method.estimatedDaysEn}
                      </p>
                    </div>
                    {method.id === shipping.recommendedMethod?.id && (
                      <Badge variant="outline" className="text-xs ml-2">
                        {t.recommended}
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium text-sm">
                    {method.basePrice === 0 ? 
                      (locale === 'fr' ? 'Gratuit' : 'Free') : 
                      formatPrice(method.basePrice, locale)
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function formatPrice(priceInCents: number, locale: 'fr' | 'en'): string {
  const price = priceInCents / 100
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}