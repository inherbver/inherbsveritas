// TEMPORAIRE: Version stub pour permettre le build
// TODO: Réimplémenter avec sonner quand installé

export interface ExternalToast {
  description?: string;
  duration?: number;
}

export interface AuthMessage {
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const toast = {
  success: (message: string, options?: ExternalToast) => {
    console.log('Success:', message, options);
  },
  error: (message: string, options?: ExternalToast) => {
    console.log('Error:', message, options);
  },
  info: (message: string, options?: ExternalToast) => {
    console.log('Info:', message, options);
  },
  warning: (message: string, options?: ExternalToast) => {
    console.log('Warning:', message, options);
  }
};

export function formatAuthMessage(message: AuthMessage): string {
  return message.text;
}

export function showSuccessToast(message: string) {
  toast.success(message);
}

export function showErrorToast(message: string) {
  toast.error(message);
}