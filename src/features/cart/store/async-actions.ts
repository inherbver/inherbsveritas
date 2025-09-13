/**
 * Actions async pour cart-store - API calls et guest merge
 */

import { Cart } from '@/types/herbis-veritas'
import { type CartStore } from './types'

/**
 * Créateur d'actions async cart
 */
export const createAsyncActions = (
  set: (partial: Partial<CartStore>) => void,
  get: () => CartStore
) => ({
  loadCart: async (userId?: string) => {
    set({ isLoading: true })
    try {
      // TODO Phase 2: Implémenter API call
      // Pour MVP : utilise localStorage persistence
      set({ isLoading: false })
    } catch (error) {
      console.error('Cart loadCart error:', error)
      set({ 
        error: 'Erreur lors du chargement du panier',
        isLoading: false 
      })
    }
  },

  saveCart: async () => {
    set({ isLoading: true })
    try {
      // TODO Phase 2: Implémenter API call
      // Pour MVP : persistence automatique localStorage
      set({ isLoading: false })
    } catch (error) {
      console.error('Cart saveCart error:', error)
      set({ 
        error: 'Erreur lors de la sauvegarde',
        isLoading: false 
      })
    }
  },

  mergeGuestCart: (userCart: Cart) => {
    const state = get()
    if (!state.cart) {
      set({
        cart: userCart,
        itemCount: userCart.items.reduce((sum, item) => sum + item.quantity, 0),
      })
      return
    }

    // Merge logic : garder user cart + items guest uniques
    const mergedItems = [...userCart.items]
    
    state.cart.items.forEach(guestItem => {
      const existingIndex = mergedItems.findIndex(
        item => item.product_id === guestItem.product_id
      )
      
      if (existingIndex >= 0 && mergedItems[existingIndex]) {
        // Augmenter quantité si même produit
        mergedItems[existingIndex]!.quantity += guestItem.quantity
      } else {
        // Ajouter nouvel item
        mergedItems.push(guestItem)
      }
    })

    // TODO: Utiliser calculateCartTotal quand disponible
    const subtotal = mergedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const mergedCart: Cart = {
      ...userCart,
      items: mergedItems,
      subtotal,
      updated_at: new Date().toISOString(),
    }

    set({
      cart: mergedCart,
      itemCount: mergedItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      // TODO: Calculer TVA et total
      tva: subtotal * 0.2,
      total: subtotal * 1.2,
    })
  }
})