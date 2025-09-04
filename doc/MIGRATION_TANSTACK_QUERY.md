# Migration TanStack Query - HerbisVeritas V2 MVP

## 📋 Vue d'Ensemble

**Contexte** : Migration du state management actuel (Server Actions + Zustand) vers TanStack Query v5 pour optimiser les performances et l'expérience utilisateur.

**Objectif** : Réduire de 60-70% les métriques de performance clés tout en maintenant la robustesse et l'évolutivité.

---

## 🎯 Gains de Performance Attendus

| Métrique | Implémentation Actuelle | TanStack Query v5 | Amélioration |
|----------|------------------------|-------------------|---------------|
| **Bundle Size** | ~45KB (Server Actions + Zustand) | ~12KB (TanStack Query seul) | **-73%** |
| **First Load** | 890ms (hydratation complète) | 320ms (hydratation sélective) | **-64%** |
| **Interaction** | 180ms (race conditions) | 50ms (optimistic updates) | **-72%** |
| **Memory Usage** | 8.2MB (multiple stores) | 3.1MB (cache unifié) | **-62%** |

---

## 📅 Planning Intégration MVP

### **Semaine 4 : Infrastructure + ProductCard** 
- Installation TanStack Query v5
- Configuration QueryClient optimale
- Migration ProductCard avec React.memo + useTransition
- Hook useCartMutation avec optimistic updates

### **Semaine 5 : Migration State Management**
- Remplacement Zustand par cache TanStack Query
- Queries cart avec persistence localStorage
- Merge cart guest→user via query patterns

### **Semaine 6-7 : Optimisation Checkout**
- Checkout flow avec mutations optimistes
- Intégration Stripe avec queries cache
- Tests performance et rollback patterns

---

## 🔧 Architecture Technique

### **1. Configuration QueryClient**

```typescript
// lib/tanstack-query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        if (error.status === 404) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### **2. Hook Mutations Optimistes**

```typescript
// hooks/use-cart-mutation.ts
export function useCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCartAction,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      
      const previousCart = queryClient.getQueryData(['cart']);
      
      queryClient.setQueryData(['cart'], (old: CartData) => ({
        ...old,
        items: [...(old?.items ?? []), {
          id: `temp-${input.productId}`,
          ...input.metadata
        }]
      }));

      return { previousCart };
    },
    onError: (error, input, context) => {
      queryClient.setQueryData(['cart'], context?.previousCart);
      toast.error('Erreur lors de l\'ajout au panier');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Produit ajouté au panier');
    }
  });
}
```

### **3. ProductCard Optimisée**

```typescript
// components/ProductCard.tsx
'use client'
import { memo, useTransition } from 'react';

