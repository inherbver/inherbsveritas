# Système Messages HerbisVeritas V2 - Intégration Architecture Shared Components

## 📋 Vue d'Ensemble

Système unifié de messages AuthMessage + Toasts pour cohérence UX complète, **intégré natif dans l'architecture Shared Components**.

**Innovation :** Messages business automatiques dans ContentCard actions + feedback instant via toasts optimisés.

---

## 🏗️ Architecture Messages Unifiée

### AuthMessage System Core
```typescript
export interface AuthMessage {
  type: 'success' | 'error' | 'warning' | 'info'
  key: string
  params?: Record<string, any>
  business?: 'auth' | 'ecommerce' | 'content' | 'admin'
}

export const AUTH_MESSAGES = {
  // Authentification
  login: {
    success: { type: 'success', key: 'login.success', business: 'auth' },
    invalidCredentials: { type: 'error', key: 'login.invalidCredentials', business: 'auth' }
  },
  
  // E-commerce (ContentCard actions)
  cart: {
    addSuccess: { type: 'success', key: 'cart.addSuccess', business: 'ecommerce' },
    addError: { type: 'error', key: 'cart.addError', business: 'ecommerce' },
    removeSuccess: { type: 'success', key: 'cart.removeSuccess', business: 'ecommerce' }
  },
  
  // Content Management (ContentCard CMS)
  content: {
    publishSuccess: { type: 'success', key: 'content.publishSuccess', business: 'content' },
    saveSuccess: { type: 'success', key: 'content.saveSuccess', business: 'content' }
  }
}
```

### Toast System Optimisé
```typescript
export const toastSystem = {
  // Integration ContentCard actions
  fromContentCardAction(
    action: ContentCardAction, 
    result: ActionResult,
    options?: BusinessToastOptions
  ): string {
    const message = result.success 
      ? { type: 'success', key: `${action.business}.${action.type}.success` }
      : { type: 'error', key: `${action.business}.${action.type}.error` }
    
    return this.fromAuthMessage(message as AuthMessage, {
      ...options,
      position: 'bottom-right',
      duration: result.success ? 2000 : 4000
    })
  },

  fromAuthMessage(message: AuthMessage, options?: BusinessToastOptions): string {
    const formattedMessage = formatAuthMessage(message)
    
    return this.show({
      type: message.type === 'error' ? 'error' : 'success',
      title: formattedMessage,
      duration: this.businessDuration[message.business || 'default']
    }, options)
  },

  businessDuration: {
    auth: { success: 3000, error: 5000 },
    ecommerce: { success: 2000, error: 4000 },
    content: { success: 2500, error: 4000 },
    default: { success: 2000, error: 4000 }
  }
}
```

---

## 🎯 Intégration ContentCard Actions

### Pattern Actions avec Messages Automatiques

**ContentCard actions déclenchent automatiquement les messages appropriés :**

```tsx
// Actions ContentCard avec feedback intégré
const productActions: ContentCardAction[] = [
  {
    label: 'Ajouter au panier',
    onClick: async (product) => {
      const result = await addToCart(product)
      
      // Message automatique basé sur résultat
      if (result.success) {
        businessToasts.ecommerce.addToCartSuccess(product.name)
      } else {
        toastSystem.fromAuthMessage(result.message || AUTH_MESSAGES.cart.addError)
      }
      
      return result
    },
    variant: 'default',
    icon: ShoppingCart,
    business: 'ecommerce',
    type: 'addToCart'
  }
]

<ContentCard
  variant="product"
  actions={productActions}
  // Messages automatiques intégrés
/>
```

### Hook Actions Optimisé
```tsx
export function useContentCardActions() {
  const { toast } = useToast()
  
  return {
    // E-commerce actions
    createAddToCartAction: (onAddToCart: (product: Product) => Promise<ActionResult>) => ({
      label: 'Ajouter au panier',
      onClick: async (product: Product) => {
        const result = await onAddToCart(product)
        
        toast.fromContentCardAction(
          { business: 'ecommerce', type: 'addToCart' } as ContentCardAction,
          result,
          {
            action: result.success ? {
              label: 'Voir panier',
              onClick: () => router.push('/cart')
            } : undefined
          }
        )
        
        return result
      },
      variant: 'default' as const,
      icon: ShoppingCart,
      business: 'ecommerce',
      type: 'addToCart'
    }),
    
    // Content actions  
    createShareAction: (onShare: (content: any) => Promise<ActionResult>) => ({
      label: 'Partager',
      onClick: async (content: any) => {
        const result = await onShare(content)
        
        toast.fromContentCardAction(
          { business: 'content', type: 'share' } as ContentCardAction,
          result
        )
        
        return result
      },
      variant: 'ghost' as const,
      icon: Share2,
      business: 'content', 
      type: 'share'
    })
  }
}
```

