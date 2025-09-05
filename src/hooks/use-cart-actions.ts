'use client'

/**
 * === 🛒 Cart Actions Hook avec Error Handling ===
 * Hook unifié pour les actions cart avec rollback automatique
 * Phase 2: Error handling + optimistic updates + debouncing
 */

import { useCallback } from 'react';
import { toast } from '@/lib/toast';
import { useCartQuery, useAddToCartMutation, useUpdateQuantityMutation, useRemoveFromCartMutation } from './use-cart-query';
import { useCartOptimistic, useDebouncedSync } from './use-cart-optimistic';
import type { HerbisCartItem } from '@/types/herbis-veritas';

// ============================================================================
// TYPES
// ============================================================================

interface AddToCartParams {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  labels?: any[];
  unit?: string;
  inci_list?: string[];
  image_url?: string;
  slug?: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
}

interface CartActionsReturn {
  // Actions
  addToCart: (params: AddToCartParams) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // States
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  hasError: boolean;
  lastError: string | null;
  
  // Optimistic state
  optimisticItems: HerbisCartItem[];
  itemCount: number;
  subtotal: number;
  isEmpty: boolean;
  
  // Utilities
  isInCart: (productId: string) => boolean;
  getItem: (productId: string) => HerbisCartItem | undefined;
  getQuantity: (productId: string) => number;
  
  // HerbisVeritas analytics
  labelsDistribution: Record<string, number>;
  averageItemPrice: number;
  mostPopularLabel: string | null;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useCartActions(): CartActionsReturn {
  const { data: serverCart } = useCartQuery();
  const addMutation = useAddToCartMutation();
  const updateMutation = useUpdateQuantityMutation();
  const removeMutation = useRemoveFromCartMutation();

  // Optimistic state
  const {
    optimisticItems,
    addItemOptimistic,
    updateQuantityOptimistic,
    removeItemOptimistic,
    clearCartOptimistic,
    itemCount,
    subtotal,
    isEmpty,
    hasItem,
    getItem,
    labelsDistribution,
    averageItemPrice,
    mostPopularLabel,
  } = useCartOptimistic(serverCart?.items || [], {
    onOptimisticUpdate: (action) => {
      console.log('Optimistic update:', action.type);
    },
    onError: (error, action) => {
      console.error('Optimistic error:', error, action.type);
      toast.error(`Erreur ${action.type.toLowerCase()}: ${error.message}`);
    }
  });

  // Debounced sync functions
  const { debouncedSync: debouncedAdd } = useDebouncedSync(
    async (params: AddToCartParams) => {
      await addMutation.mutateAsync({
        productId: params.productId,
        quantity: params.quantity || 1
      });
    },
    200
  );

  const { debouncedSync: debouncedUpdate } = useDebouncedSync(
    async (productId: string, quantity: number) => {
      await updateMutation.mutateAsync({ productId, quantity });
    },
    300
  );

  const { debouncedSync: debouncedRemove } = useDebouncedSync(
    async (productId: string) => {
      await removeMutation.mutateAsync({ productId });
    },
    150
  );

  // ============================================================================
  // ACTION HANDLERS WITH ERROR HANDLING & ROLLBACK
  // ============================================================================

  const addToCart = useCallback(async (params: AddToCartParams) => {
    try {
      // 1. Optimistic update immédiat
      const optimisticItem: Omit<HerbisCartItem, 'id'> = {
        productId: params.productId,
        name: params.name,
        price: params.price,
        quantity: params.quantity || 1,
        labels: params.labels || [],
        unit: params.unit || 'pièce',
        slug: params.slug || '',
        ...(params.inci_list && { inci_list: params.inci_list }),
        ...(params.image_url && { image_url: params.image_url }),
        ...(params.stock_quantity !== undefined && { stock_quantity: params.stock_quantity }),
        ...(params.low_stock_threshold !== undefined && { low_stock_threshold: params.low_stock_threshold }),
      };

      addItemOptimistic(optimisticItem);
      
      // 2. Validation stock côté client
      if (params.stock_quantity !== undefined && params.stock_quantity === 0) {
        throw new Error('Produit en rupture de stock');
      }

      const currentQuantity = getItem(params.productId)?.quantity || 0;
      const newQuantity = currentQuantity + (params.quantity || 1);
      
      if (params.stock_quantity !== undefined && newQuantity > params.stock_quantity) {
        throw new Error(`Stock insuffisant (${params.stock_quantity} disponible${params.stock_quantity > 1 ? 's' : ''})`);
      }

      // 3. Sync serveur avec debouncing
      await debouncedAdd(params);
      
      // 4. Success feedback
      toast.success(`${params.name} ajouté au panier`);
      
    } catch (error) {
      console.error('Add to cart error:', error);
      
      // Rollback optimistic update
      removeItemOptimistic(params.productId);
      
      // Error feedback
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'ajout au panier';
      toast.error(message);
      
      throw error;
    }
  }, [addItemOptimistic, removeItemOptimistic, getItem, debouncedAdd]);

  const removeFromCart = useCallback(async (productId: string) => {
    const originalItem = getItem(productId);
    
    try {
      // 1. Optimistic update
      removeItemOptimistic(productId);
      
      // 2. Sync serveur
      await debouncedRemove(productId);
      
      // 3. Success feedback
      if (originalItem) {
        toast.success(`${originalItem.name} retiré du panier`);
      }
      
    } catch (error) {
      console.error('Remove from cart error:', error);
      
      // Rollback optimistic update
      if (originalItem) {
        addItemOptimistic(originalItem);
      }
      
      // Error feedback
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      toast.error(message);
      
      throw error;
    }
  }, [getItem, removeItemOptimistic, addItemOptimistic, debouncedRemove]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    const originalItem = getItem(productId);
    
    try {
      // Validation
      if (quantity < 0) {
        throw new Error('La quantité ne peut pas être négative');
      }

      if (quantity === 0) {
        return removeFromCart(productId);
      }

      // Stock validation
      if (originalItem?.stock_quantity !== undefined && quantity > originalItem.stock_quantity) {
        throw new Error(`Stock insuffisant (${originalItem.stock_quantity} disponible${originalItem.stock_quantity > 1 ? 's' : ''})`);
      }

      // 1. Optimistic update
      updateQuantityOptimistic(productId, quantity);
      
      // 2. Sync serveur
      await debouncedUpdate(productId, quantity);
      
      // 3. Success feedback (silencieux pour update)
      console.log(`Quantité mise à jour: ${quantity}`);
      
    } catch (error) {
      console.error('Update quantity error:', error);
      
      // Rollback optimistic update
      if (originalItem) {
        updateQuantityOptimistic(productId, originalItem.quantity);
      }
      
      // Error feedback
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      toast.error(message);
      
      throw error;
    }
  }, [getItem, updateQuantityOptimistic, debouncedUpdate, removeFromCart]);

