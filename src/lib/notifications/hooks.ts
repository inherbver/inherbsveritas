// TEMPORAIRE: Version stub pour permettre le build
// TODO: Réimplémenter avec les hooks de notification

export interface BusinessToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface AuthMessage {
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export function useToast() {
  return {
    toast: (message: string, options?: BusinessToastOptions) => {
      console.log('Toast:', message, options);
    },
    success: (message: string, options?: BusinessToastOptions) => {
      console.log('Success toast:', message, options);
    },
    error: (message: string, options?: BusinessToastOptions) => {
      console.log('Error toast:', message, options);
    },
    info: (message: string, options?: BusinessToastOptions) => {
      console.log('Info toast:', message, options);
    },
    warning: (message: string, options?: BusinessToastOptions) => {
      console.log('Warning toast:', message, options);
    }
  };
}

export function useBusinessToasts() {
  return {
    showProductAdded: (productName: string) => {
      console.log('Product added:', productName);
    },
    showOrderConfirmed: (orderId: string) => {
      console.log('Order confirmed:', orderId);
    },
    showAuthSuccess: (message: AuthMessage) => {
      console.log('Auth success:', message.text);
    },
    showAuthError: (message: AuthMessage) => {
      console.log('Auth error:', message.text);
    }
  };
}