/**
 * Toast Types - HerbisVeritas V2 MVP
 * TEMPORAIRE: Version stub pour permettre le build
 */

export interface ExternalToast {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type UserRole = 'user' | 'admin' | 'dev';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastOptions extends ExternalToast {
  id?: string;
  type?: ToastType;
  icon?: React.ReactNode;
}

export interface BusinessToastOptions extends ToastOptions {
  trackingId?: string;
  userId?: string;
  role?: UserRole;
}

export interface AsyncToastOptions extends BusinessToastOptions {
  loadingMessage: string;
  successMessage?: string;
  errorMessage?: string;
}