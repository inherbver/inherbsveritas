import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, CartItem, Product, calculateCartTotal, validateProductStock } from '@/types/herbis-veritas';
import { createCartSlice, type CartSlice } from './slices/cart-slice';
import { createUISlice, type UISlice } from './slices/ui-slice';
import { type ShippingCalculationResult } from '@/lib/shipping/shipping-calculator';

/**
 * === 🛒 Cart Store Zustand MVP ===
 * Store simple MVP avec persistence localStorage
 * Architecture évolutive vers slices pattern V2
 */

interface CartState {
  // State
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  
  // Getters (computed)
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  tva: number;
  total: number;
  
  // Shipping
  shippingCalculation: ShippingCalculationResult | null;
  selectedShippingMethod: string;
  destinationCountry: string;
}

interface CartActions {
  // Actions CRUD
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Actions async (préparation Phase 2)
  loadCart: (userId?: string) => Promise<void>;
  saveCart: () => Promise<void>;
  mergeGuestCart: (userCart: Cart) => void;
  
  // Utilitaires
  getItem: (productId: string) => CartItem | undefined;
  hasItem: (productId: string) => boolean;
  resetError: () => void;
}

type CartStore = CartState & CartActions & CartSlice & UISlice;

/**
 * Store Zustand avec persistence localStorage
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // === Slices Integration ===
      ...createCartSlice(set, get, null as any),
      ...createUISlice(set, get, null as any),
      
      // === Legacy State (compatibilité) ===
      cart: null,
      isLoading: false,
      error: null,
      itemCount: 0,
      subtotal: 0,
      total: 0,
      tva: 0,

      // === Legacy Actions CRUD (Migration progressive vers slices) ===
      addItem: (product: Product, quantity = 1) => {
        try {
          // Validation stock
          if (!validateProductStock(product, quantity)) {
            set({ error: `Stock insuffisant pour ${product.i18n.fr.name}` });
            return;
          }

          const state = get();
          const currentCart = state.cart || {
            session_id: crypto.randomUUID(),
            items: [],
            subtotal: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const existingItemIndex = currentCart.items.findIndex(
            item => item.product_id === product.id
          );

          let newItems: CartItem[];
          
          if (existingItemIndex >= 0) {
            // Mettre à jour quantité existante
            const newQuantity = currentCart.items[existingItemIndex]!.quantity + quantity;
            
            if (!validateProductStock(product, newQuantity)) {
              set({ error: `Stock insuffisant pour ${product.i18n.fr.name}` });
              return;
            }

            newItems = currentCart.items.map((item, index) => 
              index === existingItemIndex 
                ? { ...item, quantity: newQuantity }
                : item
            );
          } else {
            // Nouvel item
            const newItem: CartItem = {
              product_id: product.id,
              quantity,
              price: product.price,
              product
            };
            newItems = [...currentCart.items, newItem];
          }

          const totals = calculateCartTotal(newItems);
          
          const updatedCart: Cart = {
            ...currentCart,
            items: newItems,
            subtotal: totals.subtotal,
            updated_at: new Date().toISOString(),
          };

          set({
            cart: updatedCart,
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: totals.subtotal,
            tva: totals.tva,
            total: totals.total,
            error: null
          });

        } catch (error) {
          console.error('Cart addItem error:', error);
          set({ error: 'Erreur lors de l\'ajout au panier' });
        }
      },

      removeItem: (productId: string) => {
        const state = get();
        if (!state.cart) return;

        const newItems = state.cart.items.filter(item => item.product_id !== productId);
        const totals = calculateCartTotal(newItems);

        const updatedCart: Cart = {
          ...state.cart,
          items: newItems,
          subtotal: totals.subtotal,
          updated_at: new Date().toISOString(),
        };

        set({
          cart: updatedCart,
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: totals.subtotal,
          tva: totals.tva,
          total: totals.total,
          error: null
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const state = get();
        if (!state.cart) return;

        const item = state.cart.items.find(item => item.product_id === productId);
        if (!item?.product) return;

        // Validation stock
        if (!validateProductStock(item.product, quantity)) {
          set({ error: `Stock insuffisant pour ${item.product.i18n.fr.name}` });
          return;
        }

        const newItems = state.cart.items.map(item => 
          item.product_id === productId 
            ? { ...item, quantity }
            : item
        );

        const totals = calculateCartTotal(newItems);

        const updatedCart: Cart = {
          ...state.cart,
          items: newItems,
          subtotal: totals.subtotal,
          updated_at: new Date().toISOString(),
        };

        set({
          cart: updatedCart,
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: totals.subtotal,
          tva: totals.tva,
          total: totals.total,
          error: null
        });
      },

      clearCart: () => {
        set({
          cart: null,
          itemCount: 0,
          subtotal: 0,
          tva: 0,
          total: 0,
          error: null
        });
      },

      // === Actions Async (Phase 2) ===
      loadCart: async (_userId?: string) => {
        set({ isLoading: true });
        try {
          // TODO Phase 2: Implémenter API call
          // Pour MVP : utilise localStorage persistence
          set({ isLoading: false });
        } catch (error) {
          console.error('Cart loadCart error:', error);
          set({ 
            error: 'Erreur lors du chargement du panier',
            isLoading: false 
          });
        }
      },

      saveCart: async () => {
        set({ isLoading: true });
        try {
          // TODO Phase 2: Implémenter API call
          // Pour MVP : persistence automatique localStorage
          set({ isLoading: false });
        } catch (error) {
          console.error('Cart saveCart error:', error);
          set({ 
            error: 'Erreur lors de la sauvegarde',
            isLoading: false 
          });
        }
      },

      mergeGuestCart: (userCart: Cart) => {
        const state = get();
        if (!state.cart) {
          set({
            cart: userCart,
            itemCount: userCart.items.reduce((sum, item) => sum + item.quantity, 0),
          });
          return;
        }

        // Merge logic : garder user cart + items guest uniques
        const mergedItems = [...userCart.items];
        
        state.cart.items.forEach(guestItem => {
          const existingIndex = mergedItems.findIndex(
            item => item.product_id === guestItem.product_id
          );
          
          if (existingIndex >= 0 && mergedItems[existingIndex]) {
            // Augmenter quantité si même produit
            mergedItems[existingIndex]!.quantity += guestItem.quantity;
          } else {
            // Ajouter nouvel item
            mergedItems.push(guestItem);
          }
        });

        const totals = calculateCartTotal(mergedItems);

        const mergedCart: Cart = {
          ...userCart,
          items: mergedItems,
          subtotal: totals.subtotal,
          updated_at: new Date().toISOString(),
        };

        set({
          cart: mergedCart,
          itemCount: mergedItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: totals.subtotal,
          tva: totals.tva,
          total: totals.total,
        });
      },

      // === Utilitaires ===
      getItem: (productId: string) => {
        const state = get();
        return state.cart?.items.find(item => item.product_id === productId);
      },

      hasItem: (productId: string) => {
        return Boolean(get().getItem(productId));
      },

      resetError: () => {
        set({ error: null });
      },
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
        return persistedState as CartStore;
      },
    }
  )
);

/**
 * === Hooks utilitaires ===
 */

// Hook pour actions uniquement (évite re-renders inutiles)
export const useCartActions = () => {
  const addItem = useCartStore(state => state.addItem);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const clearCart = useCartStore(state => state.clearCart);
  const mergeGuestCart = useCartStore(state => state.mergeGuestCart);
  const resetError = useCartStore(state => state.resetError);

  return {
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    mergeGuestCart,
    resetError,
  };
};

// Hook pour état readonly (évite re-renders)
export const useCartState = () => {
  const cart = useCartStore(state => state.cart);
  const itemCount = useCartStore(state => state.itemCount);
  const subtotal = useCartStore(state => state.subtotal);
  const tva = useCartStore(state => state.tva);
  const total = useCartStore(state => state.total);
  const isLoading = useCartStore(state => state.isLoading);
  const error = useCartStore(state => state.error);

  return {
    cart,
    itemCount,
    subtotal,
    tva,
    total,
    isLoading,
    error,
  };
};