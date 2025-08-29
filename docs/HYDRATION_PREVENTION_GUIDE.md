# Guide Prévention Hydration Mismatch - HerbisVeritas V2

## 🚨 **ZERO TOLERANCE** - Hydration Mismatches

Ce guide explique l'utilisation **obligatoire** des patterns Context7 pour éliminer complètement les hydration mismatches dans HerbisVeritas V2.

---

## 🔥 **Causes Fréquentes d'Hydration Mismatch**

### ❌ **ERREURS À ÉVITER ABSOLUMENT :**

```typescript
// ❌ Date différente server vs client
function BadDateComponent() {
  return <div>{new Date().toLocaleDateString()}</div>;
}

// ❌ localStorage au render initial
function BadStorageComponent() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  return <div>Hello {user.name}</div>;
}

// ❌ Math.random au render
function BadRandomComponent() {
  return <div>Random: {Math.random()}</div>;
}

// ❌ window object direct
function BadWindowComponent() {
  return <div>Width: {window.innerWidth}px</div>;
}
```

---

## ✅ **Patterns Obligatoires Context7**

### **1. Composants Client-Only**

```typescript
import { ClientOnly } from '@/components/UI/HydrationSafe';

// ✅ CORRECT - Wrapper client-only
function UserDashboard() {
  return (
    <main>
      <header>
        <h1>Tableau de bord</h1>
      </header>
      
      <ClientOnly fallback={<div>Chargement...</div>}>
        <UserPreferences />
        <CartSummary />
      </ClientOnly>
    </main>
  );
}
```

### **2. Dates Sécurisées**

```typescript
import { SafeDate } from '@/components/UI/HydrationSafe';

// ✅ CORRECT - Date hydration-safe
function OrderHistory({ orders }: { orders: Order[] }) {
  return (
    <section>
      <h2>Historique des commandes</h2>
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            <article>
              <header>
                <h3>Commande #{order.order_number}</h3>
              </header>
              <dl>
                <dt>Date :</dt>
                <dd>
                  <SafeDate 
                    date={order.created_at}
                    format={{ 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }}
                    fallback="Date de commande"
                  />
                </dd>
                <dt>Total :</dt>
                <dd>
                  <SafeCurrency 
                    amount={order.total_amount}
                    currency={order.currency}
                  />
                </dd>
              </dl>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

### **3. LocalStorage Sécurisé**

```typescript
import { useLocalStorage } from '@/hooks/useHydrationSafe';

// ✅ CORRECT - Storage hydration-safe
function UserSettings() {
  const [preferences, setPreferences, isHydrated] = useLocalStorage('user-prefs', {
    theme: 'light',
    language: 'fr',
    notifications: true
  });

  // Affichage pendant l'hydration
  if (!isHydrated) {
    return (
      <section>
        <h2>Préférences</h2>
        <div>Chargement des préférences...</div>
      </section>
    );
  }

  return (
    <section>
      <h2>Préférences</h2>
      <form>
        <fieldset>
          <legend>Apparence</legend>
          
          <label htmlFor="theme">Thème :</label>
          <select 
            id="theme"
            value={preferences.theme}
            onChange={(e) => setPreferences(prev => ({ 
              ...prev, 
              theme: e.target.value as 'light' | 'dark' 
            }))}
          >
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
          </select>
        </fieldset>
      </form>
    </section>
  );
}
```

### **4. Panier E-commerce Safe**

```typescript
import { useCartPersistence } from '@/hooks/useHydrationSafe';
import { CartBadge } from '@/components/UI/HydrationSafe';

// ✅ CORRECT - Panier sans hydration mismatch
function CartButton() {
  const { cart, isHydrated } = useCartPersistence();

  return (
    <button type="button" aria-label="Voir le panier">
      🛒 Panier
      <CartBadge 
        count={cart.itemCount}
        showZero={false}
        className="cart-badge"
      />
    </button>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartPersistence();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  };

  return (
    <article>
      <header>
        <h3>{product.name}</h3>
      </header>
      
      <section>
        <p>{product.description_short}</p>
        <SafeCurrency 
          amount={product.price}
          currency={product.currency}
        />
      </section>
      
      <footer>
        <button 
          type="button"
          onClick={handleAddToCart}
        >
          Ajouter au panier
        </button>
      </footer>
    </article>
  );
}
```

### **5. Composants Conditionnels**

```typescript
import { useIsClient, useIsMobile } from '@/hooks/useHydrationSafe';
import { ConditionalRender } from '@/components/UI/HydrationSafe';

// ✅ CORRECT - Rendu conditionnel safe
function ResponsiveNavigation() {
  const isMobile = useIsMobile();

  return (
    <ConditionalRender
      condition={isMobile}
      server={
        <nav>
          {/* Version serveur - basique */}
          <ul>
            <li><a href="/">Accueil</a></li>
            <li><a href="/products">Produits</a></li>
            <li><a href="/about">À propos</a></li>
          </ul>
        </nav>
      }
      client={
        <nav>
          {/* Version client - adaptive */}
          {isMobile ? <MobileMenu /> : <DesktopMenu />}
        </nav>
      }
    />
  );
}
```

### **6. Composants Dynamiques**

```typescript
import { DynamicComponent } from '@/components/UI/HydrationSafe';

