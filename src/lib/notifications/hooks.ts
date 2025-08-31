/**
 * Toast Hooks
 * 
 * React hooks for using toast notifications in components
 */

import { type AuthMessage } from '@/lib/messages/auth-messages'
import { ToastSystem } from './toast-core'
import { businessToasts } from './business-patterns'
import { type BusinessToastOptions } from './types'

const toastSystem = new ToastSystem()

/**
 * Hook pour utiliser les toasts dans les composants
 */
export function useToast() {
  return {
    toast: toastSystem,
    businessToasts,
    // Helpers communs
    showAuthMessage: (message: AuthMessage, options?: BusinessToastOptions) => 
      toastSystem.fromAuthMessage(message, options),
    showSuccess: (title: string, description?: string) => 
      toastSystem.show({ type: 'success', title, description: description || '' }),
    showError: (title: string, description?: string) => 
      toastSystem.show({ type: 'error', title, description: description || '' }),
    showInfo: (title: string, description?: string) => 
      toastSystem.show({ type: 'info', title, description: description || '' }),
    showLoading: (title: string) => 
      toastSystem.show({ type: 'loading', title, description: '' })
  }
}

/**
 * Hook pour actions async avec toast automatique
 */
export function useAsyncToast() {
  return {
    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: unknown) => string)
      },
      options?: BusinessToastOptions
    ) => toastSystem.promise(promise, messages, options)
  }
}