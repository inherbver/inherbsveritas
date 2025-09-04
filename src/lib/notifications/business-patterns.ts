// TEMPORAIRE: Version stub pour permettre le build
// TODO: Réimplémenter avec les classes business patterns

export interface AuthMessage {
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// Stubs temporaires pour les fonctions business
export const showProductAddedToast = (productName: string) => {
  console.log('Product added to cart:', productName);
};

export const showOrderConfirmedToast = (orderId: string) => {
  console.log('Order confirmed:', orderId);
};

export const showAuthSuccessToast = (message: AuthMessage) => {
  console.log('Auth success:', message.text);
};

export const showAuthErrorToast = (message: AuthMessage) => {
  console.log('Auth error:', message.text);
};

export const showServerErrorToast = (error: any) => {
  console.log('Server error:', error);
};

export const showNetworkErrorToast = () => {
  console.log('Network error');
};

export const showValidationErrorToast = (field: string, message: string) => {
  console.log('Validation error:', field, message);
};