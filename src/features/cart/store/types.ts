/**
 * Types pour cart-store - Interfaces et state
 */

import { Cart, CartItem, Product } from '@/types/herbis-veritas'
import { type CartSlice } from './cart-slice'
import { type ShippingCalculationResult } from '@/lib/shipping/shipping-calculator'

export interface CartState {
  // State
  cart: Cart | null
  isLoading: boolean
  error: string | null
  
  // Getters (computed)
  itemCount: number
  subtotal: number
  shippingCost: number
  tva: number
  total: number
  
  // Shipping
  shippingCalculation: ShippingCalculationResult | null
  selectedShippingMethod: string
  destinationCountry: string
}

export interface CartActions {
  // Actions CRUD
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  
  // Actions async (préparation Phase 2)
  loadCart: (userId?: string) => Promise<void>
  saveCart: () => Promise<void>
  mergeGuestCart: (userCart: Cart) => void
  
  // Utilitaires
  getItem: (productId: string) => CartItem | undefined
  hasItem: (productId: string) => boolean
  resetError: () => void
}

export type CartStore = CartState & CartActions & CartSlice