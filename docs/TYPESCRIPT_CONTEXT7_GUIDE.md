# Guide TypeScript Context7 - HerbisVeritas V2

## 🎯 Objectif : Éliminer `any` Complètement

Ce guide explique l'utilisation des patterns Context7 intégrés pour maintenir un typage strict **100% sans `any`** dans HerbisVeritas V2.

---

## 🚫 Règles Absolues

### ❌ **INTERDICTIONS**
- ❌ `any` sous toutes ses formes
- ❌ `object` générique  
- ❌ `as any` ou cast dangereux
- ❌ `@ts-ignore` ou `@ts-nocheck`
- ❌ Types implicites
- ❌ `<div onClick>` au lieu de `<button>`

### ✅ **OBLIGATIONS**
- ✅ Type guards pour `unknown`
- ✅ Branded types pour domaine métier
- ✅ Validation runtime avec Zod
- ✅ Generic constraints
- ✅ Balises sémantiques HTML

---

## 🏗️ Architecture Context7

### 1. **Branded Types - Sécurité Domaine**

```typescript
import { createProductId, type ProductId } from '@/types/context7-patterns';

// ✅ Types sécurisés par domaine
function getProduct(id: ProductId): Promise<Product> {
  // ProductId ne peut pas être confondu avec UserId
}

// Usage
const productId = createProductId('uuid-string');
const product = await getProduct(productId);
```

### 2. **Type Guards au lieu de Any**

```typescript
import { isProduct, safeCast } from '@/lib/type-guards';

// ❌ JAMAIS ça
function processData(data: any) {
  return data.product.name;
}

// ✅ TOUJOURS ça
function processData(data: unknown): string {
  if (isProduct(data)) {
    return data.name; // Type safe !
  }
  throw new Error('Invalid product data');
}

// ✅ Safe cast pattern
const product = safeCast(unknownData, isProduct);
if (product) {
  console.log(product.name); // Type safe
}
```

### 3. **Generic Constraints Stricts**

```typescript
import type { HasId, EntityUpdate } from '@/types/context7-patterns';

// ✅ Contraintes génériques
function updateEntity<T extends HasId>(
  entity: T, 
  updates: EntityUpdate<T>
): Promise<T> {
  // T est forcément un objet avec id
  return fetch(`/api/${entity.id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }).then(res => res.json());
}
```

### 4. **Validation Runtime Zod**

```typescript
import { z } from 'zod';
import { ProductLabelSchema, PriceSchema } from '@/lib/type-guards';

// ✅ Schema Zod strict
const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: PriceSchema,
  labels: z.array(ProductLabelSchema).optional(),
  inci_list: z.array(z.string()).optional()
});

type CreateProductRequest = z.infer<typeof CreateProductSchema>;

// ✅ Validation API
export async function createProduct(data: unknown): Promise<Product> {
  const validated = CreateProductSchema.parse(data);
  // validated est maintenant typé !
  
  return supabase
    .from('products')
    .insert(validated)
    .select()
    .single();
}
```

---

## 🧩 Patterns par Cas d'Usage

### **API Responses**

```typescript
import { isApiSuccess, type ApiResponse } from '@/lib/type-guards';

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products');
  const data: unknown = await response.json();
  
  // ✅ Validation type-safe
  if (isApiSuccess<Product[]>(data)) {
    return data.data; // Type safe
  }
  
  throw new Error('Failed to fetch products');
}
```

### **Form Handling**

```typescript
import type { FormState, FormAction } from '@/types/context7-patterns';
import { useReducer } from 'react';

interface ProductForm {
  name: string;
  price: number;
  labels: ProductLabel[];
}

// ✅ State typé strict
const [formState, dispatch] = useReducer<
  React.Reducer<FormState<ProductForm>, FormAction<ProductForm>>
>(formReducer, initialState);

// ✅ Actions typées
dispatch({ 
  type: 'SET_VALUE', 
  field: 'name', 
  value: 'Savon Lavande' // Typé !
});
```

### **Component Props**

```typescript
import type { BaseComponentProps, ClickableProps } from '@/types/context7-patterns';

// ✅ Props strictement typées
interface ProductCardProps extends BaseComponentProps {
  readonly product: Product; // readonly par défaut
  readonly onAddToCart: (productId: ProductId) => void;
  readonly variant?: 'compact' | 'detailed';
}

