/**
 * CartItemDetails - Détails produit avec prix et badges
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { type CartItemDetailsProps } from './types'

export function CartItemDetails({ item, variant = 'default' }: CartItemDetailsProps) {
  const product = item.product
  
  // Configuration affichage par variant
  const showFullDetails = variant === 'detailed'
  const showCompact = variant === 'compact'

  // Calcul prix ligne
  const lineTotal = item.quantity * item.price

  return (
    <div className="flex-1 min-w-0 space-y-1">
      {/* Nom produit */}
      <h3 className={`font-medium truncate ${showCompact ? 'text-sm' : 'text-base'}`}>
        {product?.i18n?.fr?.name || product?.name || 'Produit'}
      </h3>

      {/* Prix unitaire */}
      <p className={`text-muted-foreground ${showCompact ? 'text-xs' : 'text-sm'}`}>
        {formatPrice(item.price)} / unité
      </p>

      {/* Labels produit (si detailed) */}
      {showFullDetails && product?.labels && product.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {product.labels.slice(0, 3).map((label) => (
            <Badge key={label} variant="secondary" className="text-xs">
              {label}
            </Badge>
          ))}
          {product.labels.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{product.labels.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Stock info (si detailed et stock faible) */}
      {showFullDetails && product?.stock !== undefined && product.stock < 10 && (
        <p className="text-xs text-orange-600 font-medium">
          Plus que {product.stock} en stock
        </p>
      )}

      {/* Prix ligne total */}
      {!showCompact && (
        <p className="font-semibold text-primary">
          {formatPrice(lineTotal)}
          {item.quantity > 1 && (
            <span className="text-xs text-muted-foreground ml-1">
              ({item.quantity} × {formatPrice(item.price)})
            </span>
          )}
        </p>
      )}
    </div>
  )
}