  const clearCart = useCallback(async () => {
    const originalItems = [...optimisticItems];
    
    try {
      // 1. Optimistic update
      clearCartOptimistic();
      
      // 2. Sync serveur (remove all items)
      await Promise.all(
        originalItems.map(item => 
          debouncedRemove(item.productId)
        )
      );
      
      // 3. Success feedback
      toast.success('Panier vidé');
      
    } catch (error) {
      console.error('Clear cart error:', error);
      
      // Rollback optimistic update
      originalItems.forEach(item => addItemOptimistic(item));
      
      // Error feedback
      const message = error instanceof Error ? error.message : 'Erreur lors du vidage du panier';
      toast.error(message);
      
      throw error;
    }
  }, [optimisticItems, clearCartOptimistic, addItemOptimistic, debouncedRemove]);

  // ============================================================================
  // COMPUTED VALUES & UTILITIES
  // ============================================================================

  const isInCart = useCallback((productId: string): boolean => {
    return hasItem(productId);
  }, [hasItem]);

  const getQuantity = useCallback((productId: string): number => {
    return getItem(productId)?.quantity || 0;
  }, [getItem]);

  // Error states
  const hasError = addMutation.isError || updateMutation.isError || removeMutation.isError;
  const lastError = (
    addMutation.error?.message ||
    updateMutation.error?.message ||
    removeMutation.error?.message ||
    null
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    
    // States
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    hasError,
    lastError,
    
    // Optimistic state
    optimisticItems,
    itemCount,
    subtotal,
    isEmpty,
    
    // Utilities
    isInCart,
    getItem,
    getQuantity,
    
    // HerbisVeritas analytics
    labelsDistribution,
    averageItemPrice,
    mostPopularLabel,
  };
}

// ============================================================================
// INDIVIDUAL HOOKS FOR SPECIFIC USE CASES
// ============================================================================

/**
 * Hook simplifié pour juste vérifier si un produit est dans le panier
 */
export function useIsInCart(productId: string) {
  const { isInCart, getQuantity, getItem } = useCartActions();
  
  return {
    isInCart: isInCart(productId),
    quantity: getQuantity(productId),
    item: getItem(productId),
  };
}

/**
 * Hook pour les stats du panier
 */
export function useCartStats() {
  const { itemCount, subtotal, isEmpty, labelsDistribution, averageItemPrice, mostPopularLabel } = useCartActions();
  
  return {
    itemCount,
    subtotal,
    isEmpty,
    labelsDistribution,
    averageItemPrice,
    mostPopularLabel,
  };
}

/**
 * Hook pour les analytics HerbisVeritas spécifiques
 */
export function useCartLabelsAnalytics() {
  const { labelsDistribution, averageItemPrice, mostPopularLabel } = useCartActions();
  
  const totalUniqueLabels = Object.keys(labelsDistribution).length;
  const totalLabelsCount = Object.values(labelsDistribution).reduce((sum, count) => sum + count, 0);
  
  return {
    labelsDistribution,
    averageItemPrice,
    mostPopularLabel,
    totalUniqueLabels,
    totalLabelsCount,
    hasLabels: totalUniqueLabels > 0,
    dominantLabels: Object.entries(labelsDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([label, count]) => ({ label, count })),
  };
}