---

## 🛠️ Business Toasts Spécialisés

### E-commerce Patterns (ProductCard)
```typescript
export const businessToasts = {
  ecommerce: {
    // Actions panier
    addToCartSuccess: (productName: string, quantity: number = 1) => toastSystem.show({
      type: 'success',
      title: `${productName} ajouté au panier`,
      description: quantity > 1 ? `Quantité: ${quantity}` : undefined,
      action: {
        label: 'Voir panier',
        onClick: () => window.location.href = '/cart'
      },
      duration: 2000
    }),
    
    addToCartError: (productName: string, error?: string) => toastSystem.show({
      type: 'error', 
      title: 'Erreur ajout panier',
      description: error || `Impossible d'ajouter ${productName}`,
      duration: 4000
    }),
    
    // Actions favoris
    addToFavoritesSuccess: (productName: string) => toastSystem.show({
      type: 'success',
      title: `${productName} ajouté aux favoris`,
      action: {
        label: 'Voir favoris',
        onClick: () => window.location.href = '/favorites'
      }
    })
  },
  
  content: {
    // Actions articles (ArticleCard)
    shareSuccess: (articleTitle: string) => toastSystem.show({
      type: 'success',
      title: 'Article partagé',
      description: articleTitle,
      duration: 2000
    }),
    
    bookmarkSuccess: (articleTitle: string) => toastSystem.show({
      type: 'success', 
      title: 'Article sauvegardé',
      description: articleTitle,
      action: {
        label: 'Mes articles',
        onClick: () => window.location.href = '/bookmarks'
      }
    })
  },
  
  admin: {
    // Actions admin (CategoryCard, etc.)
    publishSuccess: (contentType: string, contentName: string) => toastSystem.show({
      type: 'success',
      title: `${contentType} publié`,
      description: contentName,
      duration: 2500
    }),
    
    deleteSuccess: (contentType: string, contentName: string) => toastSystem.show({
      type: 'success',
      title: `${contentType} supprimé`,
      description: contentName
    })
  }
}
```

### Toast Positions Optimisées
```typescript
const toastPositions = {
  ecommerce: 'bottom-right',     // Actions panier visibles
  content: 'top-right',          // Actions contenu discretes
  admin: 'top-center',           // Actions admin prominentes
  auth: 'top-center'             // Messages auth centraux
}
```

---

## 📱 Intégration Mobile Responsive

### Toast Responsive Automatique
```typescript
const responsiveToastConfig = {
  mobile: {
    position: 'bottom-center',
    maxWidth: '90vw',
    duration: { success: 1500, error: 3000 }
  },
  desktop: {
    position: 'bottom-right', 
    maxWidth: '400px',
    duration: { success: 2000, error: 4000 }
  }
}

export function useResponsiveToast() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  return {
    config: isMobile ? responsiveToastConfig.mobile : responsiveToastConfig.desktop,
    show: (message: ToastMessage) => toastSystem.show({
      ...message,
      ...responsiveToastConfig[isMobile ? 'mobile' : 'desktop']
    })
  }
}
```

---

## 🌐 Internationalisation Messages

### Messages i18n Intégrés
```typescript
// messages/fr.json
{
  "cart": {
    "addSuccess": "Produit ajouté au panier",
    "addError": "Erreur lors de l'ajout au panier",
    "removeSuccess": "Produit retiré du panier"
  },
  "favorites": {
    "addSuccess": "Produit ajouté aux favoris",
    "removeSuccess": "Produit retiré des favoris"
  },
  "content": {
    "shareSuccess": "Article partagé avec succès",
    "bookmarkSuccess": "Article sauvegardé"
  }
}

