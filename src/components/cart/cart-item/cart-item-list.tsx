/**
 * CartItemList - Liste items avec état vide
 */

'use client'

import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { type CartItemListProps } from './types'
import { CartItem } from './cart-item'

/**
 * CartItemList - Composant liste < 50 lignes
 */
export function CartItemList({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  isUpdating, 
  isRemoving, 
  variant = 'default',
  className = ''
}: CartItemListProps) {
  
  // État vide
  if (items.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">Aucun article dans le panier</p>
      </div>
    )
  }

  // Liste items
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <CartItem
          key={item.id || item.productId}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          {...(isUpdating !== undefined && { isUpdating })}
          {...(isRemoving !== undefined && { isRemoving })}
          variant={variant}
        />
      ))}
    </div>
  )
}