'use client'

import { useOptimistic } from 'react';
import type { HerbisCartItem } from '@/types/herbis-veritas';

/**
 * === 🚀 Cart Optimistic Hook - React 19 Phase 2 ===
 * Hook utilisant useOptimistic pour updates instantanées du cart
 * Integration avec user_cart_view et RPC functions
 */

export type CartOptimisticAction = 
  | { type: 'ADD_ITEM'; payload: { item: Omit<HerbisCartItem, 'id'> } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'CLEAR_CART'; payload: {} };

function cartOptimisticReducer(state: HerbisCartItem[], action: CartOptimisticAction): HerbisCartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item } = action.payload;
      const existingIndex = state.findIndex(cartItem => 
        cartItem.productId === item.productId
      );
      
      if (existingIndex !== -1) {
        // Mettre à jour quantité existante
        return state.map((cartItem, index) => 
          index === existingIndex 
            ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
            : cartItem
        );
      }
      
      // Nouvel item avec ID temporaire optimiste
      const newItem: HerbisCartItem = {
        id: `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        labels: item.labels || [],
        unit: item.unit || 'pièce',
        slug: item.slug || '',
        inci_list: item.inci_list || [],
        ...(item.image_url && { image_url: item.image_url }),
        ...(item.stock_quantity !== undefined && { stock_quantity: item.stock_quantity }),
        ...(item.low_stock_threshold !== undefined && { low_stock_threshold: item.low_stock_threshold }),
      };
      
      return [...state, newItem];
    }
      
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return state.filter(item => item.productId !== productId);
      }
      
      return state.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );
    }
      
    case 'REMOVE_ITEM': {
      const { productId } = action.payload;
      return state.filter(item => item.productId !== productId);
    }
    
    case 'CLEAR_CART': {
      return [];
    }
      
    default:
      return state;
  }
}

interface UseCartOptimisticOptions {
  onOptimisticUpdate?: (action: CartOptimisticAction) => void;
  onError?: (error: Error, action: CartOptimisticAction) => void;
}

export function useCartOptimistic(
  serverItems: HerbisCartItem[] = [],
  options: UseCartOptimisticOptions = {}
) {
  const [optimisticItems, addOptimistic] = useOptimistic(
    serverItems,
    cartOptimisticReducer
  );

  // Actions optimistes avec callbacks
  const addItemOptimistic = (item: Omit<HerbisCartItem, 'id'>) => {
    const action: CartOptimisticAction = { 
      type: 'ADD_ITEM', 
      payload: { item } 
    };
    
    options.onOptimisticUpdate?.(action);
    addOptimistic(action);
  };

  const updateQuantityOptimistic = (productId: string, quantity: number) => {
    const action: CartOptimisticAction = { 
      type: 'UPDATE_QUANTITY', 
      payload: { productId, quantity } 
    };
    
    options.onOptimisticUpdate?.(action);
    addOptimistic(action);
  };

  const removeItemOptimistic = (productId: string) => {
    const action: CartOptimisticAction = { 
      type: 'REMOVE_ITEM', 
      payload: { productId } 
    };
    
    options.onOptimisticUpdate?.(action);
    addOptimistic(action);
  };

  const clearCartOptimistic = () => {
    const action: CartOptimisticAction = { type: 'CLEAR_CART', payload: {} };
    
    options.onOptimisticUpdate?.(action);
    addOptimistic(action);
  };

  // Calculs dérivés
  const itemCount = optimisticItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = optimisticItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );

  // HerbisVeritas analytics spécifiques
  const labelsDistribution = optimisticItems.reduce((acc, item) => {
    item.labels?.forEach(label => {
      acc[label] = (acc[label] || 0) + item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  const averageItemPrice = itemCount > 0 ? subtotal / itemCount : 0;
  const mostPopularLabel = Object.entries(labelsDistribution)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

  return {
    // État optimiste
    optimisticItems,
    itemCount,
    subtotal,
    isEmpty: optimisticItems.length === 0,
    
    // Actions optimistes
    addItemOptimistic,
    updateQuantityOptimistic,
    removeItemOptimistic,
    clearCartOptimistic,
    
    // Utilitaires
    hasItem: (productId: string) => 
      optimisticItems.some(item => item.productId === productId),
    getItem: (productId: string) => 
      optimisticItems.find(item => item.productId === productId),
    
    // HerbisVeritas analytics
    labelsDistribution,
    averageItemPrice,
    mostPopularLabel,
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