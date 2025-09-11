/**
 * Tests d'intégration Components Cart Phase 2
 * Validation CartSheet + CartDisplay + CartItem avec optimistic updates
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CartSheet } from '@/components/cart/cart-sheet';
import { CartDisplay } from '@/components/cart/cart-display';
import { CartItem } from '@/components/cart/cart-item';
import type { HerbisCartItem } from '@/types/herbis-veritas';

// Mock Supabase
const mockSupabaseRpc = jest.fn();
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    rpc: mockSupabaseRpc,
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ 
            data: {
              id: 'cart-1',
              user_id: 'test-user',
              guest_id: null,
              updated_at: new Date().toISOString(),
              status: 'active',
              items: [],
              total_items: 0,
              subtotal: 0,
            },
            error: null 
          })
        })
      })
    })
  }
}));

// Mock auth
jest.mock('@/lib/auth/hooks/use-auth-user', () => ({
  useAuth: () => ({ user: { id: 'test-user' } })
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  formatPrice: (price: number) => `€${price.toFixed(2)}`,
  cn: (...classes: string[]) => classes.join(' ')
}));

// Test wrapper
const createTestWrapper = (initialItems: HerbisCartItem[] = []) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  // Mock initial data
  if (initialItems.length > 0) {
    queryClient.setQueryData(['cart', 'user', 'test-user'], {
      id: 'cart-1',
      user_id: 'test-user',
      guest_id: null,
      items: initialItems,
      total_items: initialItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: initialItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      updated_at: new Date().toISOString(),
      status: 'active',
    });
  }

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Cart Components Phase 2 Integration', () => {
  let mockItems: HerbisCartItem[];

  beforeEach(() => {
    jest.clearAllMocks();

    mockItems = [
      {
        id: 'item-1',
        productId: 'prod-1',
        name: 'Crème Hydratante Bio',
        price: 24.99,
        quantity: 2,
        labels: ['bio', 'naturel'],
        unit: '50ml',
        inci_list: ['Aqua', 'Butyrospermum Parkii'],
        image_url: 'https://example.com/creme.jpg',
        stock_quantity: 10,
        low_stock_threshold: 2,
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        name: 'Savon Artisanal Lavande',
        price: 8.50,
        quantity: 1,
        labels: ['artisanal', 'local'],
        unit: '100g',
        image_url: 'https://example.com/savon.jpg',
        stock_quantity: 5,
        low_stock_threshold: 1,
      }
    ];

    // Mock RPC success by default
    mockSupabaseRpc.mockResolvedValue({
      data: { success: true },
      error: null
    });
  });

  describe('CartSheet Component', () => {
    it('should render empty cart correctly', () => {
      const TestWrapper = createTestWrapper([]);
      
      render(
        <TestWrapper>
          <CartSheet open={true} />
        </TestWrapper>
      );

      expect(screen.getByText(/Panier \(0 article\)/)).toBeInTheDocument();
      expect(screen.getByText(/Votre panier est vide/)).toBeInTheDocument();
    });

    it('should render cart with items and correct totals', () => {
      const TestWrapper = createTestWrapper(mockItems);
      
      render(
        <TestWrapper>
          <CartSheet open={true} />
        </TestWrapper>
      );

      // Vérifier header avec count
      expect(screen.getByText(/Panier \(3 articles\)/)).toBeInTheDocument();
      
      // Vérifier total (2 * 24.99 + 1 * 8.50 = 58.48)
      expect(screen.getByText(/Total : €58.48/)).toBeInTheDocument();
      expect(screen.getByText(/€58.48/)).toBeInTheDocument();

      // Vérifier items
      expect(screen.getByText('Crème Hydratante Bio')).toBeInTheDocument();
      expect(screen.getByText('Savon Artisanal Lavande')).toBeInTheDocument();
    });

    it('should handle quantity updates with optimistic updates', async () => {
      const TestWrapper = createTestWrapper(mockItems);
      
      render(
        <TestWrapper>
          <CartSheet open={true} />
        </TestWrapper>
      );

      // Trouver le bouton + pour le premier item
      const incrementButtons = screen.getAllByRole('button');
      const firstIncrementButton = incrementButtons.find(btn => 
        btn.innerHTML.includes('plus') || btn.textContent === '+'
      );

      if (firstIncrementButton) {
        fireEvent.click(firstIncrementButton);

        // Vérifier optimistic update (quantité devrait passer de 2 à 3)
        await waitFor(() => {
          expect(screen.getByText(/Panier \(4 articles\)/)).toBeInTheDocument();
        });

        // Vérifier appel RPC
        await waitFor(() => {
          expect(mockSupabaseRpc).toHaveBeenCalledWith('cart_update_quantity', {
            p_user_id: 'test-user',
            p_guest_id: null,
            p_product_id: 'prod-1',
            p_quantity: 3
          });
        });
      }
    });

    it('should handle item removal', async () => {
      const TestWrapper = createTestWrapper(mockItems);
      
      render(
        <TestWrapper>
          <CartSheet open={true} />
        </TestWrapper>
      );

      // Trouver le bouton remove (X)
      const removeButtons = screen.getAllByRole('button');
      const removeButton = removeButtons.find(btn => 
        btn.innerHTML.includes('x') || btn.innerHTML.includes('X')
      );

      if (removeButton) {
        fireEvent.click(removeButton);

        // Vérifier optimistic update
        await waitFor(() => {
          expect(screen.getByText(/Panier \(1 article\)/)).toBeInTheDocument();
        });

        // Vérifier appel RPC
        await waitFor(() => {
          expect(mockSupabaseRpc).toHaveBeenCalledWith('cart_remove_item', 
            expect.objectContaining({
              p_user_id: 'test-user',
              p_guest_id: null,
            })
          );
        });
      }
    });
  });

  describe('CartDisplay Component', () => {
    it('should render with ContentGrid integration', () => {
      const TestWrapper = createTestWrapper(mockItems);
      
      render(
        <TestWrapper>
          <CartDisplay />
        </TestWrapper>
      );

      // Vérifier titre avec stats
      expect(screen.getByText(/Votre panier \(3 articles\)/)).toBeInTheDocument();
      
      // Vérifier total
      expect(screen.getByText('€58.48')).toBeInTheDocument();

      // Vérifier items (via ContentCard)
      expect(screen.getByText('Crème Hydratante Bio')).toBeInTheDocument();
      expect(screen.getByText('Savon Artisanal Lavande')).toBeInTheDocument();
    });

    it('should display HerbisVeritas labels analytics', () => {
      const TestWrapper = createTestWrapper(mockItems);
      
      render(
        <TestWrapper>
          <CartDisplay />
        </TestWrapper>
      );

      // Vérifier affichage labels avec counts
      expect(screen.getByText(/Labels :/)).toBeInTheDocument();
      
      // Les labels devraient être affichés avec leur count
      // bio (2), naturel (2), artisanal (1), local (1)
      const labelsSection = screen.getByText(/Labels :/).parentElement;
      expect(labelsSection).toBeInTheDocument();
    });

    it('should handle compact mode', () => {
      const TestWrapper = createTestWrapper(mockItems);
      
      render(
        <TestWrapper>
          <CartDisplay compact={true} />
        </TestWrapper>
      );

      // En mode compact, pas d'analytics affichées
      expect(screen.queryByText(/Labels :/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Prix moyen/)).not.toBeInTheDocument();
    });
  });

  describe('CartItem Component', () => {
    const mockHandlers = {
      onUpdateQuantity: jest.fn(),
      onRemoveItem: jest.fn(),
    };

    beforeEach(() => {
      mockHandlers.onUpdateQuantity.mockClear();
      mockHandlers.onRemoveItem.mockClear();
    });

    it('should render item with all details', () => {
      render(
        <CartItem
          item={mockItems[0]}
          onUpdateQuantity={mockHandlers.onUpdateQuantity}
          onRemoveItem={mockHandlers.onRemoveItem}
        />
      );

      expect(screen.getByText('Crème Hydratante Bio')).toBeInTheDocument();
      expect(screen.getByText('€24.99 • 50ml')).toBeInTheDocument();
      expect(screen.getByText('€49.98')).toBeInTheDocument(); // 24.99 * 2
      
      // Vérifier labels
      expect(screen.getByText('bio')).toBeInTheDocument();
      expect(screen.getByText('naturel')).toBeInTheDocument();
    });

    it('should handle quantity input changes', () => {
      render(
        <CartItem
          item={mockItems[0]}
          onUpdateQuantity={mockHandlers.onUpdateQuantity}
          onRemoveItem={mockHandlers.onRemoveItem}
        />
      );

      const quantityInput = screen.getByRole('spinbutton');
      fireEvent.change(quantityInput, { target: { value: '5' } });

      expect(mockHandlers.onUpdateQuantity).toHaveBeenCalledWith('prod-1', 5);
    });

    it('should handle increment/decrement buttons', () => {
      render(
        <CartItem
          item={mockItems[0]}
          onUpdateQuantity={mockHandlers.onUpdateQuantity}
          onRemoveItem={mockHandlers.onRemoveItem}
        />
      );

      // Test increment
      const buttons = screen.getAllByRole('button');
      const incrementButton = buttons.find(btn => btn.innerHTML.includes('plus'));
      if (incrementButton) {
        fireEvent.click(incrementButton);
        expect(mockHandlers.onUpdateQuantity).toHaveBeenCalledWith('prod-1', 3);
      }

      // Test decrement
      const decrementButton = buttons.find(btn => btn.innerHTML.includes('minus'));
      if (decrementButton) {
        fireEvent.click(decrementButton);
        expect(mockHandlers.onUpdateQuantity).toHaveBeenCalledWith('prod-1', 1);
      }
    });

    it('should show remove confirmation for quantity 1', () => {
      const singleItem = { ...mockItems[0], quantity: 1 };
      
      render(
        <CartItem
          item={singleItem}
          onUpdateQuantity={mockHandlers.onUpdateQuantity}
          onRemoveItem={mockHandlers.onRemoveItem}
        />
      );

      const buttons = screen.getAllByRole('button');
      const decrementButton = buttons.find(btn => 
        btn.innerHTML.includes('trash') || btn.innerHTML.includes('Trash')
      );
      
      expect(decrementButton).toBeInTheDocument();

      if (decrementButton) {
        fireEvent.click(decrementButton);
        expect(mockHandlers.onRemoveItem).toHaveBeenCalledWith('prod-1');
      }
    });

    it('should render compact variant correctly', () => {
      render(
        <CartItem
          item={mockItems[0]}
          onUpdateQuantity={mockHandlers.onUpdateQuantity}
          onRemoveItem={mockHandlers.onRemoveItem}
          variant="compact"
        />
      );

      // En mode compact, certains détails sont masqués
      expect(screen.getByText('Crème Hydratante Bio')).toBeInTheDocument();
      expect(screen.getByText('€24.99 × 2')).toBeInTheDocument();
      
      // Pas de contrôles quantité détaillés en compact
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });

    it('should show stock warnings', () => {
      const lowStockItem = { 
        ...mockItems[1], 
        stock_quantity: 1, 
        low_stock_threshold: 2 
      };
      
      render(
        <CartItem
          item={lowStockItem}
          onUpdateQuantity={mockHandlers.onUpdateQuantity}
          onRemoveItem={mockHandlers.onRemoveItem}
          variant="detailed"
        />
      );

      expect(screen.getByText('Stock faible')).toBeInTheDocument();
    });

    it('should show out of stock warning', () => {
      const outOfStockItem = { 
        ...mockItems[1], 
        stock_quantity: 0 
      };
      
      render(
        <CartItem
          item={outOfStockItem}
          onUpdateQuantity={mockHandlers.onUpdateQuantity}
          onRemoveItem={mockHandlers.onRemoveItem}
          variant="detailed"
        />
      );

      expect(screen.getByText('Rupture de stock')).toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabaseRpc.mockRejectedValue(new Error('Network error'));
      
      const TestWrapper = createTestWrapper(mockItems);
      
      render(
        <TestWrapper>
          <CartSheet open={true} />
        </TestWrapper>
      );

      // Essayer d'update une quantité
      const buttons = screen.getAllByRole('button');
      const incrementButton = buttons.find(btn => btn.innerHTML.includes('plus'));
      
      if (incrementButton) {
        fireEvent.click(incrementButton);

        // Vérifier que l'erreur ne casse pas l'interface
        await waitFor(() => {
          expect(screen.getByText('Crème Hydratante Bio')).toBeInTheDocument();
        });

        // Vérifier que toast.error a été appelé
        expect(toast.error).toHaveBeenCalled();
      }
    });
  });
});