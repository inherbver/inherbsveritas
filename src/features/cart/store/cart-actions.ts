/**
 * Actions CRUD pour cart-store - Logique métier
 */

import { Cart, CartItem, Product, calculateCartTotal, validateProductStock } from '@/types/herbis-veritas'
import { type StateCreator } from 'zustand'
import { type CartStore } from './types'

/**
 * Créateur d'actions CRUD cart
 */
export const createCartActions = (
  set: (partial: Partial<CartStore>) => void,
  get: () => CartStore
) => ({
  addItem: (product: Product, quantity = 1) => {
    try {
      // Validation stock
      if (!validateProductStock(product, quantity)) {
        set({ error: `Stock insuffisant pour ${product.i18n.fr.name}` })
        return
      }

      const state = get()
      const currentCart = state.cart || {
        session_id: crypto.randomUUID(),
        items: [],
        subtotal: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const existingItemIndex = currentCart.items.findIndex(
        item => item.product_id === product.id
      )

      let newItems: CartItem[]
      
      if (existingItemIndex >= 0) {
        // Mettre à jour quantité existante
        const newQuantity = currentCart.items[existingItemIndex]!.quantity + quantity
        
        if (!validateProductStock(product, newQuantity)) {
          set({ error: `Stock insuffisant pour ${product.i18n.fr.name}` })
          return
        }

        newItems = currentCart.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: newQuantity }
            : item
        )
      } else {
        // Nouvel item
        const newItem: CartItem = {
          product_id: product.id,
          quantity,
          price: product.price,
          product
        }
        newItems = [...currentCart.items, newItem]
      }

      const totals = calculateCartTotal(newItems)
      
      const updatedCart: Cart = {
        ...currentCart,
        items: newItems,
        subtotal: totals.subtotal,
        updated_at: new Date().toISOString(),
      }

      set({
        cart: updatedCart,
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: totals.subtotal,
        tva: totals.tva,
        total: totals.total,
        error: null
      })

    } catch (error) {
      console.error('Cart addItem error:', error)
      set({ error: 'Erreur lors de l\'ajout au panier' })
    }
  },

  removeItem: (productId: string) => {
    const state = get()
    if (!state.cart) return

    const newItems = state.cart.items.filter(item => item.product_id !== productId)
    const totals = calculateCartTotal(newItems)

    const updatedCart: Cart = {
      ...state.cart,
      items: newItems,
      subtotal: totals.subtotal,
      updated_at: new Date().toISOString(),
    }

    set({
      cart: updatedCart,
      itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: totals.subtotal,
      tva: totals.tva,
      total: totals.total,
      error: null
    })
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }

    const state = get()
    if (!state.cart) return

    const item = state.cart.items.find(item => item.product_id === productId)
    if (!item?.product) return

    // Validation stock
    if (!validateProductStock(item.product, quantity)) {
      set({ error: `Stock insuffisant pour ${item.product.i18n.fr.name}` })
      return
    }

    const newItems = state.cart.items.map(item => 
      item.product_id === productId 
        ? { ...item, quantity }
        : item
    )

    const totals = calculateCartTotal(newItems)

    const updatedCart: Cart = {
      ...state.cart,
      items: newItems,
      subtotal: totals.subtotal,
      updated_at: new Date().toISOString(),
    }

    set({
      cart: updatedCart,
      itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: totals.subtotal,
      tva: totals.tva,
      total: totals.total,
      error: null
    })
  },

  clearCart: () => {
    set({
      cart: null,
      itemCount: 0,
      subtotal: 0,
      tva: 0,
      total: 0,
      error: null
    })
  },

  // Utilitaires
  getItem: (productId: string) => {
    const state = get()
    return state.cart?.items.find(item => item.product_id === productId)
  },

  hasItem: (productId: string) => {
    return Boolean(get().getItem(productId))
  },

  resetError: () => {
    set({ error: null })
  }
})