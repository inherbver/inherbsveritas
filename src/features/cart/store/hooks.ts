/**
 * Hooks utilitaires pour cart-store - Sélecteurs optimisés
 */

import { useCartStore } from './cart-store'

/**
 * Hook pour actions uniquement (évite re-renders inutiles)
 */
export const useCartActions = () => {
  const addItem = useCartStore(state => state.addItem)
  const removeItem = useCartStore(state => state.removeItem)
  const updateQuantity = useCartStore(state => state.updateQuantity)
  const clearCart = useCartStore(state => state.clearCart)
  const mergeGuestCart = useCartStore(state => state.mergeGuestCart)
  const resetError = useCartStore(state => state.resetError)

  return {
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    mergeGuestCart,
    resetError,
  }
}

/**
 * Hook pour état readonly (évite re-renders)
 */
export const useCartState = () => {
  const cart = useCartStore(state => state.cart)
  const itemCount = useCartStore(state => state.itemCount)
  const subtotal = useCartStore(state => state.subtotal)
  const tva = useCartStore(state => state.tva)
  const total = useCartStore(state => state.total)
  const isLoading = useCartStore(state => state.isLoading)
  const error = useCartStore(state => state.error)

  return {
    cart,
    itemCount,
    subtotal,
    tva,
    total,
    isLoading,
    error,
  }
}