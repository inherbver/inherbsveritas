/**
 * === 🛒 Cart Hooks Exports ===
 * Export centralisé de tous les hooks cart Phase 2
 */

// Query hooks
export {
  cartKeys,
  useCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useUpdateQuantityMutation
} from '../use-cart-query';

// Optimistic hooks
export {
  useCartOptimistic,
  useDebouncedSync
} from '../use-cart-optimistic';

// Action hooks (unified)
export {
  useCartActions,
  useIsInCart,
  useCartStats,
  useCartLabelsAnalytics
} from '../use-cart-actions';

// Types
export type {
  HerbisCartItem
} from '@/types/herbis-veritas';

export type {
  CartOptimisticAction
} from '../use-cart-optimistic';