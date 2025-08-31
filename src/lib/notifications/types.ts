/**
 * Toast System Types
 * 
 * Type definitions for the toast notification system
 */

import { type ExternalToast } from 'sonner'
import { type UserRole } from '@/lib/auth/roles'

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading'

export interface ToastMessage {
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
  persistent?: boolean
}

export interface BusinessToastOptions {
  // Business context
  userId?: string
  userRole?: UserRole
  businessAction?: string
  
  // UI options
  position?: ExternalToast['position']
  persistent?: boolean
  showCloseButton?: boolean
  
  // Callbacks
  onSuccess?: () => void
  onError?: (error: unknown) => void
  onDismiss?: () => void
}

export interface ToastPromiseMessages<T = unknown> {
  loading: string
  success: string | ((data: T) => string)
  error: string | ((error: unknown) => string)
}

export interface ToastDefaults {
  success: number
  error: number
  info: number
  warning: number
  loading: number
}