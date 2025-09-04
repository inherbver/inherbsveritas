/**
 * Toast Notification System - HerbisVeritas V2 MVP
 * TEMPORAIRE: Version stub pour permettre le build
 * TODO: Réimplémenter avec système toast complet
 */

// Core system stubs
export class ToastSystem {
  success(message: string) {
    console.log('Success:', message);
  }
  error(message: string) {
    console.log('Error:', message);
  }
  info(message: string) {
    console.log('Info:', message);
  }
  warning(message: string) {
    console.log('Warning:', message);
  }
}

// Business patterns stub
export const businessToasts = {
  showProductAdded: (productName: string) => {
    console.log('Product added:', productName);
  },
  showOrderConfirmed: (orderId: string) => {
    console.log('Order confirmed:', orderId);
  }
};

// React hooks stubs
export function useToast() {
  return new ToastSystem();
}

export function useAsyncToast() {
  return new ToastSystem();
}

// Default instance
export const toastSystem = new ToastSystem();

// Backward compatibility
export const useToastSystem = useToast;