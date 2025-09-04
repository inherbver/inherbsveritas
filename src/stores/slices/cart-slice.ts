import { StateCreator } from 'zustand';
import type { CartItem, Product } from '@/types/herbis-veritas';

/**
 * Cart Slice - Logique optimistic updates
 * Extension du store existant avec React 19 patterns
 */

export interface OptimisticCartItem extends CartItem {
  // Add mandatory fields for temp items
  id?: string; // Optional pour items optimistic
  created_at?: string;
  updated_at?: string;
  
  // HerbisVeritas extensions
  labels?: string[] | undefined;
  unit?: string | undefined;
  inci_list?: string[] | undefined;
  image_url?: string | undefined;
  slug?: string | undefined;
  stock_quantity?: number | undefined;
  low_stock_threshold?: number | undefined;
  
  // Optimistic states
  isOptimistic?: boolean;
  optimisticId?: string; // temp-${timestamp}
}

interface CartSlice {
  // Optimistic state
  optimisticItems: OptimisticCartItem[];
  isOptimistic: boolean;
  pendingOperations: Set<string>;
  
  // Actions optimistic
  addOptimisticItem: (product: Product, quantity?: number) => string;
  removeOptimisticItem: (optimisticId: string) => void;
  updateOptimisticQuantity: (optimisticId: string, quantity: number) => void;
  clearOptimistic: () => void;
  
  // Sync helpers
  syncOptimisticToServer: (optimisticId: string) => void;
  revertOptimisticItem: (optimisticId: string) => void;
  
  // Computed getters
  getOptimisticTotal: () => number;
  getOptimisticItemCount: () => number;
  hasOptimisticItems: () => boolean;
}

export const createCartSlice: StateCreator<
  CartSlice, [], [], CartSlice
> = (set, get, _api) => ({
  // === Initial State ===
  optimisticItems: [],
  isOptimistic: false,
  pendingOperations: new Set(),
  
  // === Actions Optimistic ===
  addOptimisticItem: (product: Product, quantity = 1) => {
    const optimisticId = `temp-${Date.now()}-${Math.random()}`;
    
    set((state) => {
      // Check if product already exists in optimistic items
      const existingIndex = state.optimisticItems.findIndex(
        item => item.product_id === product.id && !item.isOptimistic
      );
      
      if (existingIndex !== -1) {
        // Update existing item quantity
        const updatedItems = [...state.optimisticItems];
        const existingItem = updatedItems[existingIndex];
        if (existingItem) {
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + quantity,
            isOptimistic: true,
            optimisticId
          };
        }
        
        return {
          optimisticItems: updatedItems,
          isOptimistic: true,
          pendingOperations: new Set([...state.pendingOperations, optimisticId])
        };
      } else {
        // Add new optimistic item
        const newItem: OptimisticCartItem = {
          // Required CartItem fields
          product_id: product.id,
          quantity,
          price: product.price,
          product,
          
          // Optional fields
          id: optimisticId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          
          // HerbisVeritas specific
          labels: product.labels || [],
          unit: 'pièce', // TODO: ajouter au type Product si nécessaire
          inci_list: product.inci_list || undefined,
          image_url: product.featured_image || product.images[0] || undefined,
          slug: product.sku, // TODO: ajouter slug au type Product si nécessaire
          stock_quantity: product.stock_quantity,
          low_stock_threshold: product.low_stock_threshold,
          
          // Optimistic flags
          isOptimistic: true,
          optimisticId
        };
        
        return {
          optimisticItems: [...state.optimisticItems, newItem],
          isOptimistic: true,
          pendingOperations: new Set([...state.pendingOperations, optimisticId])
        };
      }
    });
    
    return optimisticId;
  },
  
  removeOptimisticItem: (optimisticId: string) => {
    set((state) => {
      const filteredItems = state.optimisticItems.filter(
        item => item.optimisticId !== optimisticId
      );
      
      const updatedPending = new Set(state.pendingOperations);
      updatedPending.delete(optimisticId);
      
      return {
        optimisticItems: filteredItems,
        isOptimistic: filteredItems.some(item => item.isOptimistic),
        pendingOperations: updatedPending
      };
    });
  },
  
  updateOptimisticQuantity: (optimisticId: string, quantity: number) => {
    set((state) => {
      const updatedItems = state.optimisticItems.map(item => {
        if (item.optimisticId === optimisticId) {
          if (quantity <= 0) {
            return null; // Will be filtered out
          }
          return { ...item, quantity, updated_at: new Date().toISOString() };
        }
        return item;
      }).filter(Boolean) as OptimisticCartItem[];
      
      return {
        optimisticItems: updatedItems,
        isOptimistic: updatedItems.some(item => item.isOptimistic)
      };
    });
  },
  
  clearOptimistic: () => {
    set({
      optimisticItems: [],
      isOptimistic: false,
      pendingOperations: new Set()
    });
  },
  
  // === Sync Helpers ===
  syncOptimisticToServer: (optimisticId: string) => {
    set((state) => {
      const updatedPending = new Set(state.pendingOperations);
      updatedPending.add(optimisticId);
      
      return { pendingOperations: updatedPending };
    });
  },
  
  revertOptimisticItem: (optimisticId: string) => {
    // Remove failed optimistic item
    get().removeOptimisticItem(optimisticId);
  },
  
  // === Computed Getters ===
  getOptimisticTotal: () => {
    const { optimisticItems } = get();
    return optimisticItems.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
  },
  
  getOptimisticItemCount: () => {
    const { optimisticItems } = get();
    return optimisticItems.reduce((count, item) => count + item.quantity, 0);
  },
  
  hasOptimisticItems: () => {
    const { optimisticItems } = get();
    return optimisticItems.some(item => item.isOptimistic);
  }
});

export type { CartSlice };