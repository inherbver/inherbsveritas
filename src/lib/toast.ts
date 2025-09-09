/**
 * Toast notification system - Sonner integration for HerbisVeritas
 * Phase 1: Real UI implementation with Sonner
 */

import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.success(message, {
      duration: options?.duration || 4000,
      description: options?.description,
    })
  },
  
  error: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.error(message, {
      duration: options?.duration || 6000,
      description: options?.description,
    })
  },
  
  info: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.info(message, {
      duration: options?.duration || 4000,
      description: options?.description,
    })
  },
  
  warning: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.warning(message, {
      duration: options?.duration || 5000,
      description: options?.description,
    })
  },

  loading: (message: string, options?: { description?: string }) => {
    return sonnerToast.loading(message, {
      description: options?.description,
    })
  },

  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string
      success: (data: T) => string
      error: (error: any) => string
    }
  ) => {
    return sonnerToast.promise(promise, options)
  },

  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId)
  }
}