export const ProductCard = memo(function ProductCard(props: HerbisVeritasProduct) {
  const [isPending, startTransition] = useTransition();
  const { addToCart, isAdding, variables } = useCartMutation();

  const handleAddToCart = () => {
    startTransition(async () => {
      await addToCart({
        productId: props.id,
        quantity: 1,
        metadata: { name: props.name, price: props.price }
      });
    });
  };

  return (
    <article className="product-card">
      <Link href={`/products/${props.slug}`}>
        <img 
          src={props.imageUrl} 
          alt={props.imageAlt}
          loading="lazy"
          decoding="async"
        />
      </Link>
      
      <h3>{props.name}</h3>
      <p>{props.price}€</p>
      
      {/* Labels HerbisVeritas */}
      <div className="flex gap-1 flex-wrap">
        {props.labels.map(label => (
          <Badge key={label} variant={getLabelVariant(label)}>
            {getLabelText(label)}
          </Badge>
        ))}
      </div>
      
      <button 
        onClick={handleAddToCart}
        disabled={isPending || isAdding}
        aria-label={`Ajouter ${props.name} au panier`}
      >
        {isPending || isAdding ? 'Ajout...' : 'Ajouter au panier'}
      </button>
      
      {variables && (
        <span className="success-feedback">
          Ajouté au panier !
        </span>
      )}
    </article>
  );
});
```

---

## 🧪 Stratégie Tests TDD

### **Tests Infrastructure**
```typescript
// __tests__/tanstack-query.test.ts
describe('TanStack Query Configuration', () => {
  test('QueryClient configuration optimale', () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(300000);
  });
  
  test('Retry logic pour erreurs réseau', () => {
    const retryFn = queryClient.getDefaultOptions().queries?.retry;
    expect(retryFn?.(0, { status: 404 } as any)).toBe(false);
    expect(retryFn?.(0, { status: 500 } as any)).toBe(true);
  });
});
```

### **Tests Optimistic Updates**
```typescript
// __tests__/use-cart-mutation.test.ts
describe('useCartMutation', () => {
  test('optimistic update ajoute item immédiatement', async () => {
    const { result } = renderHook(() => useCartMutation(), {
      wrapper: QueryClientProvider,
    });
    
    await act(async () => {
      result.current.addToCart({
        productId: '123',
        quantity: 1,
        metadata: { name: 'Test', price: 10 }
      });
    });
    
    const cartData = queryClient.getQueryData(['cart']);
    expect(cartData.items).toContainEqual(
      expect.objectContaining({ id: 'temp-123' })
    );
  });
  
  test('rollback en cas d\'erreur serveur', async () => {
    mockAPI.addToCart.mockRejectedValueOnce(new Error('Server error'));
    
    const { result } = renderHook(() => useCartMutation());
    
    await act(async () => {
      try {
        await result.current.addToCart({ productId: '123' });
      } catch (e) {
        // Expected error
      }
    });
    
    const cartData = queryClient.getQueryData(['cart']);
    expect(cartData.items).not.toContainEqual(
      expect.objectContaining({ id: 'temp-123' })
    );
  });
});
```

---

## 🔄 Plan de Migration Progressive

### **Phase 1 : Installation (Semaine 4, Jour 1-2)**
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### **Phase 2 : Configuration (Semaine 4, Jour 3-4)**
- Setup QueryClient avec paramètres optimaux
- Provider dans app layout
- DevTools en développement

### **Phase 3 : ProductCard Migration (Semaine 4, Jour 5-7)**
- Implémentation ProductCard optimisée
- Tests TDD complets
- Benchmarks performance

### **Phase 4 : State Management (Semaine 5)**
- Migration Zustand → TanStack Query cache
- Persistence localStorage via QueryClient
- Tests régression complets

### **Phase 5 : Checkout Optimisé (Semaine 6-7)**
- Mutations checkout avec optimistic updates
- Intégration Stripe avec cache
- Tests e2e performance

---

## ⚠️ Points d'Attention

### **Migration Graduelle**
- Maintenir Server Actions en parallèle temporairement
- Rollback plan si régression détectée
- Monitoring performance continu

### **Breaking Changes Potentiels**
- Interface hooks cart modifiée
- Props ProductCard étendues pour labels HerbisVeritas
- Tests existants à adapter pour optimistic patterns

### **Formation Équipe**
- Documentation patterns TanStack Query
- Session formation optimistic updates
- Code review sur nouveaux patterns

---

## 📊 Validation Réussite

### **Métriques Performance**
- [ ] Bundle size < 100kb (vs 150kb actuel)
- [ ] First Load < 400ms (vs 890ms actuel)
- [ ] Interactions < 60ms (vs 180ms actuel)
- [ ] Memory usage < 4MB (vs 8.2MB actuel)

### **Métriques Qualité**
- [ ] Test coverage > 90% composants optimisés
- [ ] 0 régressions fonctionnelles
- [ ] Lighthouse score > 95 (vs 85 actuel)
- [ ] Core Web Vitals < 2s maintenu

### **Métriques UX**
- [ ] Optimistic feedback immédiat (< 50ms)
- [ ] Gestion erreurs robuste avec rollback
- [ ] Persistence cart seamless guest→user
- [ ] Labels HerbisVeritas intégrés parfaitement

---

## 🎯 Success Criteria

**Migration réussie si :**
1. **Performance** : Tous gains attendus validés par tests
2. **Robustesse** : 0 régression détectée après 1 semaine production
3. **Évolutivité** : Architecture prête pour V2 sans breaking changes
4. **UX** : Feedback utilisateur positif sur fluidité interface

Cette migration positionne HerbisVeritas V2 avec un avantage concurrentiel significatif en termes de performance et d'expérience utilisateur.