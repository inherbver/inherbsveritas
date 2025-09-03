# Documentation d'Implémentation Cart Moderne

## Vue d'Ensemble

Cette documentation présente l'implémentation **from scratch** d'un système de panier e-commerce moderne basé sur les meilleures pratiques 2024-2025. L'architecture privilégie la **simplicité**, la **maintenabilité** et les **performances** sans over-engineering.

## 🎯 Principes de Conception

### Objectifs
✅ **Architecture simple** : Séparation claire état local/serveur  
✅ **UX optimale** : Updates optimistes avec React 19  
✅ **Sécurité** : RLS, validation stricte, rate limiting  
✅ **Types stricts** : TypeScript + validation Zod  
✅ **Performance** : Debouncing unifié et efficace  

### Anti-Patterns Évités
❌ **Complexité excessive** : Un seul système de timing  
❌ **Couplage fort** : Séparation claire des responsabilités  
❌ **État distribué** : État centralisé avec source de vérité unique  
❌ **Over-engineering** : Solutions simples et éprouvées  

## 🏗️ Architecture Globale

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │  Local State    │    │  Server State   │
│                 │    │                 │    │                 │
│ • CartSheet     │◄──►│ Zustand Store   │◄──►│ React Query     │
│ • CartDisplay   │    │ • UI State      │    │ • Cart Data     │
│ • ProductCard   │    │ • Optimistic    │    │ • Mutations     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                         │
                              │                         │
                              ▼                         ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │ React 19        │    │ Server Actions  │
                    │ useOptimistic   │    │ • addToCart     │
                    │                 │    │ • updateCart    │
                    └─────────────────┘    │ • removeItem    │
                                          └─────────────────┘
                                                    │
                                                    ▼
                                          ┌─────────────────┐
                                          │ Database        │
                                          │ • Supabase      │
                                          │ • RLS Policies  │
                                          │ • Atomic Ops    │
                                          └─────────────────┘
```

## 📦 Structure des Fichiers

```
src/
├── stores/
│   ├── cart-store.ts           # Zustand store (état local)
│   └── slices/
│       ├── cart-slice.ts       # Logique cart
│       └── ui-slice.ts         # État UI
├── hooks/
│   ├── use-cart-query.ts       # React Query hooks
│   ├── use-cart-optimistic.ts  # React 19 useOptimistic
│   └── use-debounced-sync.ts   # Debouncing unifié
├── actions/
│   ├── cart-actions.ts         # Server actions
│   └── cart-mutations.ts       # Mutations React Query
├── components/
│   ├── cart/
│   │   ├── cart-sheet.tsx
│   │   ├── cart-display.tsx
│   │   └── cart-item.tsx
│   └── product/
│       └── add-to-cart-button.tsx
├── types/
│   └── cart.ts                 # Types TypeScript
├── lib/
│   ├── validators/
│   │   └── cart.validator.ts   # Validation Zod
│   └── utils/
│       └── cart-helpers.ts     # Utilitaires
└── database/
    ├── schema.sql              # Schéma BDD
    └── functions.sql           # Fonctions atomiques
```

## 🔧 Implémentation Détaillée

### 1. Types TypeScript

```typescript
// src/types/cart.ts
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
}

export interface CartData {
  id: string;
  userId?: string;
  items: CartItem[];
  updatedAt: string;
  totalItems: number;
  subtotal: number;
}

export interface CartState {
  // UI State seulement
  isOpen: boolean;
  optimisticItems: CartItem[];
  isOptimistic: boolean;
}

export type CartAction = 
  | { type: 'ADD_ITEM'; payload: { item: Omit<CartItem, 'id'> } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } };
```

### 2. Zustand Store (État Local)

```typescript
// src/stores/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createCartSlice } from './slices/cart-slice';
import { createUISlice } from './slices/ui-slice';

export const useCartStore = create<CartStore>()(
  persist(
    (...args) => ({
      ...createCartSlice(...args),
      ...createUISlice(...args),
    }),
    {
      name: 'cart-ui-state',
      // Persister seulement l'état UI, pas les données
      partialize: (state) => ({ 
        isOpen: state.isOpen 
      }),
    }
  )
);
```

```typescript
// src/stores/slices/cart-slice.ts
import { StateCreator } from 'zustand';

interface CartSlice {
  optimisticItems: CartItem[];
  isOptimistic: boolean;
  addOptimisticItem: (item: CartItem) => void;
  removeOptimisticItem: (id: string) => void;
  clearOptimistic: () => void;
}

