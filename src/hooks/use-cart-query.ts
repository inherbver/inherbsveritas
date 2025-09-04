/**
 * === 🛒 Cart React Query Hooks ===
 * Hooks React Query pour le système cart HerbisVeritas
 * Integration avec Supabase + optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { supabase } from '@/lib/supabase/client'; // TODO: Uncomment for Phase 2 avec RPC functions
import { useAuth } from '@/lib/auth/hooks/use-auth-user';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const cartKeys = {
  all: ['cart'] as const,
  user: (userId: string | undefined) => ['cart', 'user', userId] as const,
  guest: (sessionId: string) => ['cart', 'guest', sessionId] as const,
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface CartQueryData {
  id: string;
  user_id: string | null;
  guest_id: string | null;
  updated_at: string;
  status: string;
  items: any[];
  total_items: number;
  subtotal: number;
}

interface AddToCartParams {
  productId: string;
  quantity?: number;
}

interface UpdateQuantityParams {
  productId: string;
  quantity: number;
}

interface RemoveItemParams {
  productId: string;
}

// ============================================================================
// CART QUERY HOOK
// ============================================================================

/**
 * Hook principal pour récupérer les données cart
 * Support user connecté + guest cart
 */
export function useCartQuery() {
  const { user } = useAuth();
  const guestSessionId = typeof window !== 'undefined' 
    ? localStorage.getItem('herbis-guest-session') || crypto.randomUUID()
    : crypto.randomUUID();

  // Sauvegarder session guest si nouveau
  if (typeof window !== 'undefined' && !localStorage.getItem('herbis-guest-session')) {
    localStorage.setItem('herbis-guest-session', guestSessionId);
  }

  const queryKey = user?.id 
    ? cartKeys.user(user.id) 
    : cartKeys.guest(guestSessionId);

  return useQuery({
    queryKey,
    queryFn: async (): Promise<CartQueryData | null> => {
      // TODO: Utiliser user_cart_view après migration 003
      console.log('Fetching cart for:', user?.id ? `user ${user.id}` : `guest ${guestSessionId}`);
      
      // Mock empty cart pour Phase 1 Foundation
      return {
        id: crypto.randomUUID(),
        user_id: user?.id || null,
        guest_id: user?.id ? null : guestSessionId,
        updated_at: new Date().toISOString(),
        status: 'active',
        items: [],
        total_items: 0,
        subtotal: 0,
      };
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

// ============================================================================
// CART MUTATIONS HOOKS
// ============================================================================

/**
 * Hook pour ajouter un item au panier
 * Avec optimistic updates et error handling
 */
export function useAddToCartMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const guestSessionId = typeof window !== 'undefined' 
    ? localStorage.getItem('herbis-guest-session') || crypto.randomUUID()
    : crypto.randomUUID();

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: AddToCartParams) => {
      // TODO: Implémenter avec RPC functions après migration 003
      console.log('Adding to cart:', { productId, quantity, userId: user?.id, guestSessionId });
      
      // Mock success pour Phase 1 Foundation
      return { success: true, message: 'Item ajouté avec succès' };
    },
    onSuccess: () => {
      // Invalidate and refetch cart data
      const queryKey = user?.id 
        ? cartKeys.user(user.id) 
        : cartKeys.guest(guestSessionId);
      
      queryClient.invalidateQueries({ queryKey });
      
      // Simple success log (toast à implémenter avec Sonner plus tard)
      console.log('Produit ajouté au panier avec succès');
    },
    onError: (error: Error) => {
      console.error('Add to cart error:', error);
    },
  });
}

/**
 * Hook pour supprimer un item du panier
 */
export function useRemoveFromCartMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const guestSessionId = typeof window !== 'undefined' 
    ? localStorage.getItem('herbis-guest-session') || crypto.randomUUID()
    : crypto.randomUUID();

  return useMutation({
    mutationFn: async ({ productId }: RemoveItemParams) => {
      // TODO: Implémenter avec RPC functions après migration 003
      console.log('Removing from cart:', { productId, userId: user?.id, guestSessionId });
      
      // Mock success pour Phase 1 Foundation
      return { success: true, message: 'Item supprimé avec succès' };
    },
    onSuccess: () => {
      // Invalidate and refetch cart data
      const queryKey = user?.id 
        ? cartKeys.user(user.id) 
        : cartKeys.guest(guestSessionId);
      
      queryClient.invalidateQueries({ queryKey });
      
      // Simple success log
      console.log('Produit retiré du panier');
    },
    onError: (error: Error) => {
      console.error('Remove from cart error:', error);
    },
  });
}

