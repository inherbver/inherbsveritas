/**
 * Tests unitaires Cart Slice - Optimistic Updates
 * Tests des nouveaux patterns React 19 pour le cart HerbisVeritas
 */

import { create } from 'zustand';
import { createCartSlice, type CartSlice } from '@/stores/slices/cart-slice';
import type { Product } from '@/types/herbis-veritas';
import { HerbisVeritasLabel } from '@/types/herbis-veritas';

// Mock crypto pour les tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123'
  }
});

// Store de test isolé avec juste le slice cart
const createTestStore = () => create<CartSlice>()(
  (set, get) => ({
    ...createCartSlice(set, get, null as any)
  })
);

describe('Cart Slice - Optimistic Updates', () => {
  // Mock product HerbisVeritas
  const mockProduct: Product = {
    id: 'prod-opt-1',
    sku: 'OPT-001',
    category_id: 'cat-1',
    i18n: {
      fr: {
        name: 'Huile Essentielle Lavande',
        description: 'Huile essentielle bio de lavande fine',
      },
      en: {
        name: 'Lavender Essential Oil',
        description: 'Organic fine lavender essential oil',
      }
    },
    price: 15.90,
    stock_quantity: 25,
    low_stock_threshold: 3,
    inci_list: ['Lavandula Angustifolia Oil'],
    labels: [HerbisVeritasLabel.BIO, HerbisVeritasLabel.ARTISANAL],
    images: ['lavande-oil.jpg'],
    featured_image: 'lavande-oil-main.jpg',
    is_active: true,
    is_featured: false,
    created_at: '2025-01-28T10:00:00Z',
    updated_at: '2025-01-28T10:00:00Z'
  };

  let useTestStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    useTestStore = createTestStore();
  });

  describe('Initial State', () => {
    it('has correct initial optimistic state', () => {
      const state = useTestStore.getState();
      
      expect(state.optimisticItems).toEqual([]);
      expect(state.isOptimistic).toBe(false);
      expect(state.pendingOperations).toEqual(new Set());
    });
  });

  describe('Optimistic Add Item', () => {
    it('adds optimistic item with HerbisVeritas fields', () => {
      const store = useTestStore.getState();
      
      const optimisticId = store.addOptimisticItem(mockProduct, 1);
      const state = useTestStore.getState();

      expect(optimisticId).toContain('temp-');
      expect(state.optimisticItems).toHaveLength(1);
      expect(state.isOptimistic).toBe(true);
      expect(state.pendingOperations.has(optimisticId)).toBe(true);

      const item = state.optimisticItems[0]!;
      expect(item).toMatchObject({
        product_id: 'prod-opt-1',
        quantity: 1,
        price: 15.90,
        labels: [HerbisVeritasLabel.BIO, HerbisVeritasLabel.ARTISANAL],
        unit: 'pièce',
        inci_list: ['Lavandula Angustifolia Oil'],
        image_url: 'lavande-oil-main.jpg',
        slug: 'OPT-001',
        stock_quantity: 25,
        low_stock_threshold: 3,
        isOptimistic: true,
        optimisticId: optimisticId
      });
    });

    it('creates separate optimistic items for same product (no auto-merge)', () => {
      const store = useTestStore.getState();
      
      // Premier ajout
      const firstId = store.addOptimisticItem(mockProduct, 2);
      
      // Deuxième ajout du même produit (cree un nouvel item separe)
      const secondId = store.addOptimisticItem(mockProduct, 1);
      
      const state = useTestStore.getState();
      
      // Deux items optimistic separes car pas de fusion automatique entre optimistic items
      expect(state.optimisticItems).toHaveLength(2);
      expect(state.optimisticItems[0]!.quantity).toBe(2);
      expect(state.optimisticItems[1]!.quantity).toBe(1);
      expect(state.pendingOperations.size).toBe(2);
      expect(state.pendingOperations.has(firstId)).toBe(true);
      expect(state.pendingOperations.has(secondId)).toBe(true);
    });
  });

  describe('Optimistic Remove Item', () => {
    it('removes optimistic item by optimisticId', () => {
      const store = useTestStore.getState();
      
      const optimisticId = store.addOptimisticItem(mockProduct, 1);
      expect(useTestStore.getState().optimisticItems).toHaveLength(1);
      
      store.removeOptimisticItem(optimisticId);
      const state = useTestStore.getState();
      
      expect(state.optimisticItems).toHaveLength(0);
      expect(state.isOptimistic).toBe(false);
      expect(state.pendingOperations.has(optimisticId)).toBe(false);
    });

    it('maintains isOptimistic state with remaining items', () => {
      const store = useTestStore.getState();
      
      const firstId = store.addOptimisticItem(mockProduct, 1);
      const secondProduct = { ...mockProduct, id: 'prod-2' };
      const secondId = store.addOptimisticItem(secondProduct, 2);
      
      store.removeOptimisticItem(firstId);
      const state = useTestStore.getState();
      
      expect(state.optimisticItems).toHaveLength(1);
      expect(state.isOptimistic).toBe(true);
      expect(state.pendingOperations.has(secondId)).toBe(true);
    });
  });

  describe('Optimistic Update Quantity', () => {
    it('updates item quantity optimistically', () => {
      const store = useTestStore.getState();
      
      const optimisticId = store.addOptimisticItem(mockProduct, 1);
      
      store.updateOptimisticQuantity(optimisticId, 5);
      const state = useTestStore.getState();
      
      expect(state.optimisticItems[0]!.quantity).toBe(5);
      expect(state.optimisticItems[0]!.updated_at).toBeDefined();
    });

    it('removes item when quantity is 0', () => {
      const store = useTestStore.getState();
      
      const optimisticId = store.addOptimisticItem(mockProduct, 3);
      
      store.updateOptimisticQuantity(optimisticId, 0);
      const state = useTestStore.getState();
      
      expect(state.optimisticItems).toHaveLength(0);
      expect(state.isOptimistic).toBe(false);
    });
  });

  describe('Clear Optimistic', () => {
    it('clears all optimistic state', () => {
      const store = useTestStore.getState();
      
      store.addOptimisticItem(mockProduct, 1);
      store.addOptimisticItem({ ...mockProduct, id: 'prod-2' }, 2);
      
      store.clearOptimistic();
      const state = useTestStore.getState();
      
      expect(state.optimisticItems).toHaveLength(0);
      expect(state.isOptimistic).toBe(false);
      expect(state.pendingOperations.size).toBe(0);
    });
  });

  describe('Computed Getters', () => {
    beforeEach(() => {
      const store = useTestStore.getState();
      store.addOptimisticItem(mockProduct, 2); // 2 * 15.90 = 31.80
      store.addOptimisticItem({ ...mockProduct, id: 'prod-2', price: 10.50 }, 3); // 3 * 10.50 = 31.50
    });

    it('calculates optimistic total correctly', () => {
      const store = useTestStore.getState();
      const total = store.getOptimisticTotal();
      
      expect(total).toBe(63.30); // 31.80 + 31.50
    });

    it('calculates optimistic item count correctly', () => {
      const store = useTestStore.getState();
      const count = store.getOptimisticItemCount();
      
      expect(count).toBe(5); // 2 + 3
    });

    it('detects optimistic items correctly', () => {
      const store = useTestStore.getState();
      
      expect(store.hasOptimisticItems()).toBe(true);
      
      store.clearOptimistic();
      
      expect(store.hasOptimisticItems()).toBe(false);
    });
  });

  describe('Sync Helpers', () => {
    it('marks operation as pending for sync', () => {
      const store = useTestStore.getState();
      
      const optimisticId = store.addOptimisticItem(mockProduct, 1);
      const initialPendingCount = useTestStore.getState().pendingOperations.size;
      
      store.syncOptimisticToServer(optimisticId);
      
      // Should still be in pending (addOptimisticItem already adds it)
      expect(useTestStore.getState().pendingOperations.size).toBe(initialPendingCount);
      expect(useTestStore.getState().pendingOperations.has(optimisticId)).toBe(true);
    });

    it('reverts failed optimistic item', () => {
      const store = useTestStore.getState();
      
      const optimisticId = store.addOptimisticItem(mockProduct, 1);
      expect(useTestStore.getState().optimisticItems).toHaveLength(1);
      
      store.revertOptimisticItem(optimisticId);
      
      expect(useTestStore.getState().optimisticItems).toHaveLength(0);
      expect(useTestStore.getState().isOptimistic).toBe(false);
    });
  });
});