export const createCartSlice: StateCreator<CartStore, [], [], CartSlice> = (set) => ({
  optimisticItems: [],
  isOptimistic: false,
  
  addOptimisticItem: (item) => set((state) => ({
    optimisticItems: [...state.optimisticItems, item],
    isOptimistic: true,
  })),
  
  removeOptimisticItem: (id) => set((state) => ({
    optimisticItems: state.optimisticItems.filter(item => item.id !== id),
    isOptimistic: state.optimisticItems.length > 1,
  })),
  
  clearOptimistic: () => set({
    optimisticItems: [],
    isOptimistic: false,
  }),
});
```

### 3. React Query + Server State

```typescript
// src/hooks/use-cart-query.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, addToCart, updateCartItem, removeFromCart } from '@/actions/cart-actions';

export const useCartQuery = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('Failed to add to cart:', error);
    },
  });
};

export const useUpdateCartMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
```

### 4. React 19 Optimistic Updates

```typescript
// src/hooks/use-cart-optimistic.ts
import { useOptimistic } from 'react';
import { CartItem, CartAction } from '@/types/cart';

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingIndex = state.findIndex(item => 
        item.productId === action.payload.item.productId
      );
      
      if (existingIndex !== -1) {
        return state.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + action.payload.item.quantity }
            : item
        );
      }
      
      return [...state, { ...action.payload.item, id: `temp-${Date.now()}` }];
      
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity === 0) {
        return state.filter(item => item.id !== action.payload.id);
      }
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.payload.id);
      
    default:
      return state;
  }
}

export const useCartOptimistic = (serverItems: CartItem[] = []) => {
  const [optimisticItems, addOptimistic] = useOptimistic(
    serverItems,
    cartReducer
  );

  return { optimisticItems, addOptimistic };
};
```

### 5. Debouncing Unifié

```typescript
// src/hooks/use-debounced-sync.ts
import { useCallback, useRef } from 'react';

export const useDebouncedSync = (syncFn: Function, delay = 300) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedSync = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        syncFn(...args);
      }, delay);
    },
    [syncFn, delay]
  );

  const cancelSync = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { debouncedSync, cancelSync };
};
```

### 6. Server Actions (Simplifiées)

```typescript
// src/actions/cart-actions.ts
'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { withRateLimit } from '@/lib/security/rate-limit';

const AddToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});

export const addToCart = withRateLimit('cart', 'add')(
  async (input: z.infer<typeof AddToCartSchema>) => {
    const { productId, quantity } = AddToCartSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    // Transaction atomique unique
    const { data, error } = await supabase.rpc('cart_add_item', {
      p_product_id: productId,
      p_quantity: quantity,
    });

    if (error) throw error;

    revalidateTag('cart');
    return data;
  }
);

export const getCart = async () => {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('user_cart_view') // Vue optimisée
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || { id: null, items: [], totalItems: 0, subtotal: 0 };
};
```

### 7. Composants UI Optimisés

```typescript
// src/components/cart/cart-display.tsx
'use client';

import { useCartQuery } from '@/hooks/use-cart-query';
import { useCartOptimistic } from '@/hooks/use-cart-optimistic';
import { useUpdateCartMutation } from '@/hooks/use-cart-query';
import { useDebouncedSync } from '@/hooks/use-debounced-sync';

