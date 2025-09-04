/**
 * Tests unitaires UI Slice - Cart Interface States
 * Tests des états UI séparés pour le cart HerbisVeritas
 */

import { create } from 'zustand';
import { createUISlice, type UISlice } from '@/stores/slices/ui-slice';

// Store de test isolé avec juste le slice UI
const createTestStore = () => create<UISlice>()(
  (set) => ({
    ...createUISlice(set, null as any, null as any)
  })
);

describe('UI Slice - Cart Interface States', () => {
  let useTestStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    useTestStore = createTestStore();
  });

  describe('Initial State', () => {
    it('has correct initial UI state', () => {
      const state = useTestStore.getState();
      
      expect(state.isCartOpen).toBe(false);
      expect(state.isCartSheetOpen).toBe(false);
      expect(state.cartBadgeCount).toBe(0);
      expect(state.isAddingToCart).toBe(false);
      expect(state.isUpdatingCart).toBe(false);
      expect(state.isRemovingFromCart).toBe(false);
      expect(state.lastError).toBeNull();
      expect(state.failedOperations).toEqual([]);
      expect(state.showSuccessToast).toBe(false);
      expect(state.successMessage).toBeNull();
    });
  });

  describe('Cart Modal State', () => {
    it('opens and closes cart modal', () => {
      const store = useTestStore.getState();
      
      store.openCart();
      expect(useTestStore.getState().isCartOpen).toBe(true);
      
      store.closeCart();
      expect(useTestStore.getState().isCartOpen).toBe(false);
    });

    it('toggles cart modal state', () => {
      const store = useTestStore.getState();
      
      store.toggleCart();
      expect(useTestStore.getState().isCartOpen).toBe(true);
      
      store.toggleCart();
      expect(useTestStore.getState().isCartOpen).toBe(false);
    });
  });

  describe('Cart Sheet State', () => {
    it('opens and closes cart sheet', () => {
      const store = useTestStore.getState();
      
      store.openCartSheet();
      expect(useTestStore.getState().isCartSheetOpen).toBe(true);
      
      store.closeCartSheet();
      expect(useTestStore.getState().isCartSheetOpen).toBe(false);
    });
  });

  describe('Loading States', () => {
    it('manages adding to cart loading state', () => {
      const store = useTestStore.getState();
      
      store.setAddingToCart(true);
      expect(useTestStore.getState().isAddingToCart).toBe(true);
      
      store.setAddingToCart(false);
      expect(useTestStore.getState().isAddingToCart).toBe(false);
    });

    it('manages updating cart loading state', () => {
      const store = useTestStore.getState();
      
      store.setUpdatingCart(true);
      expect(useTestStore.getState().isUpdatingCart).toBe(true);
      
      store.setUpdatingCart(false);
      expect(useTestStore.getState().isUpdatingCart).toBe(false);
    });

    it('manages removing from cart loading state', () => {
      const store = useTestStore.getState();
      
      store.setRemovingFromCart(true);
      expect(useTestStore.getState().isRemovingFromCart).toBe(true);
      
      store.setRemovingFromCart(false);
      expect(useTestStore.getState().isRemovingFromCart).toBe(false);
    });
  });

  describe('Error States', () => {
    it('sets and clears error messages', () => {
      const store = useTestStore.getState();
      
      store.setError('Stock insuffisant');
      expect(useTestStore.getState().lastError).toBe('Stock insuffisant');
      
      store.setError(null);
      expect(useTestStore.getState().lastError).toBeNull();
    });

    it('manages failed operations list', () => {
      const store = useTestStore.getState();
      
      store.addFailedOperation('opt-123');
      expect(useTestStore.getState().failedOperations).toContain('opt-123');
      
      store.addFailedOperation('opt-456');
      expect(useTestStore.getState().failedOperations).toEqual(['opt-123', 'opt-456']);
      
      store.removeFailedOperation('opt-123');
      expect(useTestStore.getState().failedOperations).toEqual(['opt-456']);
    });

    it('clears all errors at once', () => {
      const store = useTestStore.getState();
      
      store.setError('Some error');
      store.addFailedOperation('opt-123');
      store.addFailedOperation('opt-456');
      
      store.clearErrors();
      const state = useTestStore.getState();
      
      expect(state.lastError).toBeNull();
      expect(state.failedOperations).toEqual([]);
    });
  });

  describe('Toast/Success States', () => {
    it('shows and hides success messages', () => {
      const store = useTestStore.getState();
      
      store.showSuccess('Produit ajouté avec succès');
      let state = useTestStore.getState();
      
      expect(state.showSuccessToast).toBe(true);
      expect(state.successMessage).toBe('Produit ajouté avec succès');
      
      store.hideSuccess();
      state = useTestStore.getState();
      
      expect(state.showSuccessToast).toBe(false);
      expect(state.successMessage).toBeNull();
    });
  });

  describe('Badge Count', () => {
    it('updates cart badge count', () => {
      const store = useTestStore.getState();
      
      store.updateBadgeCount(5);
      expect(useTestStore.getState().cartBadgeCount).toBe(5);
      
      store.updateBadgeCount(0);
      expect(useTestStore.getState().cartBadgeCount).toBe(0);
    });
  });

  describe('Complex UI Workflows', () => {
    it('handles add to cart workflow states', () => {
      const store = useTestStore.getState();
      
      // Début d'ajout
      store.setAddingToCart(true);
      store.openCartSheet(); // Ouvrir le sheet pour voir l'ajout
      
      let state = useTestStore.getState();
      expect(state.isAddingToCart).toBe(true);
      expect(state.isCartSheetOpen).toBe(true);
      
      // Succès
      store.setAddingToCart(false);
      store.showSuccess('Produit ajouté');
      store.updateBadgeCount(3);
      
      state = useTestStore.getState();
      expect(state.isAddingToCart).toBe(false);
      expect(state.showSuccessToast).toBe(true);
      expect(state.cartBadgeCount).toBe(3);
      
      // Nettoyer
      store.hideSuccess();
      store.closeCartSheet();
      
      state = useTestStore.getState();
      expect(state.showSuccessToast).toBe(false);
      expect(state.isCartSheetOpen).toBe(false);
    });

    it('handles error workflow states', () => {
      const store = useTestStore.getState();
      
      // Début d'opération qui va échouer
      store.setAddingToCart(true);
      store.addFailedOperation('opt-789');
      
      // Échec
      store.setAddingToCart(false);
      store.setError('Erreur réseau');
      
      let state = useTestStore.getState();
      expect(state.isAddingToCart).toBe(false);
      expect(state.lastError).toBe('Erreur réseau');
      expect(state.failedOperations).toContain('opt-789');
      
      // Retry réussi - nettoyer erreurs
      store.clearErrors();
      store.removeFailedOperation('opt-789');
      
      state = useTestStore.getState();
      expect(state.lastError).toBeNull();
      expect(state.failedOperations).toEqual([]);
    });

    it('handles multiple loading states simultaneously', () => {
      const store = useTestStore.getState();
      
      // Plusieurs opérations en parallèle
      store.setAddingToCart(true);
      store.setUpdatingCart(true);
      
      let state = useTestStore.getState();
      expect(state.isAddingToCart).toBe(true);
      expect(state.isUpdatingCart).toBe(true);
      expect(state.isRemovingFromCart).toBe(false);
      
      // Finir une opération
      store.setAddingToCart(false);
      
      state = useTestStore.getState();
      expect(state.isAddingToCart).toBe(false);
      expect(state.isUpdatingCart).toBe(true); // Toujours en cours
      
      // Finir toutes les opérations
      store.setUpdatingCart(false);
      
      state = useTestStore.getState();
      expect(state.isAddingToCart).toBe(false);
      expect(state.isUpdatingCart).toBe(false);
    });
  });
});