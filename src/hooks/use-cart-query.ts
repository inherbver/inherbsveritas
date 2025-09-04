'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CartItem, Product } from '@/types/herbis-veritas';

/**
 * === 🔄 Cart Query Hooks - TanStack Query V5 ===
 * Gestion état serveur avec invalidation optimisée
 * Intégration React Query + Server Actions
 */

// Types pour Server Actions (à implémenter)
interface CartData {
  id: string | null;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  updatedAt: string;
}

interface AddToCartInput {
  productId: string;
  quantity: number;
}

interface UpdateCartInput {
  productId: string;
  quantity: number;
}

// Placeholders pour Server Actions (Phase suivante)
const getCart = async (): Promise<CartData> => {
  // TODO: Implémenter Server Action getCart
  // Pour l'instant, retourne données mock
  return {
    id: null,
    items: [],
    totalItems: 0,
    subtotal: 0,
    updatedAt: new Date().toISOString()
  };
};

const addToCartAction = async (_input: AddToCartInput): Promise<CartData> => {
  // TODO: Implémenter Server Action addToCart
  throw new Error('Server action not implemented yet');
};

const updateCartAction = async (_input: UpdateCartInput): Promise<CartData> => {
  // TODO: Implémenter Server Action updateCart
  throw new Error('Server action not implemented yet');
};

const removeFromCartAction = async (_productId: string): Promise<CartData> => {
  // TODO: Implémenter Server Action removeFromCart
  throw new Error('Server action not implemented yet');
};

/**
 * Hook principal pour récupérer les données du cart serveur
 */
export function useCartQuery() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    staleTime: 1000 * 60 * 5, // 5 minutes - cart change peu fréquemment
    refetchOnWindowFocus: false,
    refetchOnMount: 'always', // Toujours récupérer à chaque mount
    retry: 2,
  });
}

/**
 * Hook mutation pour ajouter au cart
 */
export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addToCartAction,
    onSuccess: (data) => {
      // Mise à jour cache avec nouvelles données
      queryClient.setQueryData(['cart'], data);
      
      // Invalide autres queries liées si besoin
      queryClient.invalidateQueries({ 
        queryKey: ['cart'], 
        exact: false 
      });
    },
    onError: (error) => {
      console.error('Add to cart error:', error);
      // TODO: Toast error message
    },
    // Optimistic updates gérés par useOptimistic
    onMutate: async (variables) => {
      // Optionnel: cancel queries en cours pour éviter race conditions
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      return { variables };
    },
  });
}

/**
 * Hook mutation pour mettre à jour quantité
 */
export function useUpdateCartMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCartAction,
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
    },
    onError: (error, _variables) => {
      console.error('Update cart error:', error);
      // Rollback automatique géré par useOptimistic
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      return { variables };
    },
  });
}

/**
 * Hook mutation pour supprimer du cart
 */
export function useRemoveFromCartMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeFromCartAction,
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
    },
    onError: (error) => {
      console.error('Remove from cart error:', error);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      return { variables };
    },
  });
}

/**
 * === Hook Unifié Cart avec Optimistic + Server State ===
 * Combine useOptimistic + React Query pour UX optimale
 */
import { useCartOptimistic, useDebouncedSync } from './use-cart-optimistic';
import { useCallback } from 'react';

export function useCartHybrid() {
  // 1. État serveur avec React Query
  const { data: serverCart, isLoading, error, refetch } = useCartQuery();
  const addMutation = useAddToCartMutation();
  const updateMutation = useUpdateCartMutation();
  const removeMutation = useRemoveFromCartMutation();

  // 2. État optimiste avec React 19
  const {
    optimisticItems,
    itemCount,
    subtotal,
    addItemOptimistic,
    updateQuantityOptimistic,
    removeItemOptimistic,
    hasItem,
    getItem,
  } = useCartOptimistic(serverCart?.items || []);

  // 3. Sync debouncé avec serveur
  const { debouncedSync: debouncedAddToCart } = useDebouncedSync(
    useCallback(async (product: Product, quantity: number) => {
      await addMutation.mutateAsync({ 
        productId: product.id, 
        quantity 
      });
    }, [addMutation]),
    300 // 300ms optimal selon doc
  );

  const { debouncedSync: debouncedUpdateCart } = useDebouncedSync(
    useCallback(async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeMutation.mutateAsync(productId);
      } else {
        await updateMutation.mutateAsync({ productId, quantity });
      }
    }, [updateMutation, removeMutation]),
    300
  );

  // 4. Actions hybrides (optimiste + sync serveur)
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    // 1. Update optimiste immédiat (0ms perceived latency)
    addItemOptimistic(product, quantity);
    
    // 2. Sync serveur debouncé (300ms)
    debouncedAddToCart(product, quantity);
  }, [addItemOptimistic, debouncedAddToCart]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    // 1. Update optimiste immédiat
    updateQuantityOptimistic(productId, quantity);
    
    // 2. Sync serveur debouncé
    debouncedUpdateCart(productId, quantity);
  }, [updateQuantityOptimistic, debouncedUpdateCart]);

  const removeItem = useCallback((productId: string) => {
    // 1. Update optimiste immédiat
    removeItemOptimistic(productId);
    
    // 2. Sync serveur immédiat (action destructive)
    removeMutation.mutate(productId);
  }, [removeItemOptimistic, removeMutation]);

  return {
    // État unifié (optimiste + serveur)
    items: optimisticItems,
    itemCount,
    subtotal,
    isLoading,
    error,
    
    // Actions hybrides
    addToCart,
    updateQuantity,
    removeItem,
    
    // Utilitaires
    hasItem,
    getItem,
    refetch,
    
    // États mutations (pour UI loading)
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}