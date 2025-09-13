/**
 * Tests d'intégration Cart Phase 2
 * Validation des optimistic updates + RPC functions + error handling
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCartActions } from '@/hooks/use-cart-actions';
import { useCartOptimistic } from '@/hooks/use-cart-optimistic';
import type { HerbisCartItem } from '@/types/herbis-veritas';
import { HerbisVeritasLabel } from '@/types/herbis-veritas';

// Mock Supabase
const mockSupabaseRpc = jest.fn();
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    rpc: mockSupabaseRpc,
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } })
        })
      })
    })
  }
}));

// Mock auth
jest.mock('@/lib/auth/hooks/use-auth-user', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } })
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Test wrapper avec QueryClient
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('Cart Phase 2 Integration', () => {
  let mockProduct: HerbisCartItem;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockProduct = {
      id: 'item-1',
      productId: 'prod-1',
      name: 'Crème Hydratante Bio',
      price: 24.99,
      quantity: 1,
      labels: [HerbisVeritasLabel.BIO, HerbisVeritasLabel.NATUREL],
      unit: '50ml',
      inci_list: ['Aqua', 'Butyrospermum Parkii', 'Glycerin'],
      image_url: 'https://example.com/creme.jpg',
      slug: 'creme-hydratante-bio',
      stock_quantity: 10,
      low_stock_threshold: 2,
    };

    // Mock RPC success by default
    mockSupabaseRpc.mockResolvedValue({
      data: { success: true },
      error: null
    });
  });

  describe('useCartActions Hook Integration', () => {
    it('should handle addToCart with optimistic updates', async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useCartActions(), { wrapper });

      act(() => {
        result.current.addToCart({
          productId: mockProduct.productId,
          name: mockProduct.name,
          price: mockProduct.price,
          quantity: 1,
          labels: mockProduct.labels || [],
          ...(mockProduct.unit && { unit: mockProduct.unit }),
          ...(mockProduct.stock_quantity && { stock_quantity: mockProduct.stock_quantity }),
        });
      });

      // Vérifier optimistic update immédiat
      expect(result.current.itemCount).toBe(1);
      expect(result.current.isInCart(mockProduct.productId)).toBe(true);

      // Attendre le sync serveur
      await waitFor(() => {
        expect(mockSupabaseRpc).toHaveBeenCalledWith('cart_add_item', {
          p_user_id: 'test-user-id',
          p_guest_id: null,
          p_product_id: mockProduct.productId,
          p_quantity: 1
        });
      });

      expect(toast.success).toHaveBeenCalledWith(`${mockProduct.name} ajouté au panier`);
    });

    it('should handle stock validation error with rollback', async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useCartActions(), { wrapper });

      // Mock erreur stock
      mockSupabaseRpc.mockRejectedValue(new Error('Stock insuffisant'));

      await act(async () => {
        try {
          await result.current.addToCart({
            productId: mockProduct.productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 15, // Plus que le stock disponible
            stock_quantity: 10,
          });
        } catch (error) {
          // Expected error
        }
      });

      // Vérifier rollback optimistic
      expect(result.current.itemCount).toBe(0);
      expect(result.current.isInCart(mockProduct.productId)).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Stock insuffisant (10 disponibles)');
    });

    it('should handle updateQuantity with debouncing', async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useCartActions(), { wrapper });

      // Ajouter d'abord un item
      act(() => {
        result.current.addToCart({
          productId: mockProduct.productId,
          name: mockProduct.name,
          price: mockProduct.price,
          quantity: 1,
        });
      });

      // Update quantity
      act(() => {
        result.current.updateQuantity(mockProduct.productId, 3);
      });

      // Vérifier optimistic update immédiat
      expect(result.current.getQuantity(mockProduct.productId)).toBe(3);

      // Attendre le debounced sync
      await waitFor(() => {
        expect(mockSupabaseRpc).toHaveBeenCalledWith('cart_update_quantity', {
          p_user_id: 'test-user-id',
          p_guest_id: null,
          p_product_id: mockProduct.productId,
          p_quantity: 3
        });
      }, { timeout: 500 });
    });

    it('should handle removeFromCart with optimistic updates', async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useCartActions(), { wrapper });

      // Ajouter d'abord un item
      act(() => {
        result.current.addToCart({
          productId: mockProduct.productId,
          name: mockProduct.name,
          price: mockProduct.price,
          quantity: 1,
        });
      });

      // Remove item
      act(() => {
        result.current.removeFromCart(mockProduct.productId);
      });

      // Vérifier optimistic update immédiat
      expect(result.current.itemCount).toBe(0);
      expect(result.current.isInCart(mockProduct.productId)).toBe(false);

      // Attendre le sync serveur
      await waitFor(() => {
        expect(mockSupabaseRpc).toHaveBeenCalledWith('cart_remove_item', {
          p_user_id: 'test-user-id',
          p_guest_id: null,
          p_product_id: mockProduct.productId
        });
      });

      expect(toast.success).toHaveBeenCalledWith(`${mockProduct.name} retiré du panier`);
    });
  });

  describe('useCartOptimistic Hook', () => {
    it('should calculate HerbisVeritas analytics correctly', () => {
      const wrapper = createTestWrapper();
      const serverItems: HerbisCartItem[] = [
        {
          ...mockProduct,
          quantity: 2,
          labels: [HerbisVeritasLabel.BIO, HerbisVeritasLabel.NATUREL]
        },
        {
          id: 'item-2',
          productId: 'prod-2',
          name: 'Savon Artisanal',
          price: 12.50,
          quantity: 1,
          labels: [HerbisVeritasLabel.BIO, HerbisVeritasLabel.ARTISANAL, HerbisVeritasLabel.LOCAL],
        }
      ];

      const { result } = renderHook(
        () => useCartOptimistic(serverItems),
        { wrapper }
      );

      // Vérifier calculs
      expect(result.current.itemCount).toBe(3); // 2 + 1
      expect(result.current.subtotal).toBe(62.48); // (24.99 * 2) + 12.50
      expect(result.current.averageItemPrice).toBeCloseTo(20.83); // 62.48 / 3

      // Vérifier analytics labels
      expect(result.current.labelsDistribution).toEqual({
        'bio': 3, // 2 + 1
        'naturel': 2, // 2 seulement sur premier item
        'artisanal': 1, // 1 sur deuxième item
        'local': 1, // 1 sur deuxième item
      });

      expect(result.current.mostPopularLabel).toBe('bio');
    });

    it('should handle optimistic actions correctly', () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(
        () => useCartOptimistic([]),
        { wrapper }
      );

      // Add item optimistically
      act(() => {
        result.current.addItemOptimistic({
          productId: mockProduct.productId,
          name: mockProduct.name,
          price: mockProduct.price,
          quantity: 1,
          labels: mockProduct.labels || [],
        });
      });

      expect(result.current.optimisticItems).toHaveLength(1);
      expect(result.current.itemCount).toBe(1);

      // Update quantity
      act(() => {
        result.current.updateQuantityOptimistic(mockProduct.productId, 3);
      });

      expect(result.current.optimisticItems[0]?.quantity).toBe(3);
      expect(result.current.itemCount).toBe(3);

      // Remove item
      act(() => {
        result.current.removeItemOptimistic(mockProduct.productId);
      });

      expect(result.current.optimisticItems).toHaveLength(0);
      expect(result.current.isEmpty).toBe(true);
    });
  });

  describe('Error Handling & Rollback', () => {
    it('should rollback on server error', async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useCartActions(), { wrapper });

      // Mock server error
      mockSupabaseRpc.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        try {
          await result.current.addToCart({
            productId: mockProduct.productId,
            name: mockProduct.name,
            price: mockProduct.price,
          });
        } catch (error) {
          // Expected error
        }
      });

      // Vérifier rollback
      expect(result.current.itemCount).toBe(0);
      expect(result.current.hasError).toBe(true);
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });

    it('should handle quantity 0 as remove action', async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useCartActions(), { wrapper });

      // Ajouter item d'abord
      act(() => {
        result.current.addToCart({
          productId: mockProduct.productId,
          name: mockProduct.name,
          price: mockProduct.price,
          quantity: 2,
        });
      });

      // Update to 0 (should remove)
      act(() => {
        result.current.updateQuantity(mockProduct.productId, 0);
      });

      expect(result.current.itemCount).toBe(0);
      
      await waitFor(() => {
        expect(mockSupabaseRpc).toHaveBeenCalledWith('cart_remove_item', {
          p_user_id: 'test-user-id',
          p_guest_id: null,
          p_product_id: mockProduct.productId
        });
      });
    });
  });

  describe('Debouncing Integration', () => {
    it('should debounce multiple rapid updates', async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useCartActions(), { wrapper });

      // Ajouter item d'abord
      act(() => {
        result.current.addToCart({
          productId: mockProduct.productId,
          name: mockProduct.name,
          price: mockProduct.price,
          quantity: 1,
        });
      });

      // Multiple updates rapides
      act(() => {
        result.current.updateQuantity(mockProduct.productId, 2);
        result.current.updateQuantity(mockProduct.productId, 3);
        result.current.updateQuantity(mockProduct.productId, 4);
      });

      // Vérifier que l'update optimistic final est correct
      expect(result.current.getQuantity(mockProduct.productId)).toBe(4);

      // Attendre le debouncing (300ms)
      await waitFor(() => {
        expect(mockSupabaseRpc).toHaveBeenLastCalledWith('cart_update_quantity', {
          p_user_id: 'test-user-id',
          p_guest_id: null,
          p_product_id: mockProduct.productId,
          p_quantity: 4
        });
      }, { timeout: 500 });

      // Should be called only once due to debouncing
      const updateCalls = mockSupabaseRpc.mock.calls.filter(call => 
        call[0] === 'cart_update_quantity'
      );
      expect(updateCalls).toHaveLength(1);
    });
  });

  describe('Stock Validation', () => {
    it('should prevent adding more than available stock', async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useCartActions(), { wrapper });

      await act(async () => {
        try {
          await result.current.addToCart({
            productId: mockProduct.productId,
            name: mockProduct.name,
            price: mockProduct.price,
            quantity: 15, // More than stock (10)
            stock_quantity: 10,
          });
        } catch (error) {
          expect(error).toEqual(new Error('Stock insuffisant (10 disponibles)'));
        }
      });

      expect(result.current.itemCount).toBe(0);
      expect(toast.error).toHaveBeenCalledWith('Stock insuffisant (10 disponibles)');
    });

    it('should prevent updating quantity beyond stock', async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useCartActions(), { wrapper });

      // Ajouter item d'abord
      act(() => {
        result.current.addToCart({
          productId: mockProduct.productId,
          name: mockProduct.name,
          price: mockProduct.price,
          quantity: 1,
          stock_quantity: 5,
        });
      });

      // Essayer d'update au-delà du stock
      await act(async () => {
        try {
          await result.current.updateQuantity(mockProduct.productId, 10);
        } catch (error) {
          expect(error).toEqual(new Error('Stock insuffisant (5 disponibles)'));
        }
      });

      // Vérifier rollback
      expect(result.current.getQuantity(mockProduct.productId)).toBe(1);
    });
  });
});