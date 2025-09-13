/**
 * Hooks utilitaires pour cart - Stats et analytics
 */

'use client'

import { useMemo } from 'react'
import { useCartQuery } from '../hooks/use-cart-query'
import type { HerbisVeritasLabel } from '@/types/herbis-veritas'
import type { CartStatsReturn, CartLabelsAnalyticsReturn } from './types'

/**
 * Hook pour vérifier si produit dans panier
 */
export function useIsInCart(productId: string) {
  const { data: cart } = useCartQuery()
  
  return useMemo(() => {
    if (!cart?.items) return false
    return cart.items.some(item => item.productId === productId)
  }, [cart?.items, productId])
}

/**
 * Hook pour statistiques cart
 */
export function useCartStats(): CartStatsReturn {
  const { data: cart } = useCartQuery()
  
  return useMemo(() => {
    if (!cart?.items) {
      return {
        itemCount: 0,
        subtotal: 0,
        totalWithShipping: 0,
        isEmpty: true,
        hasItems: false
      }
    }

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    // TODO: Ajouter calcul frais de port dynamique
    const shippingCost = subtotal >= 50 ? 0 : 5.90
    const totalWithShipping = subtotal + shippingCost

    return {
      itemCount,
      subtotal,
      totalWithShipping,
      isEmpty: itemCount === 0,
      hasItems: itemCount > 0
    }
  }, [cart?.items])
}

/**
 * Hook pour analytics labels produits
 */
export function useCartLabelsAnalytics(): CartLabelsAnalyticsReturn {
  const { data: cart } = useCartQuery()
  
  return useMemo(() => {
    if (!cart?.items) {
      return {
        totalLabels: [],
        labelCounts: {} as Record<HerbisVeritasLabel, number>,
        topLabels: [],
        hasLabel: () => false
      }
    }

    // Comptage labels avec quantités
    const labelCounts: Record<string, number> = {}
    const allLabels = new Set<HerbisVeritasLabel>()

    cart.items.forEach(item => {
      if (item.product?.labels) {
        item.product.labels.forEach(label => {
          allLabels.add(label)
          labelCounts[label] = (labelCounts[label] || 0) + item.quantity
        })
      }
    })

    // Top labels triés par fréquence
    const topLabels = Object.entries(labelCounts)
      .map(([label, count]) => ({ 
        label: label as HerbisVeritasLabel, 
        count 
      }))
      .sort((a, b) => b.count - a.count)

    const hasLabel = (label: HerbisVeritasLabel) => allLabels.has(label)

    return {
      totalLabels: Array.from(allLabels),
      labelCounts: labelCounts as Record<HerbisVeritasLabel, number>,
      topLabels,
      hasLabel
    }
  }, [cart?.items])
}