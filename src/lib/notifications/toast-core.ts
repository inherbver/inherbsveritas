/**
 * Core Toast System
 * 
 * Core toast functionality with business logic integration
 */

import { toast as sonnerToast, type ExternalToast } from 'sonner'
import { formatAuthMessage, type AuthMessage } from '@/lib/messages/auth-messages'
import { type UserRole } from '@/lib/auth/roles'
import { 
  type ToastMessage, 
  type BusinessToastOptions, 
  type ToastPromiseMessages,
  type ToastDefaults
} from './types'

export class ToastSystem {
  private readonly defaultDuration: ToastDefaults = {
    success: 4000,
    error: 6000,
    info: 5000,
    warning: 5000,
    loading: Infinity
  }

  /**
   * Toast depuis AuthMessage (integration parfaite)
   */
  fromAuthMessage(message: AuthMessage, options?: BusinessToastOptions): string {
    const formattedMessage = formatAuthMessage(message)
    
    return this.show({
      type: message.type === 'error' ? 'error' : 
            message.type === 'success' ? 'success' :
            message.type === 'warning' ? 'warning' : 'info',
      title: formattedMessage,
      description: '',
      duration: this.defaultDuration[message.type === 'error' ? 'error' : 'success']
    }, options)
  }

  /**
   * Toast générique avec options business
   */
  show(message: ToastMessage, options?: BusinessToastOptions): string {
    const toastOptions: ExternalToast = {
      description: message.description,
      duration: message.persistent ? Infinity : (message.duration || this.defaultDuration[message.type]),
      position: options?.position || 'bottom-right',
      closeButton: options?.showCloseButton || false,
      ...(options?.onDismiss && { onDismiss: (_toast) => options.onDismiss!() }),
      icon: message.icon,
      action: message.action ? {
        label: message.action.label,
        onClick: message.action.onClick
      } : undefined
    }

    // Analytics tracking si nécessaire
    this.trackBusinessAction(message.type, options?.businessAction, options?.userRole)

    // Dispatch selon le type
    switch (message.type) {
      case 'success':
        return String(sonnerToast.success(message.title, toastOptions))
      case 'error':
        return String(sonnerToast.error(message.title, toastOptions))
      case 'warning':
        return String(sonnerToast.warning(message.title, toastOptions)) 
      case 'loading':
        return String(sonnerToast.loading(message.title, toastOptions))
      default:
        return String(sonnerToast(message.title, toastOptions))
    }
  }

  /**
   * Promise toast pour actions async
   */
  promise<T>(
    promise: Promise<T>,
    messages: ToastPromiseMessages<T>,
    options?: BusinessToastOptions
  ): Promise<T> {
    sonnerToast.promise(promise, messages)
    
    // Callbacks business
    promise.then(
      (_data: T) => options?.onSuccess?.(),
      (error: unknown) => options?.onError?.(error)
    )

    return promise
  }

  /**
   * Dismiss toast par ID
   */
  dismiss(toastId?: string): void {
    sonnerToast.dismiss(toastId)
  }

  /**
   * Dismiss tous les toasts
   */
  dismissAll(): void {
    sonnerToast.dismiss()
  }

  /**
   * Update toast existant
   */
  update(_toastId: string, message: ToastMessage, options?: BusinessToastOptions): void {
    // Re-show with same ID (sonner will replace)
    this.show(message, { ...options, position: undefined })
  }

  /**
   * Analytics business tracking (internal)
   */
  private trackBusinessAction(type: string, action?: string, userRole?: UserRole): void {
    if (process.env.NODE_ENV === 'development' && action) {
      console.log(`[Toast] ${type}: ${action} (role: ${userRole || 'anonymous'})`)
    }
  }
}