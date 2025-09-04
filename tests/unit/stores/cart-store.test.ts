import { renderHook, act } from '@testing-library/react';
import { useCartStore, useCartActions, useCartState } from '@/stores/cart-store';
import { Product, HerbisVeritasLabel } from '@/types/herbis-veritas';

// Mock crypto pour les tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123'
  }
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Cart Store', () => {
  // Mock product pour tests
  const mockProduct: Product = {
    id: 'prod-1',
    sku: 'TEST-001',
    category_id: 'cat-1',
    i18n: {
      fr: {
        name: 'Savon Lavande',
        description: 'Savon artisanal à la lavande',
      },
      en: {
        name: 'Lavender Soap',
        description: 'Artisanal lavender soap',
      }
    },
    price: 12.50,
    stock_quantity: 10,
    low_stock_threshold: 2,
    inci_list: ['Sodium Olivate', 'Lavandula Angustifolia'],
    labels: [HerbisVeritasLabel.BIO, HerbisVeritasLabel.ARTISANAL],
    images: ['soap1.jpg'],
    is_active: true,
    is_featured: false,
    created_at: '2025-01-28T10:00:00Z',
    updated_at: '2025-01-28T10:00:00Z'
  };

  beforeEach(() => {
    // Reset store avant chaque test
    useCartStore.getState().clearCart();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useCartState());
      
      expect(result.current.cart).toBeNull();
      expect(result.current.itemCount).toBe(0);
      expect(result.current.subtotal).toBe(0);
      expect(result.current.tva).toBe(0);
      expect(result.current.total).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Add Item', () => {
    it('adds new item to empty cart', () => {
      const { result: actions } = renderHook(() => useCartActions());
      const { result: state } = renderHook(() => useCartState());

      act(() => {
        actions.current.addItem(mockProduct, 2);
      });

      expect(state.current.cart).not.toBeNull();
      expect(state.current.cart?.items).toHaveLength(1);
      expect(state.current.cart?.items[0]!).toEqual({
        product_id: 'prod-1',
        quantity: 2,
        price: 12.50,
        product: mockProduct
      });
      expect(state.current.itemCount).toBe(2);
      expect(state.current.subtotal).toBe(25.00); // 2 * 12.50
    });

    it('updates quantity for existing item', () => {
      const { result: actions } = renderHook(() => useCartActions());
      const { result: state } = renderHook(() => useCartState());

      act(() => {
        actions.current.addItem(mockProduct, 1);
      });

      act(() => {
        actions.current.addItem(mockProduct, 2);
      });

      expect(state.current.cart?.items).toHaveLength(1);
      expect(state.current.cart?.items[0]!.quantity).toBe(3);
      expect(state.current.itemCount).toBe(3);
      expect(state.current.subtotal).toBe(37.50); // 3 * 12.50
    });

    it('validates stock before adding', () => {
      const outOfStockProduct = {
        ...mockProduct,
        stock_quantity: 1
      };

      const { result: actions } = renderHook(() => useCartActions());
      const { result: state } = renderHook(() => useCartState());

      act(() => {
        actions.current.addItem(outOfStockProduct, 5);
      });

      expect(state.current.cart).toBeNull();
      expect(state.current.error).toContain('Stock insuffisant');
    });

    it('calculates TVA correctly (20%)', () => {
      const { result: actions } = renderHook(() => useCartActions());
      const { result: state } = renderHook(() => useCartState());

      act(() => {
        actions.current.addItem(mockProduct, 4); // 4 * 12.50 = 50€
      });

      expect(state.current.subtotal).toBe(50.00);
      expect(state.current.tva).toBe(10.00); // 20% de 50€
      expect(state.current.total).toBe(60.00); // 50€ + 10€ TVA
    });
  });

  describe('Remove Item', () => {
    beforeEach(() => {
      const { result: actions } = renderHook(() => useCartActions());
      act(() => {
        actions.current.addItem(mockProduct, 2);
      });
    });

    it('removes item completely', () => {
      const { result: actions } = renderHook(() => useCartActions());
      const { result: state } = renderHook(() => useCartState());

      act(() => {
        actions.current.removeItem('prod-1');
      });

      expect(state.current.cart?.items).toHaveLength(0);
      expect(state.current.itemCount).toBe(0);
      expect(state.current.subtotal).toBe(0);
    });

    it('does nothing for non-existent item', () => {
      const { result: actions } = renderHook(() => useCartActions());
      const { result: state } = renderHook(() => useCartState());

      const initialItemCount = state.current.itemCount;

      act(() => {
        actions.current.removeItem('non-existent');
      });

      expect(state.current.itemCount).toBe(initialItemCount);
    });
  });

  describe('Update Quantity', () => {
    beforeEach(() => {
      const { result: actions } = renderHook(() => useCartActions());
      act(() => {
        actions.current.addItem(mockProduct, 2);
      });
    });

    it('updates quantity correctly', () => {
      const { result: actions } = renderHook(() => useCartActions());
      const { result: state } = renderHook(() => useCartState());

      act(() => {
        actions.current.updateQuantity('prod-1', 5);
      });

      expect(state.current.cart?.items[0]!.quantity).toBe(5);
      expect(state.current.itemCount).toBe(5);
      expect(state.current.subtotal).toBe(62.50); // 5 * 12.50
    });

    it('removes item when quantity is 0', () => {
      const { result: actions } = renderHook(() => useCartActions());
      const { result: state } = renderHook(() => useCartState());

      act(() => {
        actions.current.updateQuantity('prod-1', 0);
      });

      expect(state.current.cart?.items).toHaveLength(0);
      expect(state.current.itemCount).toBe(0);
    });

    it('validates stock when updating quantity', () => {
      const { result: actions } = renderHook(() => useCartActions());
      const { result: state } = renderHook(() => useCartState());

      act(() => {
        actions.current.updateQuantity('prod-1', 15); // Plus que stock (10)
      });

      expect(state.current.error).toContain('Stock insuffisant');
      expect(state.current.cart?.items[0]!.quantity).toBe(2); // Inchangé
    });
  });

  describe('Clear Cart', () => {
    beforeEach(() => {
      const { result: actions } = renderHook(() => useCartActions());
      act(() => {
        actions.current.addItem(mockProduct, 3);
      });
    });

    it('clears all cart data', () => {
      const { result: actions } = renderHook(() => useCartActions());
      const { result: state } = renderHook(() => useCartState());

      act(() => {
        actions.current.clearCart();
      });

      expect(state.current.cart).toBeNull();
      expect(state.current.itemCount).toBe(0);
      expect(state.current.subtotal).toBe(0);
      expect(state.current.tva).toBe(0);
      expect(state.current.total).toBe(0);
      expect(state.current.error).toBeNull();
    });
  });

  describe('Utility Functions', () => {
    beforeEach(() => {
      const { result: actions } = renderHook(() => useCartActions());
      act(() => {
        actions.current.addItem(mockProduct, 1);
      });
    });

    it('getItem returns correct item', () => {
      const store = useCartStore.getState();
      const item = store.getItem('prod-1');
      
      expect(item).toBeDefined();
      expect(item?.product_id).toBe('prod-1');
      expect(item?.quantity).toBe(1);
    });

    it('hasItem returns correct boolean', () => {
      const store = useCartStore.getState();
      
      expect(store.hasItem('prod-1')).toBe(true);
      expect(store.hasItem('non-existent')).toBe(false);
    });

    it('resetError clears error state', () => {
      const { result: actions } = renderHook(() => useCartActions());
      const { result: state } = renderHook(() => useCartState());

      // Force une erreur
      act(() => {
        actions.current.addItem({
          ...mockProduct,
          stock_quantity: 0
        }, 1);
      });

      expect(state.current.error).toBeTruthy();

      act(() => {
        actions.current.resetError();
      });

      expect(state.current.error).toBeNull();
    });
  });

  describe('Merge Guest Cart', () => {
    const mockUserCart = {
      id: 'user-cart-1',
      user_id: 'user-1',
      items: [
        {
          product_id: 'prod-2',
          quantity: 1,
          price: 15.00,
        }
      ],
      subtotal: 15.00,
      created_at: '2025-01-28T09:00:00Z',
      updated_at: '2025-01-28T09:30:00Z'
    };

    it('merges guest cart with user cart', () => {
      const { result: actions } = renderHook(() => useCartActions());
      const { result: state } = renderHook(() => useCartState());

      // Ajouter item guest
      act(() => {
        actions.current.addItem(mockProduct, 1);
      });

      // Merger avec user cart
      act(() => {
        actions.current.mergeGuestCart(mockUserCart);
      });

      expect(state.current.cart?.items).toHaveLength(2);
      expect(state.current.cart?.user_id).toBe('user-1');
      expect(state.current.itemCount).toBe(2);
    });

    it('combines quantities for same products', () => {
      const userCartSameProduct = {
        ...mockUserCart,
        items: [
          {
            product_id: 'prod-1', // Même produit
            quantity: 2,
            price: 12.50,
          }
        ]
      };

      const { result: actions } = renderHook(() => useCartActions());
      const { result: state } = renderHook(() => useCartState());

      act(() => {
        actions.current.addItem(mockProduct, 1);
      });

      act(() => {
        actions.current.mergeGuestCart(userCartSameProduct);
      });

      expect(state.current.cart?.items).toHaveLength(1);
      expect(state.current.cart?.items[0]!.quantity).toBe(3); // 1 + 2
      expect(state.current.itemCount).toBe(3);
    });
  });
});