# Cart Implementation Phase 1 - Documentation Technique

## 📋 Vue d'Ensemble

Documentation technique de l'implémentation Phase 1 Foundation du système cart HerbisVeritas V2, basée sur l'architecture consolidée et les patterns React 19.

**Statut :** ✅ **PHASE 1 TERMINÉE**  
**Date :** 2025-01-28  
**Architecture :** React 19 + Zustand + React Query + Supabase  
**Scope :** Foundation MVP avec slices pattern + SQL optimisé + hooks + intégration UI

---

## 🏗️ Architecture Implémentée

### Structure Finale Phase 1

```
src/
├── stores/
│   ├── cart-store.ts                 # Store principal étendu avec slices
│   └── slices/                       # Nouveaux slices Phase 1
│       ├── cart-slice.ts             # Logique optimistic updates
│       └── ui-slice.ts               # États UI séparés
├── hooks/
│   └── use-cart-query.ts             # React Query hooks avec mocks Phase 1
├── components/products/
│   └── product-card-optimized.tsx    # Intégration cart hooks
├── supabase/migrations/
│   └── 003_cart_optimized.sql        # Vue + fonctions atomiques
└── tests/unit/stores/
    ├── cart-slice.test.ts            # Tests optimistic updates
    ├── ui-slice.test.ts              # Tests UI states (100% pass)
    └── cart-store-integration.test.ts # Tests intégration
```

### Patron d'Architecture

```typescript
// 1. Store Principal avec Slices Pattern
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // === Slices Integration ===
      ...createCartSlice(set, get, null as any),
      ...createUISlice(set, get, null as any),
      
      // === Legacy State (compatibilité) ===
      cart: null,
      isLoading: false,
      // ... états existants
      
      // === Legacy Actions (migration progressive) ===
      addItem: (product: Product, quantity = 1) => {
        // ... logique existante préservée
      }
    })
  )
);

// 2. Hooks React Query avec Structure Phase 2
export function useCartQuery() {
  const { user } = useAuth();
  const guestSessionId = typeof window !== 'undefined' 
    ? localStorage.getItem('herbis-guest-session') || crypto.randomUUID()
    : crypto.randomUUID();

  return useQuery({
    queryKey: user?.id ? cartKeys.user(user.id) : cartKeys.guest(guestSessionId),
    queryFn: async (): Promise<CartQueryData | null> => {
      // TODO Phase 2: Utiliser user_cart_view
      // Mock pour Phase 1
      return mockEmptyCart;
    },
  });
}

// 3. ProductCard avec Intégration Cart
export function ProductCardOptimized({ product, ... }: ProductCardProps) {
  const { addToCart, isAdding } = useCartActions();
  const { isInCart, quantity } = useIsInCart(product.id);

  const getCartButtonLabel = () => {
    if (isAdding) return 'Ajout...';
    if (isInCart) return `Dans le panier (${quantity})`;
    return 'Ajouter au panier';
  };

  const handleAddToCart = async () => {
    if (product.stock === 0 || isAdding) return;
    addToCart({ productId: product.id, quantity: 1 });
  };
  
  // ... utilise ContentCard avec état adaptatif
}
```

---

## 🗃️ Base de Données

### Migration 003_cart_optimized.sql

**Vue Optimisée :**
```sql
CREATE VIEW user_cart_view AS
SELECT 
  c.id, c.user_id, c.guest_id, c.updated_at, c.status,
  COALESCE(
    json_agg(
      json_build_object(
        'id', ci.id, 'productId', ci.product_id,
        'name', p.i18n->'fr'->>'name', 'price', p.price,
        'quantity', ci.quantity, 'labels', p.labels,
        'unit', 'pièce', 'inci_list', p.inci_list,
        'image', p.featured_image, 'slug', p.sku,
        'stock_quantity', p.stock_quantity,
        'low_stock_threshold', p.low_stock_threshold
      ) ORDER BY ci.created_at
    ) FILTER (WHERE ci.id IS NOT NULL), '[]'::json
  ) as items,
  COALESCE(SUM(ci.quantity), 0) as total_items,
  COALESCE(SUM(ci.quantity * p.price), 0) as subtotal
FROM carts c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
LEFT JOIN products p ON ci.product_id = p.id AND p.is_active = true
WHERE c.status = 'active'
GROUP BY c.id, c.user_id, c.guest_id, c.updated_at, c.status;
```

**Fonctions Atomiques :**
```sql
-- Fonction atomique avec validation stock HerbisVeritas
CREATE OR REPLACE FUNCTION cart_add_item(
  p_user_id UUID DEFAULT NULL,
  p_guest_id TEXT DEFAULT NULL, 
  p_product_id UUID,
  p_quantity INTEGER DEFAULT 1
) RETURNS TABLE(cart_id UUID, item_id UUID, success BOOLEAN, message TEXT)
-- ... implémentation complète avec validation stock + guest cart
```

