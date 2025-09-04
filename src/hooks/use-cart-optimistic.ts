'use client'

import { useOptimistic } from 'react';
import { CartItem, Product } from '@/types/herbis-veritas';

/**
 * === 🚀 Cart Optimistic Hook - React 19 ===
 * Hook utilisant useOptimistic pour updates instantanées du cart
 * 0ms perceived latency pour UX révolutionnaire
 */

export type CartAction = 
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'CLEAR_CART' };

function cartOptimisticReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingIndex = state.findIndex(item => 
        item.product_id === product.id
      );
      
      if (existingIndex !== -1) {
        // Mettre à jour quantité existante
        return state.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      // Nouvel item avec ID temporaire optimiste
      const newItem: CartItem = {
        product_id: product.id,
        quantity,
        price: product.price,
        product
      };
      
      return [...state, newItem];
    }
      
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return state.filter(item => item.product_id !== productId);
      }
      
      return state.map(item =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      );
    }
      
    case 'REMOVE_ITEM': {
      const { productId } = action.payload;
      return state.filter(item => item.product_id !== productId);
    }
    
    case 'CLEAR_CART': {
      return [];
    }
      
    default:
      return state;
  }
}

interface UseCartOptimisticOptions {
  onOptimisticUpdate?: (action: CartAction) => void;
  onError?: (error: Error, action: CartAction) => void;
}

export function useCartOptimistic(
  serverItems: CartItem[] = [],
  options: UseCartOptimisticOptions = {}
) {
  const [optimisticItems, addOptimistic] = useOptimistic(
    serverItems,
    cartOptimisticReducer
  );

  // Actions optimistes avec callbacks
  const addItemOptimistic = (product: Product, quantity: number = 1) => {
    const action: CartAction = { 
      type: 'ADD_ITEM', 
      payload: { product, quantity } 
    };
    
    options.onOptimisticUpdate?.(action);
    addOptimistic(action);
  };

  const updateQuantityOptimistic = (productId: string, quantity: number) => {
    const action: CartAction = { 
      type: 'UPDATE_QUANTITY', 
      payload: { productId, quantity } 
    };
    
    options.onOptimisticUpdate?.(action);
    addOptimistic(action);
  };

  const removeItemOptimistic = (productId: string) => {
    const action: CartAction = { 
      type: 'REMOVE_ITEM', 
      payload: { productId } 
    };
    
    options.onOptimisticUpdate?.(action);
    addOptimistic(action);
  };

  const clearCartOptimistic = () => {
    const action: CartAction = { type: 'CLEAR_CART' };
    
    options.onOptimisticUpdate?.(action);
    addOptimistic(action);
  };

  // Calculs dérivés
  const itemCount = optimisticItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = optimisticItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );

  return {
    // État optimiste
    optimisticItems,
    itemCount,
    subtotal,
    
    // Actions optimistes
    addItemOptimistic,
    updateQuantityOptimistic,
    removeItemOptimistic,
    clearCartOptimistic,
    
    // Utilitaires
    hasItem: (productId: string) => 
      optimisticItems.some(item => item.product_id === productId),
    getItem: (productId: string) => 
      optimisticItems.find(item => item.product_id === productId),
  };
}

/**
 * === Hook de Debouncing Unifié ===
 * Synchronisation intelligente avec le serveur
 */
import { useCallback, useRef } from 'react';

export function useDebouncedSync<TArgs extends any[]>(
  syncFn: (...args: TArgs) => Promise<void> | void,
  delay: number = 300
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isScheduledRef = useRef(false);

  const debouncedSync = useCallback(
    (...args: TArgs) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      isScheduledRef.current = true;
      
      timeoutRef.current = setTimeout(async () => {
        try {
          await syncFn(...args);
        } catch (error) {
          console.error('Debounced sync error:', error);
        } finally {
          isScheduledRef.current = false;
        }
      }, delay);
    },
    [syncFn, delay]
  );

  const cancelSync = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      isScheduledRef.current = false;
    }
  }, []);

  const flushSync = useCallback(async (...args: TArgs) => {
    cancelSync();
    try {
      await syncFn(...args);
    } catch (error) {
      console.error('Flush sync error:', error);
    } finally {
      isScheduledRef.current = false;
    }
  }, [syncFn, cancelSync]);

  return { 
    debouncedSync, 
    cancelSync, 
    flushSync,
    isScheduled: isScheduledRef.current
  };
}