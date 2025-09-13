/**
 * Feature Cart - Point d'entrée unifié
 * 
 * Centralise toute la logique métier cart selon CLAUDE.md section 3 bis
 */

// === Store Zustand ===
export { useCartStore } from './store/cart-store'
export { useCartActions, useCartState } from './store/hooks'
export type { CartStore, CartState, CartActions } from './store/types'

// === React Query Hooks ===
export { 
  useCartQuery, 
  useAddToCartMutation, 
  useUpdateQuantityMutation, 
  useRemoveFromCartMutation,
  useCartStats as useCartStatsQuery,
  useIsInCart as useIsInCartQuery,
  useCartLabelsAnalytics
} from './hooks/use-cart-query'

// === Optimistic Updates (React 19) ===
export { useCartOptimistic, useDebouncedSync } from './hooks/use-cart-optimistic'

// === Shipping Integration ===
export { useCartShipping } from './hooks/use-cart-shipping'

// === Actions Composites ===
export { useCartActions as useCartActionsComposite } from './cart-actions/use-cart-actions'
export { useIsInCart, useCartStats, useCartLabelsAnalytics as useCartLabelsStats } from './cart-actions/use-cart-helpers'
export type { AddToCartParams, CartActionsReturn } from './cart-actions/types'

// === Types Business ===
export type { Cart, CartItem, HerbisCartItem } from '../../types/herbis-veritas'