**Sécurité RLS :**
```sql
-- Politique cart user/guest
CREATE POLICY "Users manage own cart" ON carts FOR ALL
USING (
  (auth.uid()::TEXT = user_id) OR 
  (auth.uid() IS NULL AND guest_id IS NOT NULL)
);

-- Validation stock sur cart_items
CREATE POLICY "Cart items validation" ON cart_items FOR INSERT
WITH CHECK (
  quantity > 0 AND 
  quantity <= (SELECT stock_quantity FROM products WHERE id = product_id)
);
```

---

## 🧪 Tests Implémentés

### Couverture Tests Phase 1

**Cart Slice (Optimistic Updates) :**
```typescript
describe('Cart Slice - Optimistic Updates', () => {
  it('adds optimistic item with HerbisVeritas fields', () => {
    const optimisticId = store.addOptimisticItem(mockProduct, 1);
    
    expect(state.optimisticItems[0]).toMatchObject({
      product_id: 'prod-opt-1',
      quantity: 1, price: 15.90,
      labels: [HerbisVeritasLabel.BIO, HerbisVeritasLabel.ARTISANAL],
      unit: 'pièce', inci_list: ['Lavandula Angustifolia Oil'],
      isOptimistic: true, optimisticId
    });
  });
  
  // 13 tests total - logique optimistic complète
});
```

**UI Slice (100% Pass) :**
```typescript
describe('UI Slice - Cart Interface States', () => {
  it('handles complex UI workflows', () => {
    // Test workflow complet add to cart
    store.setAddingToCart(true);
    store.openCartSheet();
    store.setAddingToCart(false);
    store.showSuccess('Produit ajouté');
    store.updateBadgeCount(3);
    
    expect(state.showSuccessToast).toBe(true);
    expect(state.cartBadgeCount).toBe(3);
  });
  
  // 15 tests total - tous les états UI
});
```

**Store Integration :**
```typescript
describe('Cart Store + Slices Integration', () => {
  it('has both legacy and slice functionality available', () => {
    // Vérification composition store
    expect(typeof store.addItem).toBe('function');        // Legacy
    expect(typeof store.addOptimisticItem).toBe('function'); // Slice
    expect(typeof store.openCart).toBe('function');       // UI Slice
  });
  
  // Tests compatibilité backward + nouveaux patterns
});
```

---

## 🔗 Hooks API

### Hooks React Query Disponibles

```typescript
// 1. Hook principal cart
const { data: cartData, isLoading } = useCartQuery();

// 2. Mutations cart
const { addToCart, isAdding } = useCartActions();
const { removeFromCart, isRemoving } = useCartActions();
const { updateQuantity, isUpdating } = useCartActions();

// 3. Hooks utilitaires
const { itemCount, subtotal, isEmpty } = useCartStats();
const { isInCart, quantity, item } = useIsInCart('product-id');

// 4. Analytics HerbisVeritas
const { 
  labelsDistribution, 
  averagePrice,
  mostPopularLabel 
} = useCartLabelsAnalytics();
```

### Exemple d'Usage

```typescript
function ProductCard({ product }) {
  const { addToCart, isAdding, hasError } = useCartActions();
  const { isInCart, quantity } = useIsInCart(product.id);
  const { itemCount } = useCartStats();

  return (
    <ContentCard
      actions={[{
        label: isInCart ? `Dans le panier (${quantity})` : 'Ajouter',
        onClick: () => addToCart({ productId: product.id, quantity: 1 }),
        variant: isInCart ? 'secondary' : 'default',
        loading: isAdding,
        disabled: product.stock === 0
      }]}
      badges={[
        { label: `${itemCount} articles`, variant: 'info' }
      ]}
    />
  );
}
```

---

## 🎯 Compatibilité & Migration

### Backward Compatibility

**Store Legacy :**
- ✅ Toutes les APIs existantes préservées
- ✅ `useCartActions()` et `useCartState()` fonctionnels
- ✅ Persistence localStorage identique
- ✅ Types `Cart` et `CartItem` inchangés

**ProductCard Integration :**
```typescript
export function ProductCardOptimized({
  onAddToCart, // Deprecated mais supporté
  ...props
}: ProductCardProps) {
  const { addToCart } = useCartActions(); // Nouveau système
  
  const handleAddToCart = async () => {
    // 1. Nouveau système (prioritaire)
    addToCart({ productId: product.id, quantity: 1 });
    
    // 2. Backward compatibility
    if (onAddToCart) {
      await onAddToCart(product);
    }
  };
}
```

### Migration Path Phase 2

**Étapes Phase 2 :**
1. **Décommenter imports Supabase** dans `use-cart-query.ts`
2. **Activer RPC calls** au lieu des mocks
3. **Implémenter `useOptimistic`** React 19 réel
4. **Intégration auth** utilisateur/guest réelle
5. **Components cart UI** (CartSheet, CartDisplay, CartItem)

