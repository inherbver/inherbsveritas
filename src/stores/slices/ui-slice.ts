import { StateCreator } from 'zustand';

/**
 * UI Slice - État interface utilisateur du cart
 * Séparation claire UI state / Business logic
 */

interface UISlice {
  // UI State
  isCartOpen: boolean;
  isCartSheetOpen: boolean;
  cartBadgeCount: number;
  
  // Loading states
  isAddingToCart: boolean;
  isUpdatingCart: boolean;
  isRemovingFromCart: boolean;
  
  // Error states
  lastError: string | null;
  failedOperations: string[]; // optimisticIds failed
  
  // Toast/Notification states
  showSuccessToast: boolean;
  successMessage: string | null;
  
  // UI Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  openCartSheet: () => void;
  closeCartSheet: () => void;
  
  // Loading actions
  setAddingToCart: (loading: boolean) => void;
  setUpdatingCart: (loading: boolean) => void;
  setRemovingFromCart: (loading: boolean) => void;
  
  // Error actions
  setError: (error: string | null) => void;
  addFailedOperation: (optimisticId: string) => void;
  removeFailedOperation: (optimisticId: string) => void;
  clearErrors: () => void;
  
  // Toast actions
  showSuccess: (message: string) => void;
  hideSuccess: () => void;
  
  // Badge actions
  updateBadgeCount: (count: number) => void;
}

export const createUISlice: StateCreator<
  UISlice, [], [], UISlice
> = (set, _get, _api) => ({
  // === Initial UI State ===
  isCartOpen: false,
  isCartSheetOpen: false,
  cartBadgeCount: 0,
  
  // Loading states
  isAddingToCart: false,
  isUpdatingCart: false,
  isRemovingFromCart: false,
  
  // Error states
  lastError: null,
  failedOperations: [],
  
  // Toast states
  showSuccessToast: false,
  successMessage: null,
  
  // === UI Actions ===
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  openCartSheet: () => set({ isCartSheetOpen: true }),
  closeCartSheet: () => set({ isCartSheetOpen: false }),
  
  // === Loading Actions ===
  setAddingToCart: (loading: boolean) => set({ isAddingToCart: loading }),
  setUpdatingCart: (loading: boolean) => set({ isUpdatingCart: loading }),
  setRemovingFromCart: (loading: boolean) => set({ isRemovingFromCart: loading }),
  
  // === Error Actions ===
  setError: (error: string | null) => set({ lastError: error }),
  
  addFailedOperation: (optimisticId: string) => {
    set((state) => ({
      failedOperations: [...state.failedOperations, optimisticId]
    }));
  },
  
  removeFailedOperation: (optimisticId: string) => {
    set((state) => ({
      failedOperations: state.failedOperations.filter(id => id !== optimisticId)
    }));
  },
  
  clearErrors: () => set({
    lastError: null,
    failedOperations: []
  }),
  
  // === Toast Actions ===
  showSuccess: (message: string) => set({
    showSuccessToast: true,
    successMessage: message
  }),
  
  hideSuccess: () => set({
    showSuccessToast: false,
    successMessage: null
  }),
  
  // === Badge Actions ===
  updateBadgeCount: (count: number) => set({ cartBadgeCount: count })
});

export type { UISlice };