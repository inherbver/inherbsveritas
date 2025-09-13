/**
 * Types pour cart-actions - Interfaces et paramètres
 */

import type { HerbisCartItem, HerbisVeritasLabel } from '@/types/herbis-veritas'

export interface AddToCartParams {
  productId: string
  name: string
  price: number
  quantity?: number
  labels?: HerbisVeritasLabel[]
  unit?: string
  inci_list?: string[]
  image_url?: string
  slug?: string
  stock_quantity?: number
  low_stock_threshold?: number
}

export interface CartActionsReturn {
  // Actions
  addToCart: (params: AddToCartParams) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  
  // States
  isAdding: boolean
  isUpdating: boolean
  isRemoving: boolean
  hasError: boolean
  lastError: string | null
  
  // Optimistic state
  optimisticItems: HerbisCartItem[]
  itemCount: number
  subtotal: number
  
  // Error handling
  clearError: () => void
  retryLastAction: () => Promise<void>
}

export interface CartStatsReturn {
  itemCount: number
  subtotal: number
  totalWithShipping: number
  isEmpty: boolean
  hasItems: boolean
}

export interface CartLabelsAnalyticsReturn {
  totalLabels: HerbisVeritasLabel[]
  labelCounts: Record<HerbisVeritasLabel, number>
  topLabels: Array<{ label: HerbisVeritasLabel; count: number }>
  hasLabel: (label: HerbisVeritasLabel) => boolean
}