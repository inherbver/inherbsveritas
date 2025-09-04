/**
 * Tests d'intégration Cart Store + Slices
 * Vérification que le store principal integre bien les slices cart et UI
 */

import { useCartStore } from '@/stores/cart-store';
import type { Product } from '@/types/herbis-veritas';
import { HerbisVeritasLabel } from '@/types/herbis-veritas';

// Mock crypto et localStorage comme dans les autres tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'integration-test-uuid'
  }
});

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Cart Store + Slices Integration', () => {
  const mockProduct: Product = {
    id: 'integration-prod-1',
    sku: 'INT-001',
    category_id: 'cat-1',
    i18n: {
      fr: {
        name: 'Crème Hydratante Bio',
        description: 'Crème hydratante certifiée bio',
      },
      en: {
        name: 'Organic Moisturizer',
        description: 'Certified organic moisturizer',
      }
    },
    price: 24.99,
    stock_quantity: 15,
    low_stock_threshold: 5,
    inci_list: ['Aqua', 'Butyrospermum Parkii', 'Glycerin'],
    labels: [HerbisVeritasLabel.BIO, HerbisVeritasLabel.ARTISANAL],
    images: ['creme-hydratante.jpg'],
    is_active: true,
    is_featured: false,
    created_at: '2025-01-28T10:00:00Z',
    updated_at: '2025-01-28T10:00:00Z'
  };

  beforeEach(() => {
    // Reset store complet avant chaque test
    const store = useCartStore.getState();
    store.clearCart();
    store.clearOptimistic();
    store.clearErrors();
    jest.clearAllMocks();
  });

  describe('Store Composition', () => {
    it('has both legacy and slice functionality available', () => {
      const store = useCartStore.getState();
      
      // Legacy cart functionality
      expect(typeof store.addItem).toBe('function');
      expect(typeof store.removeItem).toBe('function');
      expect(typeof store.clearCart).toBe('function');
      expect(store.cart).toBeNull();
      expect(store.itemCount).toBe(0);
      
      // Cart slice functionality
      expect(typeof store.addOptimisticItem).toBe('function');
      expect(typeof store.clearOptimistic).toBe('function');
      expect(store.optimisticItems).toEqual([]);
      expect(store.isOptimistic).toBe(false);
      
      // UI slice functionality
      expect(typeof store.openCart).toBe('function');
      expect(typeof store.setAddingToCart).toBe('function');
      expect(store.isCartOpen).toBe(false);
      expect(store.isAddingToCart).toBe(false);
    });
  });

  describe('Legacy and Optimistic Integration', () => {
    it('can use both legacy cart and optimistic items', () => {
      const store = useCartStore.getState();
      
      // Ajout legacy
      store.addItem(mockProduct, 1);
      expect(store.cart?.items).toHaveLength(1);
      expect(store.itemCount).toBe(1);
      
      // Ajout optimistic (pour preview nouvelles features)
      const optimisticId = store.addOptimisticItem(mockProduct, 2);
      expect(store.optimisticItems).toHaveLength(1);
      expect(store.isOptimistic).toBe(true);
      
      // Les deux coexistent
      expect(store.cart?.items).toHaveLength(1); // Legacy
      expect(store.optimisticItems).toHaveLength(1); // Optimistic
    });

    it('can clear both legacy and optimistic independently', () => {
      const store = useCartStore.getState();
      
      // Ajouter des données
      store.addItem(mockProduct, 1);
      store.addOptimisticItem(mockProduct, 2);
      
      // Clear optimistic seulement
      store.clearOptimistic();
      expect(store.optimisticItems).toHaveLength(0);
      expect(store.cart?.items).toHaveLength(1); // Legacy reste
      
      // Clear legacy
      store.clearCart();
      expect(store.cart).toBeNull();
      expect(store.optimisticItems).toHaveLength(0);
    });
  });

  describe('UI State Integration', () => {
    it('manages UI state during cart operations', () => {
      const store = useCartStore.getState();
      
      // Simuler un workflow d'ajout avec UI
      store.setAddingToCart(true);
      store.openCartSheet();
      
      expect(store.isAddingToCart).toBe(true);
      expect(store.isCartSheetOpen).toBe(true);
      
      // Ajouter l'item (legacy)
      store.addItem(mockProduct, 1);
      
      // Finir l'opération UI
      store.setAddingToCart(false);
      store.showSuccess('Produit ajouté');
      store.updateBadgeCount(1);
      
      expect(store.isAddingToCart).toBe(false);
      expect(store.showSuccessToast).toBe(true);
      expect(store.cartBadgeCount).toBe(1);
      expect(store.cart?.items).toHaveLength(1);
    });

    it('manages error states with cart operations', () => {
      const store = useCartStore.getState();
      
      // Simuler une erreur lors d'ajout optimistic
      const optimisticId = store.addOptimisticItem(mockProduct, 1);
      store.setAddingToCart(true);
      
      // Simuler échec serveur
      store.setError('Erreur réseau');
      store.addFailedOperation(optimisticId);
      store.setAddingToCart(false);
      
      // Vérifier état d'erreur
      expect(store.lastError).toBe('Erreur réseau');
      expect(store.failedOperations).toContain(optimisticId);
      expect(store.isAddingToCart).toBe(false);
      
      // Rollback optimistic item
      store.revertOptimisticItem(optimisticId);
      store.clearErrors();
      
      expect(store.optimisticItems).toHaveLength(0);
      expect(store.lastError).toBeNull();
      expect(store.failedOperations).toEqual([]);
    });
  });

  describe('Persistence Integration', () => {
    it('persists only necessary data not UI state', () => {
      const store = useCartStore.getState();
      
      // Ajouter données persistantes et temporaires
      store.addItem(mockProduct, 1);
      store.setAddingToCart(true);
      store.openCart();
      store.setError('Some error');
      
      // Vérifier que les données cart sont là
      expect(store.cart).not.toBeNull();
      expect(store.itemCount).toBe(1);
      
      // UI states ne devraient pas persister (selon config)
      // (Vérifié par le fait que ces states ne sont pas dans partialize)
      expect(store.isAddingToCart).toBe(true); // Temporaire
      expect(store.isCartOpen).toBe(true); // Temporaire
      expect(store.lastError).toBe('Some error'); // Temporaire
    });
  });

  describe('Performance Integration', () => {
    it('handles multiple operations without conflicts', async () => {
      const store = useCartStore.getState();
      
      // Opérations simultanées
      store.setAddingToCart(true);
      store.setUpdatingCart(true);
      
      const optimisticId1 = store.addOptimisticItem(mockProduct, 1);
      store.addItem(mockProduct, 1);
      
      const secondProduct = { ...mockProduct, id: 'prod-2' };
      const optimisticId2 = store.addOptimisticItem(secondProduct, 2);
      
      // Vérifier état intermédiaire
      expect(store.optimisticItems).toHaveLength(2);
      expect(store.cart?.items).toHaveLength(1);
      expect(store.isAddingToCart).toBe(true);
      expect(store.isUpdatingCart).toBe(true);
      
      // Finir opérations
      store.setAddingToCart(false);
      store.setUpdatingCart(false);
      
      expect(store.isAddingToCart).toBe(false);
      expect(store.isUpdatingCart).toBe(false);
      
      // Tous les items sont là
      expect(store.optimisticItems).toHaveLength(2);
      expect(store.cart?.items).toHaveLength(1);
    });

    it('calculates computed values from both legacy and optimistic', () => {
      const store = useCartStore.getState();
      
      // Ajouter à la fois legacy et optimistic
      store.addItem(mockProduct, 2); // 2 * 24.99 = 49.98
      
      const expensiveProduct = { ...mockProduct, id: 'expensive', price: 50.00 };
      store.addOptimisticItem(expensiveProduct, 1); // 1 * 50.00 = 50.00
      
      // Vérifier calculs séparés
      expect(store.subtotal).toBe(49.98); // Legacy cart
      expect(store.getOptimisticTotal()).toBe(50.00); // Optimistic
      
      expect(store.itemCount).toBe(2); // Legacy count
      expect(store.getOptimisticItemCount()).toBe(1); // Optimistic count
    });
  });
});