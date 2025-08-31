import { toastSystem, businessToasts } from '@/lib/notifications/toast-system'
import { AUTH_MESSAGES } from '@/lib/messages/auth-messages'
import { toast as sonnerToast } from 'sonner'

// Mock Sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn(),
    promise: jest.fn(),
    dismiss: jest.fn()
  }
}))

const mockSonnerToast = sonnerToast as jest.Mocked<typeof sonnerToast>

describe('Toast System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fromAuthMessage integration', () => {
    it('should convert AuthMessage to toast correctly', () => {
      const authMessage = AUTH_MESSAGES.login.success
      
      toastSystem.fromAuthMessage(authMessage)
      
      expect(mockSonnerToast.success).toHaveBeenCalledWith(
        'Connexion réussie',
        expect.objectContaining({
          duration: 4000
        })
      )
    })

    it('should handle error AuthMessage', () => {
      const authMessage = AUTH_MESSAGES.validation.emailInvalid
      
      toastSystem.fromAuthMessage(authMessage)
      
      expect(mockSonnerToast.error).toHaveBeenCalledWith(
        'Email invalide',
        expect.objectContaining({
          duration: 6000
        })
      )
    })

    it('should pass business options correctly', () => {
      const authMessage = AUTH_MESSAGES.login.success
      const options = {
        userRole: 'admin' as const,
        businessAction: 'admin_login'
      }
      
      toastSystem.fromAuthMessage(authMessage, options)
      
      expect(mockSonnerToast.success).toHaveBeenCalledWith(
        'Connexion réussie',
        expect.objectContaining({
          position: 'bottom-right'
        })
      )
    })
  })

  describe('Business toast patterns', () => {
    it('should handle login success pattern', () => {
      businessToasts.auth.loginSuccess('user')
      
      expect(mockSonnerToast.success).toHaveBeenCalledWith(
        'Connexion réussie',
        expect.objectContaining({
          description: 'Bienvenue !',
          duration: 3000
        })
      )
    })

    it('should handle add to cart pattern', () => {
      const productName = 'Crème Bio Test'
      
      businessToasts.ecommerce.addToCartSuccess(productName)
      
      expect(mockSonnerToast.success).toHaveBeenCalledWith(
        'Produit ajouté au panier',
        expect.objectContaining({
          description: productName,
          action: expect.objectContaining({
            label: 'Voir panier'
          })
        })
      )
    })

    it('should handle payment processing pattern', () => {
      businessToasts.ecommerce.paymentProcessing()
      
      expect(mockSonnerToast.loading).toHaveBeenCalledWith(
        'Traitement du paiement...',
        expect.objectContaining({
          description: 'Veuillez ne pas fermer cette page'
        })
      )
    })

    it('should handle admin delete confirmation', () => {
      const entityName = 'Produit Test'
      const onConfirm = jest.fn()
      
      businessToasts.admin.deleteConfirm(entityName, onConfirm)
      
      expect(mockSonnerToast.warning).toHaveBeenCalledWith(
        `Supprimer ${entityName} ?`,
        expect.objectContaining({
          description: 'Cette action est irréversible',
          action: expect.objectContaining({
            label: 'Confirmer',
            onClick: onConfirm
          })
        })
      )
    })
  })

  describe('Generic toast methods', () => {
    it('should show success toast', () => {
      toastSystem.show({
        type: 'success',
        title: 'Test Success',
        description: 'Test description'
      })
      
      expect(mockSonnerToast.success).toHaveBeenCalledWith(
        'Test Success',
        expect.objectContaining({
          description: 'Test description'
        })
      )
    })

    it('should handle persistent toasts', () => {
      toastSystem.show({
        type: 'loading',
        title: 'Processing...'
      }, { persistent: true })
      
      expect(mockSonnerToast.loading).toHaveBeenCalledWith(
        'Processing...',
        expect.objectContaining({
          duration: Infinity
        })
      )
    })

    it('should handle toast with action', () => {
      const action = {
        label: 'Retry',
        onClick: jest.fn()
      }
      
      toastSystem.show({
        type: 'error',
        title: 'Error occurred',
        action
      })
      
      expect(mockSonnerToast.error).toHaveBeenCalledWith(
        'Error occurred',
        expect.objectContaining({
          action: expect.objectContaining({
            label: 'Retry',
            onClick: action.onClick
          })
        })
      )
    })
  })

  describe('Promise toast pattern', () => {
    it('should handle successful promise', async () => {
      const mockPromise = Promise.resolve('success data')
      const messages = {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error occurred'
      }
      
      await toastSystem.promise(mockPromise, messages)
      
      expect(mockSonnerToast.promise).toHaveBeenCalledWith(
        mockPromise,
        messages,
        expect.any(Object)
      )
    })

    it('should call success callback on promise resolve', async () => {
      const onSuccess = jest.fn()
      const mockPromise = Promise.resolve('data')
      
      mockSonnerToast.promise.mockResolvedValue('data')
      
      await toastSystem.promise(mockPromise, {
        loading: 'Loading...',
        success: 'Done!',
        error: 'Failed'
      }, { onSuccess })
      
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  describe('Toast management', () => {
    it('should dismiss specific toast', () => {
      toastSystem.dismiss('toast-123')
      expect(mockSonnerToast.dismiss).toHaveBeenCalledWith('toast-123')
    })

    it('should dismiss all toasts', () => {
      toastSystem.dismissAll()
      expect(mockSonnerToast.dismiss).toHaveBeenCalledWith()
    })
  })
})