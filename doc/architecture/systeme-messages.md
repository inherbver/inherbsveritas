# Système Messages Centralisé

## Vue d'ensemble

Système unifié de messages AuthMessage + Toasts pour cohérence UX complète sur toute la plateforme.

## Architecture Messages

### AuthMessage System
```typescript
export interface AuthMessage {
  type: 'success' | 'error' | 'warning' | 'info'
  key: string
  params?: Record<string, any>
}

export const AUTH_MESSAGES = {
  login: {
    success: { type: 'success', key: 'login.success' },
    invalidCredentials: { type: 'error', key: 'login.invalidCredentials' },
    networkError: { type: 'error', key: 'login.networkError' }
  },
  validation: {
    emailInvalid: { type: 'error', key: 'validation.emailInvalid' },
    passwordTooShort: { type: 'error', key: 'validation.passwordTooShort' }
  }
}
```

### Toast Integration
```typescript
export const toastSystem = {
  fromAuthMessage(message: AuthMessage, options?: BusinessToastOptions): string {
    const formattedMessage = formatAuthMessage(message)
    
    return this.show({
      type: message.type === 'error' ? 'error' : 'success',
      title: formattedMessage,
      duration: this.defaultDuration[message.type]
    }, options)
  }
}
```

### Business Patterns
```typescript
export const businessToasts = {
  auth: {
    loginSuccess: (userRole: UserRole) => toastSystem.show({
      type: 'success',
      title: 'Connexion réussie',
      description: 'Bienvenue !',
      duration: 3000
    }),
    
    loginError: (authMessage: AuthMessage) => toastSystem.fromAuthMessage(authMessage)
  },
  
  ecommerce: {
    addToCartSuccess: (productName: string) => toastSystem.show({
      type: 'success',
      title: 'Produit ajouté au panier',
      description: productName,
      action: {
        label: 'Voir panier',
        onClick: () => window.location.href = '/cart'
      }
    })
  }
}
```

## Intégration Composants

### Usage avec Hook
```tsx
export function useToast() {
  return {
    toast: toastSystem,
    businessToasts,
    showAuthMessage: (message: AuthMessage) => toastSystem.fromAuthMessage(message),
    showSuccess: (title: string, description?: string) => toastSystem.show({ type: 'success', title, description })
  }
}
```

### Pattern Actions
```typescript
const result = await loginUser(credentials)
if (result.success && result.message) {
  businessToasts.auth.loginSuccess(result.user.role)
}
if (!result.success && result.message) {
  toastSystem.fromAuthMessage(result.message)
}
```

## Avantages

- Messages centralisés avec i18n
- Cohérence UX complète
- Business patterns réutilisables
- Integration parfaite avec AuthMessage
- Évolutivité MVP vers V2