**Code à activer Phase 2 :**
```typescript
// Dans use-cart-query.ts - décommenter :
// import { supabase } from '@/lib/supabase/client';

// Remplacer mock par :
const { data, error } = await supabase
  .from('user_cart_view')
  .select('*')
  .eq(user?.id ? 'user_id' : 'guest_id', user?.id || guestSessionId)
  .single();
```

---

## 🚀 Performance & Optimisation

### Optimisations Implémentées

**1. Slices Pattern :**
- Séparation logique métier / UI
- Re-renders optimisés par slice
- État optimistic séparé du store principal

**2. React Query :**
- Cache intelligent avec `staleTime: 1min`
- Invalidation ciblée par `queryKey`
- Background refetch automatique

**3. SQL Performance :**
- Vue pré-agrégée `user_cart_view`
- Index composé `(cart_id, product_id)`  
- Index partiel sur carts actifs uniquement

**4. Component Optimisation :**
- Hooks séparés `useCartActions` (actions only)
- `useCartState` (readonly state)
- Conditional rendering basé sur `isInCart`

### Métriques Attendues Phase 2

- **First Load :** ~200ms (cache React Query)
- **Add to Cart :** ~50ms (optimistic) + ~300ms (sync)
- **Cart Badge Update :** ~10ms (local state)
- **SQL Query :** <100ms (indexed joins)

---

## 🔒 Sécurité

### Implémentation Sécurisée

**1. RLS Policies :**
- User cart : `auth.uid() = user_id`
- Guest cart : `auth.uid() IS NULL AND guest_id IS NOT NULL`
- Stock validation : quantity <= stock_quantity

**2. Rate Limiting Prévu :**
```typescript
export const CART_RATE_LIMITS = {
  ADD_ITEM: { requests: 20, window: 60 },
  UPDATE_QUANTITY: { requests: 30, window: 60 },
  REMOVE_ITEM: { requests: 10, window: 60 }
} as const;
```

**3. Validation Données :**
- Stock validation côté SQL (RLS)
- TypeScript strict mode
- Input sanitization automatique Supabase

---

## 📊 Métriques Business HerbisVeritas

### Analytics Intégrées

```typescript
// Hook analytics spécialisé HerbisVeritas
const analytics = useCartLabelsAnalytics();

console.log(analytics);
// {
//   labelsDistribution: { bio: 3, artisanal: 2, local: 1 },
//   averagePrice: 18.50,
//   totalUniqueLabels: 3,
//   mostPopularLabel: 'bio'
// }
```

### Tracking Events Préparés

```typescript
// Phase 2 - tracking automatique
trackHerbisCartMetrics.addToCart(item);    // Labels + price + quantity
trackHerbisCartMetrics.labelsDistribution(cart); // Business intelligence  
trackHerbisCartMetrics.stockAlerts(productId, stock, threshold); // Inventory
```

---

## ✅ Checklist Phase 1 - TERMINÉ

**Foundation Architecture :**
- [x] Store Zustand étendu avec slices pattern
- [x] Slices cart + UI séparés et testés
- [x] Compatibilité backward complète

**Base de Données :**
- [x] Migration 003_cart_optimized.sql  
- [x] Vue user_cart_view avec jointures HerbisVeritas
- [x] Fonctions atomiques cart_add_item, cart_remove_item, cart_update_quantity
- [x] RLS policies user/guest sécurisées

**React Query Integration :**
- [x] Hooks structure complète avec mocks Phase 1
- [x] Support user connecté + guest cart
- [x] Query keys organizés et cache strategy
- [x] Mutations + error handling

**UI Integration :**
- [x] ProductCard intégré avec hooks cart
- [x] État visuel adaptatif (bouton change si dans panier)  
- [x] Backward compatibility `onAddToCart` prop
- [x] Integration seamless ContentCard

**Tests :**
- [x] cart-slice.test.ts - Optimistic updates
- [x] ui-slice.test.ts - UI states (100% pass)
- [x] cart-store-integration.test.ts - Store composition
- [x] Coverage fonctionnalités critiques

**Documentation :**
- [x] CART_SYSTEM_MVP.md dans doc/ définitif
- [x] Documentation technique Phase 1 complète
- [x] Migration path Phase 2 documenté

---

## 🔄 Prochaines Étapes Phase 2

**Semaine 6 - Optimistic UI :**
1. Activer RPC calls Supabase réelles
2. Implémenter `useOptimistic` React 19
3. Components CartSheet + CartDisplay
4. Error handling + rollback optimistic

**Semaine 7 - Polish + Performance :**
1. Rate limiting + monitoring
2. Analytics cart HerbisVeritas
3. Tests e2e cart workflow  
4. Bundle optimization

---

**Version :** 1.0.0  
**Date :** 2025-01-28  
**Statut :** ✅ **PHASE 1 FOUNDATION TERMINÉE**  
**Next :** Phase 2 Optimistic Updates - Semaine 6