// ✅ CORRECT - Import dynamique safe
function ProductPage() {
  return (
    <main>
      <section>
        <h1>Savon Lavande Bio</h1>
        <p>Description du produit...</p>
      </section>
      
      {/* Composant lourd chargé côté client uniquement */}
      <DynamicComponent
        loader={() => import('@/components/Product/ReviewsSection')}
        loading={() => <div>Chargement des avis...</div>}
        ssr={false}
      />
      
      <DynamicComponent
        loader={() => import('@/components/Product/RecommendedProducts')}
        loading={() => <div>Chargement des suggestions...</div>}
        ssr={false}
      />
    </main>
  );
}
```

---

## 🛠️ **Debugging Hydration Mismatches**

### **1. Hook de Debug (Développement)**

```typescript
import { HydrationDebugger } from '@/components/UI/HydrationSafe';
import { useHydrationDebug } from '@/hooks/useHydrationSafe';

function MyComponent() {
  useHydrationDebug('MyComponent');
  
  return (
    <HydrationDebugger 
      componentName="MyComponent"
      showDebugInfo={process.env.NODE_ENV === 'development'}
    >
      {/* Contenu du composant */}
    </HydrationDebugger>
  );
}
```

### **2. Détection d'Erreurs**

```typescript
// Console logs en développement :
// ✅ "MyComponent hydrated successfully at: 2025-01-28T..."
// ❌ "Warning: Hydration failed due to mismatch..."
```

### **3. suppressHydrationWarning**

```typescript
// À utiliser SEULEMENT pour les cas légitimes
function TimeComponent() {
  const isClient = useIsClient();
  
  return (
    <time suppressHydrationWarning>
      {isClient 
        ? new Date().toLocaleString()
        : 'Chargement...'
      }
    </time>
  );
}
```

---

## 📋 **Checklist de Review**

Avant chaque commit, vérifier :

### ✅ **Composants**
- [ ] Aucun accès direct à `window`, `localStorage`, `document`
- [ ] Pas de `Date.now()`, `Math.random()` au render initial
- [ ] Composants client wrappés avec `ClientOnly` ou `dynamic`
- [ ] Dates/prix utilisant `SafeDate`/`SafeCurrency`
- [ ] Storage utilisant hooks `useLocalStorage`/`useSessionStorage`

### ✅ **Patterns**
- [ ] Conditional rendering avec `ConditionalRender`
- [ ] Media queries avec `useMediaQuery`
- [ ] Fallbacks appropriés pendant l'hydration
- [ ] `suppressHydrationWarning` justifié et documenté

### ✅ **Tests**
- [ ] Aucun warning d'hydration en console
- [ ] Rendu identique server/client initial
- [ ] Transitions fluides après hydration

---

## 🚀 **Exemples E-commerce Complets**

### **Page Produit Complete**

```typescript
import { 
  ClientOnly, 
  SafeDate, 
  SafeCurrency,
  DynamicComponent 
} from '@/components/UI/HydrationSafe';

export default function ProductPage({ product }: { product: Product }) {
  return (
    <main>
      <header>
        <nav aria-label="Fil d'Ariane">
          <ol>
            <li><a href="/">Accueil</a></li>
            <li><a href="/products">Produits</a></li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>
      </header>

      <article>
        <header>
          <h1>{product.name}</h1>
        </header>

        <section aria-label="Images produit">
          <figure>
            <img src={product.image_url} alt={product.name} />
            <figcaption>{product.name}</figcaption>
          </figure>
        </section>

        <section aria-label="Informations produit">
          <dl>
            <dt>Prix</dt>
            <dd>
              <SafeCurrency 
                amount={product.price}
                currency={product.currency}
              />
            </dd>
            
            <dt>Stock</dt>
            <dd>{product.stock} en stock</dd>
            
            <dt>Labels</dt>
            <dd>
              <ul>
                {product.labels?.map(label => (
                  <li key={label}>
                    <ProductLabelBadge label={label} />
                  </li>
                ))}
              </ul>
            </dd>
          </dl>
        </section>

        <section aria-label="Actions">
          <ClientOnly fallback={<div>Chargement...</div>}>
            <AddToCartForm product={product} />
          </ClientOnly>
        </section>
      </article>

      <aside aria-label="Contenu supplémentaire">
        <DynamicComponent
          loader={() => import('@/components/Product/ReviewsSection')}
          loading={() => (
            <section>
              <h2>Avis clients</h2>
              <div>Chargement des avis...</div>
            </section>
          )}
          ssr={false}
        />
        
        <DynamicComponent
          loader={() => import('@/components/Product/RelatedProducts')}
          loading={() => (
            <section>
              <h2>Produits similaires</h2>
              <div>Chargement...</div>
            </section>
          )}
          ssr={false}
        />
      </aside>
    </main>
  );
}
```

---

## 📚 **Références**

- **Hooks Hydration** : `/src/hooks/useHydrationSafe.ts`
- **Composants Safe** : `/src/components/UI/HydrationSafe.tsx`
- **Types Context7** : `/src/types/context7-patterns.ts`
- **Guide TypeScript** : `/docs/TYPESCRIPT_CONTEXT7_GUIDE.md`

**Version :** 1.0.0  
**Dernière MAJ :** 2025-01-28  
**Statut :** ✅ PRODUCTION READY

---

**🎯 Objectif : 0% Hydration Mismatches dans HerbisVeritas V2**