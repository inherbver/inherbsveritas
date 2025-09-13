/**
 * CartItem - Composant principal refactorisé
 */

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Imports modules refactorisés
import { type CartItemProps } from './types'
import { CartItemImage } from './cart-item-image'
import { CartItemDetails } from './cart-item-details'
import { QuantityControls } from './quantity-controls'

/**
 * CartItem - Composant principal < 150 lignes
 */
export function CartItem({ 
  item, 
  onUpdateQuantity, 
  onRemoveItem, 
  isUpdating = false, 
  isRemoving = false,
  variant = 'default',
  className = ''
}: CartItemProps) {

  const handleQuantityUpdate = (quantity: number) => {
    onUpdateQuantity(item.productId, quantity)
  }

  const handleRemove = () => {
    onRemoveItem(item.productId)
  }

  // Classes CSS par variant
  const containerClasses = cn(
    "flex items-center gap-3 p-3 bg-background rounded-lg border transition-colors",
    {
      "gap-2 p-2": variant === 'compact',
      "gap-4 p-4": variant === 'detailed',
      "opacity-50": isUpdating || isRemoving
    },
    className
  )

  return (
    <div className={containerClasses}>
      {/* Image produit */}
      <CartItemImage 
        imageUrl={item.product?.images?.[0]}
        name={item.product?.i18n?.fr?.name || item.product?.name || 'Produit'}
        variant={variant}
      />

      {/* Détails produit */}
      <CartItemDetails 
        item={item} 
        variant={variant} 
      />

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Contrôles quantité */}
        <QuantityControls
          quantity={item.quantity}
          onUpdateQuantity={handleQuantityUpdate}
          isUpdating={isUpdating}
          maxQuantity={item.product?.stock || 99}
        />

        {/* Bouton suppression */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isRemoving || isUpdating}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}