// Hook i18n messages
export function useI18nMessages() {
  const { locale } = useTranslations()
  
  return {
    formatAuthMessage: (message: AuthMessage) => {
      return formatMessage(message.key, message.params, locale)
    },
    
    getBusinessMessage: (business: string, action: string, type: 'success' | 'error') => {
      return formatMessage(`${business}.${action}${type === 'success' ? 'Success' : 'Error'}`, {}, locale)
    }
  }
}
```

---

## 🧪 Testing Messages System

### Tests Messages Intégrés
```tsx
describe('ContentCard Messages Integration', () => {
  it('should show success toast after add to cart', async () => {
    const mockAddToCart = jest.fn().mockResolvedValue({ success: true })
    const { toast } = renderHook(() => useToast()).result.current
    
    render(
      <ContentCard
        variant="product"
        actions={[{
          label: 'Ajouter au panier',
          onClick: mockAddToCart,
          business: 'ecommerce',
          type: 'addToCart'
        }]}
      />
    )
    
    fireEvent.click(screen.getByText('Ajouter au panier'))
    
    await waitFor(() => {
      expect(screen.getByText(/ajouté au panier/i)).toBeInTheDocument()
    })
  })
  
  it('should show error toast on action failure', async () => {
    const mockAction = jest.fn().mockResolvedValue({ 
      success: false, 
      message: AUTH_MESSAGES.cart.addError 
    })
    
    // Test error handling
    fireEvent.click(screen.getByText('Ajouter au panier'))
    
    await waitFor(() => {
      expect(screen.getByText(/erreur/i)).toBeInTheDocument()
    })
  })
})
```

---

## 🚀 Performance Messages

### Messages Batch Optimisés
```typescript
class ToastBatchManager {
  private queue: ToastMessage[] = []
  private batchTimeout: NodeJS.Timeout | null = null
  
  add(message: ToastMessage) {
    this.queue.push(message)
    
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.processBatch()
      }, 100) // Batch dans 100ms
    }
  }
  
  private processBatch() {
    // Groupe par type pour éviter spam
    const grouped = this.queue.reduce((acc, msg) => {
      if (!acc[msg.business]) acc[msg.business] = []
      acc[msg.business].push(msg)
      return acc
    }, {} as Record<string, ToastMessage[]>)
    
    // Affiche un toast groupé si plusieurs du même type
    Object.entries(grouped).forEach(([business, messages]) => {
      if (messages.length > 1 && business === 'ecommerce') {
        toastSystem.show({
          type: 'success',
          title: `${messages.length} produits ajoutés au panier`,
          action: { label: 'Voir panier', onClick: () => router.push('/cart') }
        })
      } else {
        messages.forEach(msg => toastSystem.show(msg))
      }
    })
    
    this.queue = []
    this.batchTimeout = null
  }
}
```

---

## 📊 Analytics Messages

### Tracking Messages Business
```typescript
export const messageAnalytics = {
  track: (message: AuthMessage, context: { component?: string, action?: string }) => {
    analytics.track('message_shown', {
      type: message.type,
      business: message.business,
      key: message.key,
      component: context.component,
      action: context.action,
      timestamp: Date.now()
    })
  },
  
  trackContentCardAction: (action: ContentCardAction, result: ActionResult) => {
    analytics.track('contentcard_action', {
      business: action.business,
      type: action.type,
      success: result.success,
      duration: result.duration,
      component: 'ContentCard'
    })
  }
}
```

---

## 💼 Avantages Business Messages

### ROI Messages System
- **UX Consistency** automatique sur toute la plateforme
- **Development Speed** messages standardisés réutilisables  
- **User Engagement** feedback instant améliore conversions
- **Analytics Insights** tracking comportement utilisateur

### Integration Shared Components
- **Messages natifs** dans ContentCard actions
- **Feedback automatique** succès/erreur sans code custom
- **Business patterns** réutilisables cross-domain
- **Mobile optimized** responsive positioning

---

## 📚 Ressources Messages

### Documentation Complète
- **[ContentCard Actions](../SHARED_COMPONENTS_GUIDE.md#actions-système)** - Integration messages
- **[Business Patterns](./infrastructure-composants.md#messages-integration)** - Patterns réutilisables
- **[i18n Integration](../DESIGN_SYSTEM_HERBISVERITAS.md#internationalisation)** - Messages multilingues

### Formation Continue
- **Toast optimization** performance et UX
- **Business patterns** domain-specific messages
- **Analytics tracking** message effectiveness
- **A/B testing** message variants

---

**Version :** V2.0 - Messages System + Shared Components Integration  
**Date :** 2025-01-28  
**Status :** ✅ **MESSAGES SYSTEM UNIFIÉ OPÉRATIONNEL**  
**Impact :** UX cohérente automatique sur architecture shared components 🚀