/**
 * Système de Toast Centralisé HerbisVeritas
 * Intégration avec AuthMessage + patterns business factorises
 * Architecture évolutive compatible avec l'infrastructure composants
 */

import { toast as sonnerToast, type ExternalToast } from 'sonner'
import { formatAuthMessage, type AuthMessage } from '@/lib/messages/auth-messages'
import { type UserRole } from '@/lib/auth/roles'

// === TYPES SYSTÈME TOAST ===

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

// === TOAST FACTORY CENTRALISÉ ===

class ToastSystem {
  private readonly defaultDuration = {
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
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    },
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

  private trackBusinessAction(type: ToastType, action?: string, userRole?: UserRole): void {
    // Analytics/tracking centralisé si nécessaire
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Toast [${type}]: ${action} by ${userRole}`)
    }
  }
}

// === INSTANCE SINGLETON ===
export const toastSystem = new ToastSystem()

// === PATTERNS BUSINESS PRÊTS À L'EMPLOI ===

export const businessToasts = {
  // === AUTH PATTERNS ===
  auth: {
    loginSuccess: (userRole: UserRole) => toastSystem.show({
      type: 'success',
      title: 'Connexion réussie',
      description: `Bienvenue !`,
      duration: 3000
    }, { 
      businessAction: 'login_success',
      userRole 
    }),

    loginError: (authMessage: AuthMessage) => toastSystem.fromAuthMessage(authMessage, {
      businessAction: 'login_error'
    }),

    logoutSuccess: () => toastSystem.show({
      type: 'info',
      title: 'Déconnexion réussie',
      description: 'À bientôt !',
      duration: 2000
    }, { 
      businessAction: 'logout_success' 
    }),

    registrationPending: () => toastSystem.show({
      type: 'info',
      title: 'Compte créé !',
      description: 'Vérifiez votre email pour confirmer votre compte',
      duration: 8000,
      action: {
        label: 'Renvoyer email',
        onClick: () => {
          // Logic pour renvoyer email
          businessToasts.auth.resendEmailSent()
        }
      }
    }, { 
      businessAction: 'registration_pending',
      showCloseButton: true 
    }),

    resendEmailSent: () => toastSystem.show({
      type: 'success',
      title: 'Email renvoyé',
      duration: 3000
    }, { 
      businessAction: 'resend_email' 
    })
  },

  // === E-COMMERCE PATTERNS ===
  ecommerce: {
    addToCartSuccess: (productName: string) => toastSystem.show({
      type: 'success',
      title: 'Produit ajouté au panier',
      description: productName,
      duration: 3000,
      action: {
        label: 'Voir panier',
        onClick: () => {
          // Navigation vers panier
          window.location.href = '/cart'
        }
      }
    }, { 
      businessAction: 'add_to_cart',
      showCloseButton: true 
    }),

    removeFromCart: (productName: string) => toastSystem.show({
      type: 'info',
      title: 'Produit retiré du panier',
      description: productName,
      duration: 4000,
      action: {
        label: 'Annuler',
        onClick: () => {
          // Logic pour annuler suppression
          businessToasts.ecommerce.addToCartSuccess(productName)
        }
      }
    }, { 
      businessAction: 'remove_from_cart' 
    }),

    orderSuccess: (orderNumber: string) => toastSystem.show({
      type: 'success',
      title: 'Commande confirmée !',
      description: `Numéro de commande : ${orderNumber}`,
      duration: 8000,
      action: {
        label: 'Suivre ma commande',
        onClick: () => {
          // Navigation vers suivi
          window.location.href = `/orders/${orderNumber}`
        }
      }
    }, { 
      businessAction: 'order_success',
      persistent: true,
      showCloseButton: true 
    }),

    paymentProcessing: () => toastSystem.show({
      type: 'loading',
      title: 'Traitement du paiement...',
      description: 'Veuillez ne pas fermer cette page'
    }, { 
      businessAction: 'payment_processing',
      persistent: true 
    }),

    paymentSuccess: () => toastSystem.show({
      type: 'success',
      title: 'Paiement réussi',
      description: 'Votre commande sera traitée sous peu',
      duration: 5000
    }, { 
      businessAction: 'payment_success' 
    }),

    paymentError: (errorMessage?: string) => toastSystem.show({
      type: 'error',
      title: 'Erreur de paiement',
      description: errorMessage || 'Veuillez réessayer ou changer de méthode de paiement',
      duration: 8000,
      action: {
        label: 'Réessayer',
        onClick: () => {
          // Logic pour réessayer paiement
          window.location.reload()
        }
      }
    }, { 
      businessAction: 'payment_error',
      showCloseButton: true 
    })
  },

  // === ADMIN PATTERNS ===
  admin: {
    saveSuccess: (entityName: string) => toastSystem.show({
      type: 'success',
      title: `${entityName} sauvegardé`,
      duration: 3000
    }, { 
      businessAction: 'admin_save_success',
      userRole: 'admin' 
    }),

    deleteConfirm: (entityName: string, onConfirm: () => void) => toastSystem.show({
      type: 'warning',
      title: `Supprimer ${entityName} ?`,
      description: 'Cette action est irréversible',
      action: {
        label: 'Confirmer',
        onClick: onConfirm
      }
    }, { 
      businessAction: 'admin_delete_confirm',
      userRole: 'admin',
      persistent: true,
      showCloseButton: true 
    }),

    bulkActionProgress: (current: number, total: number) => toastSystem.show({
      type: 'loading',
      title: 'Action en cours...',
      description: `${current}/${total} éléments traités`
    }, { 
      businessAction: 'admin_bulk_action',
      userRole: 'admin' 
    })
  },

  // === GÉNÉRIQUES SYSTÈME ===
  system: {
    networkError: () => toastSystem.show({
      type: 'error',
      title: 'Erreur de connexion',
      description: 'Vérifiez votre connexion internet',
      duration: 6000,
      action: {
        label: 'Réessayer',
        onClick: () => window.location.reload()
      }
    }, { 
      businessAction: 'network_error',
      showCloseButton: true 
    }),

    saveProgress: (entityName: string) => toastSystem.show({
      type: 'loading',
      title: `Sauvegarde de ${entityName}...`
    }, { 
      businessAction: 'save_progress' 
    }),

    unexpectedError: () => toastSystem.show({
      type: 'error',
      title: 'Une erreur inattendue s\'est produite',
      description: 'Notre équipe a été notifiée',
      duration: 6000
    }, { 
      businessAction: 'unexpected_error' 
    })
  }
}

// === HOOKS POUR COMPOSANTS ===

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

