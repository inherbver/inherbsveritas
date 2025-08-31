/**
 * Business Toast Patterns
 * 
 * Pre-built toast patterns for HerbisVeritas business logic
 */

import { type AuthMessage } from '@/lib/messages/auth-messages'
import { type UserRole } from '@/lib/auth/roles'
import { ToastSystem } from './toast-core'

const toastSystem = new ToastSystem()

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

    stockWarning: (productName: string, remaining: number) => toastSystem.show({
      type: 'warning',
      title: 'Stock limité',
      description: `Plus que ${remaining} ${productName} en stock`,
      duration: 6000
    }, { 
      businessAction: 'stock_warning' 
    }),

    checkoutProgress: (step: string) => toastSystem.show({
      type: 'loading',
      title: `${step} en cours...`,
      persistent: true
    }, { 
      businessAction: 'checkout_progress' 
    }),

    orderConfirmation: (orderNumber: string) => toastSystem.show({
      type: 'success',
      title: 'Commande confirmée !',
      description: `N° ${orderNumber}`,
      duration: 8000,
      action: {
        label: 'Voir détails',
        onClick: () => {
          window.location.href = `/orders/${orderNumber}`
        }
      }
    }, { 
      businessAction: 'order_confirmed',
      showCloseButton: true 
    }),

    paymentError: (error: string) => toastSystem.show({
      type: 'error',
      title: 'Erreur de paiement',
      description: error,
      duration: 8000,
      action: {
        label: 'Réessayer',
        onClick: () => {
          // Logic retry payment
        }
      }
    }, { 
      businessAction: 'payment_error',
      showCloseButton: true 
    })
  },

  // === ADMIN PATTERNS ===
  admin: {
    productSaved: (productName: string) => toastSystem.show({
      type: 'success',
      title: 'Produit sauvegardé',
      description: productName,
      duration: 3000
    }, { 
      businessAction: 'product_saved' 
    }),

    productDeleted: (productName: string) => toastSystem.show({
      type: 'info',
      title: 'Produit supprimé',
      description: productName,
      duration: 4000,
      action: {
        label: 'Annuler',
        onClick: () => {
          // Logic pour restaurer
        }
      }
    }, { 
      businessAction: 'product_deleted' 
    }),

    orderStatusUpdated: (orderNumber: string, status: string) => toastSystem.show({
      type: 'success',
      title: 'Commande mise à jour',
      description: `${orderNumber} → ${status}`,
      duration: 4000
    }, { 
      businessAction: 'order_status_updated' 
    })
  }
}