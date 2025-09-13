/**
 * Types pour CartItem - Interfaces et props
 */

import type { HerbisCartItem } from '@/types/herbis-veritas'

export interface CartItemProps {
  item: HerbisCartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  isUpdating?: boolean
  isRemoving?: boolean
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

export interface CartItemListProps {
  items: HerbisCartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  isUpdating?: boolean
  isRemoving?: boolean
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

export interface QuantityControlsProps {
  quantity: number
  onUpdateQuantity: (quantity: number) => void
  isUpdating?: boolean
  maxQuantity?: number
  minQuantity?: number
}

export interface CartItemImageProps {
  imageUrl?: string
  name: string
  variant?: 'default' | 'compact' | 'detailed'
}

export interface CartItemDetailsProps {
  item: HerbisCartItem
  variant?: 'default' | 'compact' | 'detailed'
}