// ✅ Composant type-safe
export function ProductCard({ 
  product, 
  onAddToCart, 
  variant = 'compact',
  className,
  testId 
}: ProductCardProps): JSX.Element {
  const handleClick = useCallback(() => {
    onAddToCart(product.id); // Type safe
  }, [product.id, onAddToCart]);

  return (
    <article className={className} data-testid={testId}>
      <header>
        <h3>{product.name}</h3>
      </header>
      <section>
        <p>{product.description_short}</p>
        <data value={product.price}>
          {product.price} {product.currency}
        </data>
      </section>
      <footer>
        <button onClick={handleClick}>
          Ajouter au panier
        </button>
      </footer>
    </article>
  );
}
```

### **Async State**

```typescript
import type { UseAsyncResult } from '@/types/context7-patterns';
import { useState, useEffect } from 'react';

// ✅ Hook avec état async typé
function useProducts(): UseAsyncResult<Product[]> {
  const [data, setData] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const products = await fetchProducts();
      setData(products);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    isSuccess: data !== null,
    refetch
  };
}
```

---

## 🎨 HTML Sémantique Obligatoire

### **Structure Sémantique E-commerce**

```tsx
// ✅ CORRECT - Balises sémantiques
export function ProductPage() {
  return (
    <main>
      <header>
        <nav aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Accueil</a></li>
            <li><a href="/products">Produits</a></li>
            <li aria-current="page">Savon Lavande</li>
          </ol>
        </nav>
      </header>
      
      <article>
        <header>
          <h1>Savon Lavande Bio</h1>
        </header>
        
        <section aria-label="Images produit">
          <figure>
            <img src="savon.jpg" alt="Savon lavande artisanal" />
            <figcaption>Savon artisanal à la lavande d'Occitanie</figcaption>
          </figure>
        </section>
        
        <section aria-label="Informations produit">
          <dl>
            <dt>Prix</dt>
            <dd><data value="12.90">12,90 €</data></dd>
            
            <dt>Labels</dt>
            <dd>
              <ul>
                <li>Bio certifié</li>
                <li>Récolté à la main</li>
              </ul>
            </dd>
          </dl>
        </section>
        
        <section aria-label="Actions">
          <form method="post" action="/cart/add">
            <fieldset>
              <legend>Ajouter au panier</legend>
              
              <label for="quantity">Quantité :</label>
              <input type="number" id="quantity" name="quantity" min="1" max="10" defaultValue="1" />
              
              <button type="submit">
                Ajouter au panier
              </button>
            </fieldset>
          </form>
        </section>
      </article>
      
      <aside aria-label="Produits similaires">
        <h2>Produits similaires</h2>
        <ul>
          <li><ProductCard product={product1} /></li>
          <li><ProductCard product={product2} /></li>
        </ul>
      </aside>
    </main>
  );
}

// ❌ INTERDIT - Div soup
export function BadProductPage() {
  return (
    <div> {/* Should be <main> */}
      <div> {/* Should be <header> */}
        <div onClick={handleClick}> {/* Should be <button> */}
          Ajouter au panier
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 Configuration Développement

### **ESLint Rules**

```json
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "jsx-a11y/no-generic-click-events-on-div": "error",
    "jsx-a11y/click-events-have-key-events": "error"
  }
}
```

### **VSCode Settings**

```json
// .vscode/settings.json  
{
  "typescript.preferences.noSemicolons": "off",
  "typescript.preferences.quoteStyle": "single",
  "typescript.strict": true,
  "emmet.showSuggestionsAsSnippets": true,
  "emmet.triggerExpansionOnTab": true
}
```

---

## 🚀 Migration depuis Any

### **Étapes de Migration**

1. **Identifier tous les `any`**
   ```bash
   grep -r "any" src/ --include="*.ts" --include="*.tsx"
   ```

2. **Remplacer par `unknown`**
   ```typescript
   // Avant
   function process(data: any) { ... }
   
   // Après
   function process(data: unknown) {
     if (isProduct(data)) {
       // Process safely
     }
   }
   ```

3. **Ajouter type guards**
4. **Valider avec Zod**
5. **Branded types si nécessaire**

### **Checklist de Review**

- [ ] Aucun `any` dans le fichier
- [ ] Type guards pour `unknown`  
- [ ] Validation runtime si données externes
- [ ] Branded types pour domaine métier
- [ ] Balises sémantiques HTML
- [ ] Props en `readonly`
- [ ] Gestion d'erreur typée

---

## 📚 Références

- **Patterns Context7** : `/src/types/context7-patterns.ts`
- **Type Guards** : `/src/lib/type-guards.ts`  
- **Database Types** : `/src/types/database.ts`
- **Configuration TS** : `/tsconfig.json`

**Version :** 1.0.0  
**Dernière MAJ :** 2025-01-28  
**Statut :** ✅ PRODUCTION READY

---

**🎯 Objectif : 0% `any` dans HerbisVeritas V2**