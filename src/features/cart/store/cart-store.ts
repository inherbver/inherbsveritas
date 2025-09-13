/**
 * Cart Store Zustand - Configuration principale refactorisée
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createCartSlice } from './cart-slice'
import { createCartActions } from './cart-actions'
import { createAsyncActions } from './async-actions'
import { type CartStore } from './types'

/**
 * Store Zustand avec persistence localStorage < 200 lignes
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // === Slices Integration ===
      ...createCartSlice(set, get, null as any),
      
      // === State Legacy (compatibilité) ===
      cart: null,
      isLoading: false,
      error: null,
      itemCount: 0,
      subtotal: 0,
      shippingCost: 0,
      tva: 0,
      total: 0,
      
      // === Shipping State ===
      shippingCalculation: null,
      selectedShippingMethod: 'standard',
      destinationCountry: 'FR',

      // === Actions CRUD ===
      ...createCartActions(set, get),
      
      // === Actions Async ===
      ...createAsyncActions(set, get)
    }),
    {
      name: 'herbis-veritas-cart',
      storage: createJSONStorage(() => localStorage),
      
      // Persist seulement les données essentielles
      partialize: (state) => ({
        cart: state.cart,
        itemCount: state.itemCount,
        subtotal: state.subtotal,
        tva: state.tva,
        total: state.total,
      }),

      // Version pour migrations futures
      version: 1,
      
      // Migration handler pour V2
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration V1 → V2 si nécessaire
        }
        return persistedState as CartStore
      },
    }
  )
)