export function CartDisplay() {
  const { data: serverCart, isLoading } = useCartQuery();
  const { optimisticItems, addOptimistic } = useCartOptimistic(serverCart?.items);
  const updateCartMutation = useUpdateCartMutation();
  
  const { debouncedSync } = useDebouncedSync(
    (id: string, quantity: number) => {
      updateCartMutation.mutate({ id, quantity });
    },
    300
  );

  const handleQuantityChange = (id: string, quantity: number) => {
    // 1. Update optimiste immédiat
    addOptimistic({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    
    // 2. Sync serveur debouncé
    debouncedSync(id, quantity);
  };

  if (isLoading) return <CartSkeleton />;

  return (
    <div className="cart-display">
      {optimisticItems.map((item) => (
        <CartItem 
          key={item.id}
          item={item}
          onQuantityChange={handleQuantityChange}
        />
      ))}
    </div>
  );
}
```

### 8. Database Schema Optimisée

```sql
-- database/schema.sql

-- Vue optimisée pour les requêtes cart
CREATE VIEW user_cart_view AS
SELECT 
  c.id,
  c.user_id,
  c.updated_at,
  COALESCE(
    json_agg(
      json_build_object(
        'id', ci.id,
        'productId', ci.product_id,
        'name', p.name,
        'price', p.price,
        'quantity', ci.quantity,
        'image', p.image_url,
        'slug', p.slug
      ) ORDER BY ci.created_at
    ) FILTER (WHERE ci.id IS NOT NULL),
    '[]'::json
  ) as items,
  COALESCE(SUM(ci.quantity), 0) as total_items,
  COALESCE(SUM(ci.quantity * p.price), 0) as subtotal
FROM carts c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
LEFT JOIN products p ON ci.product_id = p.id AND p.is_active = true
WHERE c.status = 'active'
GROUP BY c.id, c.user_id, c.updated_at;

-- Fonction atomique pour ajout/mise à jour
CREATE OR REPLACE FUNCTION cart_add_item(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cart_id UUID;
  v_user_id TEXT;
  v_result JSON;
BEGIN
  -- Récupérer l'utilisateur actuel
  v_user_id := auth.uid()::TEXT;
  
  -- Transaction atomique
  BEGIN
    -- Trouver ou créer le panier
    SELECT id INTO v_cart_id
    FROM carts 
    WHERE user_id = v_user_id AND status = 'active'
    LIMIT 1;
    
    IF v_cart_id IS NULL THEN
      INSERT INTO carts (user_id) VALUES (v_user_id)
      RETURNING id INTO v_cart_id;
    END IF;
    
    -- Ajouter ou mettre à jour l'item
    INSERT INTO cart_items (cart_id, product_id, quantity)
    VALUES (v_cart_id, p_product_id, p_quantity)
    ON CONFLICT (cart_id, product_id)
    DO UPDATE SET 
      quantity = cart_items.quantity + EXCLUDED.quantity,
      updated_at = NOW();
    
    -- Mettre à jour le timestamp du panier
    UPDATE carts SET updated_at = NOW() WHERE id = v_cart_id;
    
    -- Retourner le panier mis à jour
    SELECT row_to_json(cart.*) INTO v_result
    FROM user_cart_view cart
    WHERE cart.id = v_cart_id;
    
    RETURN v_result;
  END;
END;
$$;
```

## 🔒 Sécurité et Performance

### RLS Policies
```sql
-- Politique de sécurité simplifiée
CREATE POLICY "Users can manage their own cart"
ON carts FOR ALL
USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can manage their cart items"
ON cart_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM carts 
    WHERE carts.id = cart_items.cart_id 
    AND carts.user_id = auth.uid()::TEXT
  )
);
```

### Rate Limiting
```typescript
// src/lib/security/rate-limit.ts
export const withRateLimit = (resource: string, action: string) => {
  return (fn: Function) => async (...args: any[]) => {
    const key = `${resource}:${action}:${getUserId()}`;
    const limit = await checkRateLimit(key, 10, 60); // 10 req/min
    
    if (!limit.allowed) {
      throw new Error('Rate limit exceeded');
    }
    
    return fn(...args);
  };
};
```

## 📊 Monitoring et Métriques

### Métriques Clés
```typescript
// src/lib/monitoring/cart-metrics.ts
export const trackCartMetrics = {
  addToCart: (productId: string, quantity: number) => {
    analytics.track('cart_item_added', {
      product_id: productId,
      quantity,
      timestamp: Date.now(),
    });
  },
  
  optimisticUpdate: (success: boolean, duration: number) => {
    analytics.track('cart_optimistic_update', {
      success,
      duration_ms: duration,
    });
  },
  
  serverSync: (success: boolean, latency: number) => {
    analytics.track('cart_server_sync', {
      success,
      latency_ms: latency,
    });
  },
};
```

## 🧪 Tests

### Tests Unitaires
```typescript
// src/__tests__/cart-optimistic.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCartOptimistic } from '@/hooks/use-cart-optimistic';

describe('useCartOptimistic', () => {
  test('should add item optimistically', () => {
    const { result } = renderHook(() => useCartOptimistic([]));
    
    act(() => {
      result.current.addOptimistic({
        type: 'ADD_ITEM',
        payload: { item: mockCartItem }
      });
    });
    
    expect(result.current.optimisticItems).toHaveLength(1);
  });
});
```

### Tests d'Intégration
```typescript
// src/__tests__/cart-integration.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartDisplay } from '@/components/cart/cart-display';

test('should sync cart changes with server', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  render(
    <QueryClientProvider client={queryClient}>
      <CartDisplay />
    </QueryClientProvider>
  );
  
  const quantityInput = screen.getByRole('spinbutton');
  
  fireEvent.change(quantityInput, { target: { value: '3' } });
  
  await waitFor(() => {
    expect(mockUpdateCart).toHaveBeenCalledWith({
      id: 'item-1',
      quantity: 3
    });
  });
});
```

## 🚀 Déploiement et Évolutivité

### Checklist de Déploiement
- [ ] Tests unitaires et d'intégration passent
- [ ] Migrations BDD appliquées
- [ ] RLS policies activées
- [ ] Rate limiting configuré
- [ ] Monitoring activé
- [ ] Feature flags prêtes
- [ ] Documentation à jour

### Évolutions Futures
1. **Multi-currency** : Ajouter support devises multiples
2. **Promotions** : Système de codes promo
3. **Wishlist** : Intégration liste de souhaits
4. **Recommandations** : Produits suggérés dans le cart
5. **Analytics** : Métriques avancées d'abandon

---

*Documentation créée le 2 septembre 2025 - Architecture moderne sans over-engineering*