/**
 * Hook pour mettre à jour la quantité d'un item
 */
export function useUpdateQuantityMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const guestSessionId = typeof window !== 'undefined' 
    ? localStorage.getItem('herbis-guest-session') || crypto.randomUUID()
    : crypto.randomUUID();

  return useMutation({
    mutationFn: async ({ productId, quantity }: UpdateQuantityParams) => {
      // TODO: Implémenter avec RPC functions après migration 003
      console.log('Updating cart quantity:', { productId, quantity, userId: user?.id, guestSessionId });
      
      // Mock success pour Phase 1 Foundation
      return { success: true, message: 'Quantité mise à jour avec succès' };
    },
    onSuccess: () => {
      // Invalidate and refetch cart data
      const queryKey = user?.id 
        ? cartKeys.user(user.id) 
        : cartKeys.guest(guestSessionId);
      
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      console.error('Update quantity error:', error);
    },
  });
}

// ============================================================================
// COMPUTED CART HOOKS
// ============================================================================

/**
 * Hook pour obtenir les statistiques du panier
 */
export function useCartStats() {
  const { data: cartData, isLoading } = useCartQuery();

  const stats = {
    itemCount: cartData?.total_items || 0,
    subtotal: cartData?.subtotal || 0,
    isEmpty: !cartData?.items?.length,
    hasItems: Boolean(cartData?.items?.length),
    isLoading,
  };

  return stats;
}

/**
 * Hook pour vérifier si un produit est dans le panier
 */
export function useIsInCart(productId: string) {
  const { data: cartData } = useCartQuery();

  const item = cartData?.items?.find((item: any) => item.productId === productId);
  
  return {
    isInCart: Boolean(item),
    quantity: item?.quantity || 0,
    item: item || null,
  };
}

/**
 * Hook pour obtenir les analytics des labels dans le panier
 * Spécifique HerbisVeritas
 */
export function useCartLabelsAnalytics() {
  const { data: cartData } = useCartQuery();

  const labelsDistribution = (cartData?.items || []).reduce((acc: Record<string, number>, item: any) => {
    if (item.labels && Array.isArray(item.labels)) {
      item.labels.forEach((label: string) => {
        acc[label] = (acc[label] || 0) + item.quantity;
      });
    }
    return acc;
  }, {});

  const averagePrice = cartData?.items?.length 
    ? cartData.subtotal / cartData.total_items
    : 0;

  return {
    labelsDistribution,
    averagePrice,
    totalUniqueLabels: Object.keys(labelsDistribution).length,
    mostPopularLabel: Object.entries(labelsDistribution)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || null,
  };
}

// ============================================================================
// CART ACTIONS WRAPPER
// ============================================================================

/**
 * Hook composite qui regroupe toutes les actions cart
 * Pour faciliter l'utilisation dans les composants
 */
export function useCartActions() {
  const addToCart = useAddToCartMutation();
  const removeFromCart = useRemoveFromCartMutation();
  const updateQuantity = useUpdateQuantityMutation();

  return {
    addToCart: addToCart.mutate,
    removeFromCart: removeFromCart.mutate,
    updateQuantity: updateQuantity.mutate,
    
    // Loading states
    isAdding: addToCart.isPending,
    isRemoving: removeFromCart.isPending,
    isUpdating: updateQuantity.isPending,
    isLoading: addToCart.isPending || removeFromCart.isPending || updateQuantity.isPending,
    
    // Error states
    addError: addToCart.error,
    removeError: removeFromCart.error,
    updateError: updateQuantity.error,
    hasError: Boolean(addToCart.error || removeFromCart.error || updateQuantity.error),
    
    // Reset errors
    resetErrors: () => {
      addToCart.reset();
      removeFromCart.reset();
      updateQuantity.reset();
    },
  };
}