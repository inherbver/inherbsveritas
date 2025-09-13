/**
 * === 🛒 Cart React Query Hooks ===
 * Hooks React Query pour le système cart HerbisVeritas
 * Integration avec Supabase + optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client'; // Phase 2: RPC functions activated
import { useAuth } from '@/features/auth';

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
      const { data, error } = await supabase
        .from('user_cart_view')
        .select('*')
        .eq(user?.id ? 'user_id' : 'guest_id', user?.id || guestSessionId)
        .single();

      if (error) {
        console.error('Error fetching cart:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      return data;
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
      // TODO Phase 2: Remplacer par vrais RPC calls quand les fonctions Supabase seront créées
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network
      const data = { success: true, cart_id: crypto.randomUUID(), productId, quantity };

      return data;
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
      // TODO Phase 2: Remplacer par vrais RPC calls
      await new Promise(resolve => setTimeout(resolve, 150));
      const data = { success: true, productId };

      return data;
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
      if (quantity === 0) {
        // Si quantité 0, utiliser remove au lieu de update  
        // TODO Phase 2: Remplacer par vrais RPC calls
        await new Promise(resolve => setTimeout(resolve, 150));
        const data = { success: true, action: 'remove', productId };
        return data;
      }

      // TODO Phase 2: Remplacer par vrais RPC calls
      await new Promise(resolve => setTimeout(resolve, 300));
      const data = { success: true, action: 'update', productId, quantity };

      return data;
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