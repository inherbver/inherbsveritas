# Guide d'Architecture des Composants - HerbisVeritas V2

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture actuelle vs optimisée](#architecture-actuelle-vs-optimisée)
3. [Structure des dossiers](#structure-des-dossiers)
4. [Principes fondamentaux](#principes-fondamentaux)
5. [Patterns de développement](#patterns-de-développement)
6. [Guide de migration](#guide-de-migration)
7. [Standards de qualité](#standards-de-qualité)
8. [Exemples pratiques](#exemples-pratiques)
9. [Outils et configuration](#outils-et-configuration)
10. [Bonnes pratiques](#bonnes-pratiques)

---

## Vue d'ensemble

Cette architecture de composants optimisée vise à transformer le code base existant d'HerbisVeritas en une architecture moderne, maintenable et évolutive. Elle s'appuie sur les principes de composition, séparation des responsabilités et réutilisabilité.

### Objectifs principaux

- **Maintenabilité** : Code plus facile à comprendre et modifier
- **Réutilisabilité** : Composants modulaires et composables
- **Testabilité** : Architecture favorable aux tests automatisés
- **Performance** : Optimisations React intégrées
- **Évolutivité** : Structure permettant l'ajout de nouvelles fonctionnalités

---

## Architecture actuelle vs optimisée

### 🔴 Problèmes identifiés dans l'architecture actuelle

```
src/components/
├── auth/              # ❌ Mélange logique/UI
├── common/            # ❌ Fourre-tout
├── domain/            # ❌ Concept flou
├── features/          # ❌ Structure plate
├── forms/             # ✅ OK mais incomplet
├── layout/            # ✅ OK
└── ui/                # ✅ OK mais peut être amélioré
```

**Issues critiques :**
- Composants de 300+ lignes (ex: ProductCard)
- Mélange UI, logique business et state management
- Duplication de code (multiples composants d'upload)
- Nomenclature incohérente (français/anglais)
- Absence de tests (1 seul fichier de test trouvé)
- Couplage fort entre composants

### 🟢 Architecture optimisée proposée

```
src/components/
├── primitives/        # Composants UI de base
├── composite/         # Composants métier réutilisables
├── layout/           # Layouts et structures
├── forms/            # Formulaires spécialisés
├── modules/          # Modules fonctionnels par domaine
└── providers/        # Context providers
```

---

## Structure des dossiers

### Primitives (ex-ui/)

Composants UI atomiques sans logique business.

```
src/components/primitives/
├── buttons/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   ├── Button.stories.tsx
│   ├── IconButton.tsx
│   └── index.ts
├── inputs/
│   ├── Input.tsx
│   ├── TextArea.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   └── index.ts
├── feedback/
│   ├── Alert.tsx
│   ├── Toast.tsx
│   ├── Loading.tsx
│   ├── Skeleton.tsx
│   └── index.ts
├── layout/
│   ├── Card.tsx
│   ├── Container.tsx
│   ├── Grid.tsx
│   ├── Stack.tsx
│   └── index.ts
├── navigation/
│   ├── Tabs.tsx
│   ├── Breadcrumb.tsx
│   ├── Pagination.tsx
│   └── index.ts
└── overlays/
    ├── Dialog.tsx
    ├── Drawer.tsx
    ├── Popover.tsx
    ├── Tooltip.tsx
    └── index.ts
```

### Composite

Composants métier réutilisables à travers l'application.

```
src/components/composite/
├── data-display/
│   ├── DataTable/
│   │   ├── DataTable.tsx
│   │   ├── DataTableHeader.tsx
│   │   ├── DataTableRow.tsx
│   │   ├── DataTablePagination.tsx
│   │   ├── DataTable.test.tsx
│   │   ├── DataTable.stories.tsx
│   │   └── index.ts
│   ├── ImageGallery/
│   ├── StatCard/
│   └── MetricDisplay/
├── inputs/
│   ├── SearchBox/
│   ├── ImageUpload/
│   ├── DateRangePicker/
│   └── TagInput/
├── navigation/
│   ├── Sidebar/
│   ├── TopBar/
│   ├── BreadcrumbNav/
│   └── PaginationControls/
└── content/
    ├── ArticlePreview/
    ├── ProductPreview/
    ├── UserProfile/
    └── CommentThread/
```

### Modules

Modules fonctionnels organisés par domaine métier.

```
src/components/modules/
├── boutique/
│   ├── components/
│   │   ├── ProductCard/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductImage.tsx
│   │   │   ├── ProductInfo.tsx
│   │   │   ├── ProductActions.tsx
│   │   │   ├── ProductCard.test.tsx
│   │   │   ├── ProductCard.stories.tsx
│   │   │   └── index.ts
│   │   ├── CartSheet/
│   │   ├── ProductGrid/
│   │   ├── CategoryFilter/
│   │   └── CheckoutFlow/
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useProducts.ts
│   │   ├── useCheckout.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── productApi.ts
│   │   ├── cartApi.ts
│   │   └── index.ts
│   └── types/
│       ├── product.ts
│       ├── cart.ts
│       └── index.ts
├── magazine/
│   ├── components/
│   │   ├── ArticleCard/
│   │   ├── ArticleEditor/
│   │   ├── TagManager/
│   │   └── CategorySelector/
│   ├── hooks/
│   ├── services/
│   └── types/
├── auth/
│   ├── components/
│   │   ├── LoginForm/
│   │   ├── RegisterForm/
│   │   ├── PasswordReset/
│   │   └── UserMenu/
│   ├── hooks/
│   ├── services/
│   └── types/
└── admin/
    ├── components/
    │   ├── Dashboard/
    │   ├── UserManagement/
    │   ├── ContentManagement/
    │   └── Analytics/
    ├── hooks/
    ├── services/
    └── types/
```

---

## Principes fondamentaux

### 1. Single Responsibility Principle

Chaque composant a une responsabilité unique et bien définie.

```tsx
// ❌ Composant qui fait trop de choses
function ProductCard({ product, onAddToCart, onFavorite, showModal }) {
  // 300+ lignes de code...
  // Gestion de l'état, UI, logique business, etc.
}

// ✅ Composants avec responsabilités séparées
function ProductImage({ src, alt, badges }) { /* ... */ }
function ProductInfo({ title, description, price }) { /* ... */ }
function ProductActions({ onAddToCart, onFavorite }) { /* ... */ }

function ProductCard({ product, onAddToCart, onFavorite }) {
  return (
    <Card>
      <ProductImage {...product.image} />
      <ProductInfo {...product.info} />
      <ProductActions onAddToCart={() => onAddToCart(product)} />
    </Card>
  )
}
```

### 2. Composition over Configuration

Favoriser la composition de composants plutôt que les props de configuration complexes.

```tsx
// ❌ Configuration complexe
<ProductCard 
  variant="featured" 
  showDescription={true}
  showPrice={true}
  showActions={true}
  actionType="button"
  size="large"
/>

// ✅ Composition flexible
<ProductCard variant="featured">
  <ProductCard.Image />
  <ProductCard.Content>
    <ProductCard.Title />
    <ProductCard.Description />
    <ProductCard.Price />
  </ProductCard.Content>
  <ProductCard.Actions>
    <ProductCard.AddToCartButton />
    <ProductCard.FavoriteButton />
  </ProductCard.Actions>
</ProductCard>
```

### 3. Inversion of Control

Les composants reçoivent leurs dépendances plutôt que de les créer.

```tsx
// ❌ Dépendance directe
function ProductCard({ productId }) {
  const [product, setProduct] = useState(null)
  
  useEffect(() => {
    // Appel API directement dans le composant
    fetchProduct(productId).then(setProduct)
  }, [productId])
  
  return <div>{/* ... */}</div>
}

// ✅ Inversion of control
function ProductCard({ product, onAddToCart }) {
  return <div>{/* ... */}</div>
}

// Le parent gère les données
function ProductGrid() {
  const { products, addToCart } = useProducts()
  
  return (
    <div>
      {products.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          onAddToCart={addToCart}
        />
      ))}
    </div>
  )
}
```

---

## Patterns de développement

### 1. Compound Components

Pour les composants complexes avec plusieurs parties interdépendantes.

```tsx
// ProductCard avec Compound Components
const ProductCardContext = createContext()

export function ProductCard({ children, product }) {
  const contextValue = { product, /* autres valeurs */ }
  
  return (
    <ProductCardContext.Provider value={contextValue}>
      <Card className="product-card">
        {children}
      </Card>
    </ProductCardContext.Provider>
  )
}

ProductCard.Image = function ProductImage({ className, ...props }) {
  const { product } = useContext(ProductCardContext)
  return (
    <img 
      src={product.image}
      alt={product.title}
      className={cn("product-image", className)}
      {...props}
    />
  )
}

ProductCard.Title = function ProductTitle({ className, ...props }) {
  const { product } = useContext(ProductCardContext)
  return (
    <h3 className={cn("product-title", className)} {...props}>
      {product.title}
    </h3>
  )
}

ProductCard.Price = function ProductPrice({ className, ...props }) {
  const { product } = useContext(ProductCardContext)
  return (
    <span className={cn("product-price", className)} {...props}>
      {formatPrice(product.price)}
    </span>
  )
}

// Usage
<ProductCard product={product}>
  <ProductCard.Image />
  <div className="content">
    <ProductCard.Title />
    <ProductCard.Price />
  </div>
</ProductCard>
```

### 2. Render Props

Pour partager la logique entre composants.

```tsx
// Hook personnalisé pour la logique
function useProductCard(product) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  
  const addToCart = async () => {
    setIsLoading(true)
    try {
      await cartApi.addItem(product.id)
      toast.success('Produit ajouté au panier')
    } catch (error) {
      toast.error('Erreur lors de l\'ajout')
    } finally {
      setIsLoading(false)
    }
  }
  
  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite)
    await favoritesApi.toggle(product.id)
  }
  
  return {
    isLoading,
    isFavorite,
    addToCart,
    toggleFavorite
  }
}

// Composant avec render prop
function ProductCardLogic({ product, children }) {
  const logic = useProductCard(product)
  return children(logic)
}

// Usage
<ProductCardLogic product={product}>
  {({ isLoading, addToCart, isFavorite, toggleFavorite }) => (
    <Card>
      <img src={product.image} alt={product.title} />
      <h3>{product.title}</h3>
      <p>{formatPrice(product.price)}</p>
      <Button 
        onClick={addToCart} 
        disabled={isLoading}
      >
        {isLoading ? 'Ajout...' : 'Ajouter au panier'}
      </Button>
      <Button
        variant="ghost"
        onClick={toggleFavorite}
      >
        {isFavorite ? '❤️' : '🤍'}
      </Button>
    </Card>
  )}
</ProductCardLogic>
```

### 3. Higher-Order Components (HOC)

Pour ajouter des fonctionnalités communes.

```tsx
// HOC pour la gestion des erreurs
function withErrorBoundary(Component) {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary
        fallback={<div>Erreur lors du chargement du composant</div>}
      >
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// HOC pour le loading
function withLoading(Component) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <Skeleton className="h-64 w-full" />
    }
    return <Component {...props} />
  }
}

// Usage
const ProductCard = withErrorBoundary(
  withLoading(BaseProductCard)
)
```

### 4. Custom Hooks

Pour extraire et réutiliser la logique.

```tsx
// Hook pour la gestion du panier
function useCart() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  const addItem = async (product, quantity = 1) => {
    setIsLoading(true)
    try {
      const response = await cartApi.addItem(product.id, quantity)
      setItems(response.items)
      toast.success('Produit ajouté au panier')
    } catch (error) {
      toast.error('Erreur lors de l\'ajout')
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  const removeItem = async (itemId) => {
    try {
      const response = await cartApi.removeItem(itemId)
      setItems(response.items)
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }
  
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  
  return {
    items,
    total,
    isLoading,
    addItem,
    removeItem
  }
}

// Hook pour les produits
function useProducts(filters = {}) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true)
        const response = await productApi.getProducts(filters)
        setProducts(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProducts()
  }, [filters])
  
  return { products, isLoading, error }
}

// Usage dans les composants
function ProductGrid({ filters }) {
  const { products, isLoading, error } = useProducts(filters)
  const { addItem } = useCart()
  
  if (error) return <Alert variant="error">{error}</Alert>
  if (isLoading) return <ProductGridSkeleton />
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => addItem(product)}
        />
      ))}
    </div>
  )
}
```

---

## Guide de migration

### Phase 1 : Restructuration (Semaines 1-2)

1. **Créer la nouvelle structure de dossiers**
2. **Migrer les composants UI de base** (`src/components/ui` → `src/components/primitives`)
3. **Identifier les composants à refactoriser**

### Phase 2 : Refactorisation des composants critiques (Semaines 3-4)

1. **ProductCard** : Diviser en composants atomiques
2. **Forms** : Standardiser avec react-hook-form
3. **Admin components** : Moduler par domaine

### Phase 3 : Tests et optimisations (Semaines 5-6)

1. **Ajouter les tests unitaires**
2. **Configurer Storybook**
3. **Optimiser les performances**

### Exemple de migration - ProductCard

#### Avant
```tsx
// Un seul fichier de 300+ lignes
export function ProductCard({ id, title, price, imageSrc, ... }) {
  const [isLoading, setIsLoading] = useState(false)
  // ... logique complexe ...
  return (
    <div>
      {/* 300+ lignes de JSX */}
    </div>
  )
}
```

#### Après
```tsx
// ProductCard/index.ts
export { ProductCard } from './ProductCard'
export { ProductImage } from './ProductImage'
export { ProductInfo } from './ProductInfo'
export { ProductActions } from './ProductActions'

// ProductCard/ProductCard.tsx
export function ProductCard({ product, onAddToCart }) {
  return (
    <Card>
      <ProductImage product={product} />
      <ProductInfo product={product} />
      <ProductActions 
        product={product}
        onAddToCart={onAddToCart}
      />
    </Card>
  )
}

// ProductCard/ProductImage.tsx
export function ProductImage({ product }) {
  return (
    <div className="relative">
      <img 
        src={product.image}
        alt={product.title}
        className="w-full h-48 object-cover"
      />
      {product.isNew && (
        <Badge className="absolute top-2 left-2">
          Nouveau
        </Badge>
      )}
    </div>
  )
}

// ProductCard/ProductInfo.tsx
export function ProductInfo({ product }) {
  return (
    <div className="p-4">
      <h3 className="font-semibold">{product.title}</h3>
      <p className="text-sm text-gray-600">{product.description}</p>
      <span className="text-lg font-bold">{formatPrice(product.price)}</span>
    </div>
  )
}

// ProductCard/ProductActions.tsx
export function ProductActions({ product, onAddToCart }) {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      await onAddToCart(product)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="p-4 pt-0">
      <Button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Ajout...' : 'Ajouter au panier'}
      </Button>
    </div>
  )
}
```

---

## Standards de qualité

### Tests

Chaque composant doit avoir des tests associés.

```tsx
// ProductCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductCard } from './ProductCard'

const mockProduct = {
  id: '1',
  title: 'Huile essentielle de lavande',
  price: 15.99,
  image: '/images/lavande.jpg',
  description: 'Huile essentielle bio'
}

describe('ProductCard', () => {
  it('should render product information', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText(mockProduct.title)).toBeInTheDocument()
    expect(screen.getByText('15,99 €')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('alt', mockProduct.title)
  })
  
  it('should call onAddToCart when button is clicked', async () => {
    const onAddToCart = jest.fn()
    
    render(
      <ProductCard 
        product={mockProduct}
        onAddToCart={onAddToCart}
      />
    )
    
    fireEvent.click(screen.getByText('Ajouter au panier'))
    
    await waitFor(() => {
      expect(onAddToCart).toHaveBeenCalledWith(mockProduct)
    })
  })
  
  it('should show loading state during add to cart', async () => {
    const onAddToCart = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(
      <ProductCard 
        product={mockProduct}
        onAddToCart={onAddToCart}
      />
    )
    
    fireEvent.click(screen.getByText('Ajouter au panier'))
    
    expect(screen.getByText('Ajout...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('Ajouter au panier')).toBeInTheDocument()
    })
  })
})
```

### Storybook

Documentation interactive des composants.

```tsx
// ProductCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ProductCard } from './ProductCard'

const meta = {
  title: 'Modules/Boutique/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProductCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    product: {
      id: '1',
      title: 'Huile essentielle de lavande',
      price: 15.99,
      image: '/images/lavande.jpg',
      description: 'Huile essentielle bio de lavande vraie, distillée en Provence.',
      isNew: false,
      isOnSale: false,
    }
  }
}

export const NewProduct: Story = {
  args: {
    product: {
      ...Default.args.product,
      isNew: true,
    }
  }
}

export const OnSale: Story = {
  args: {
    product: {
      ...Default.args.product,
      isOnSale: true,
      originalPrice: 19.99,
    }
  }
}

export const OutOfStock: Story = {
  args: {
    product: {
      ...Default.args.product,
      outOfStock: true,
    }
  }
}

export const Loading: Story = {
  args: {
    product: Default.args.product,
  },
  parameters: {
    mockData: {
      isLoading: true,
    }
  }
}
```

### TypeScript

Typage strict pour tous les composants.

```tsx
// types/product.ts
export interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  image: string
  imageAlt?: string
  category: string
  tags: string[]
  isNew?: boolean
  isOnSale?: boolean
  outOfStock?: boolean
  stock?: number
  weight?: number
  volume?: number
  unit?: 'ml' | 'g' | 'piece'
}

export interface ProductCardProps {
  /** Product data */
  product: Product
  /** Callback when adding to cart */
  onAddToCart?: (product: Product) => Promise<void>
  /** Callback when toggling favorite */
  onToggleFavorite?: (product: Product) => void
  /** Visual variant */
  variant?: 'default' | 'compact' | 'featured'
  /** Custom className */
  className?: string
  /** Whether the card is loading */
  isLoading?: boolean
}
```

### ESLint Rules

Configuration ESLint spécifique aux composants.

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    // Composants
    "react/prop-types": "off", // On utilise TypeScript
    "react/display-name": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    
    // TypeScript
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-const": "error",
    
    // Imports
    "import/order": ["error", {
      "groups": [
        "builtin",
        "external", 
        "internal",
        "parent",
        "sibling",
        "index"
      ],
      "newlines-between": "always"
    }],
    
    // Accessibility
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/click-events-have-key-events": "warn"
  }
}
```

---

## Exemples pratiques

### Exemple 1 : Module Boutique complet

```tsx
// modules/boutique/components/ProductGrid/ProductGrid.tsx
import { ProductCard } from '../ProductCard'
import { ProductGridSkeleton } from './ProductGridSkeleton'
import { useProducts } from '../../hooks/useProducts'
import { useCart } from '../../hooks/useCart'

interface ProductGridProps {
  category?: string
  filters?: ProductFilters
  limit?: number
}

export function ProductGrid({ category, filters, limit }: ProductGridProps) {
  const { products, isLoading, error } = useProducts({ category, filters, limit })
  const { addItem } = useCart()
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  if (isLoading) {
    return <ProductGridSkeleton />
  }
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">Aucun produit trouvé</h3>
        <p className="mt-2 text-gray-600">
          Essayez de modifier vos critères de recherche.
        </p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={addItem}
        />
      ))}
    </div>
  )
}

// modules/boutique/hooks/useProducts.ts
import { useState, useEffect } from 'react'
import { productApi } from '../services/productApi'
import type { Product, ProductFilters } from '../types'

interface UseProductsOptions {
  category?: string
  filters?: ProductFilters
  limit?: number
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await productApi.getProducts(options)
        setProducts(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProducts()
  }, [options.category, options.filters, options.limit])
  
  return {
    products,
    isLoading,
    error,
    refetch: () => fetchProducts()
  }
}

// modules/boutique/services/productApi.ts
import { apiClient } from '@/lib/api'
import type { Product, ProductFilters } from '../types'

interface GetProductsOptions {
  category?: string
  filters?: ProductFilters
  limit?: number
  page?: number
}

interface GetProductsResponse {
  data: Product[]
  total: number
  page: number
  pageSize: number
}

export const productApi = {
  async getProducts(options: GetProductsOptions = {}): Promise<GetProductsResponse> {
    const params = new URLSearchParams()
    
    if (options.category) params.append('category', options.category)
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.page) params.append('page', options.page.toString())
    
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(`filter_${key}`, value.toString())
        }
      })
    }
    
    const response = await apiClient.get(`/api/products?${params}`)
    return response.data
  },
  
  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get(`/api/products/${id}`)
    return response.data
  },
  
  async searchProducts(query: string): Promise<Product[]> {
    const response = await apiClient.get(`/api/products/search?q=${encodeURIComponent(query)}`)
    return response.data
  }
}
```

### Exemple 2 : Formulaire avec validation

```tsx
// forms/ProductForm/ProductForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductFormData } from './productSchema'
import { ProductFormFields } from './ProductFormFields'
import { ProductFormActions } from './ProductFormActions'
import { Form } from '@/components/primitives/form'

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  onSubmit: (data: ProductFormData) => Promise<void>
  isLoading?: boolean
}

export function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: '',
      tags: [],
      ...initialData
    }
  })
  
  const handleSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Form submission error:', error)
    }
  }
  
  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <ProductFormFields />
        <ProductFormActions isLoading={isLoading} />
      </form>
    </Form>
  )
}

// forms/ProductForm/productSchema.ts
import { z } from 'zod'

export const productSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  price: z.number().min(0.01, 'Le prix doit être supérieur à 0'),
  category: z.string().min(1, 'Une catégorie doit être sélectionnée'),
  tags: z.array(z.string()),
  image: z.string().url('L\'URL de l\'image doit être valide').optional(),
  weight: z.number().positive().optional(),
  volume: z.number().positive().optional(),
  unit: z.enum(['ml', 'g', 'piece']).optional(),
})

export type ProductFormData = z.infer<typeof productSchema>

// forms/ProductForm/ProductFormFields.tsx
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/primitives/inputs'
import { TextArea } from '@/components/primitives/inputs'
import { Select } from '@/components/primitives/inputs'
import { ImageUpload } from '@/components/composite/inputs'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/primitives/form'
import type { ProductFormData } from './productSchema'

export function ProductFormFields() {
  const { control } = useFormContext<ProductFormData>()
  
  return (
    <>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titre du produit *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: Huile essentielle de lavande"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description *</FormLabel>
            <FormControl>
              <TextArea 
                placeholder="Décrivez votre produit..."
                rows={4}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix (€) *</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="15.99"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie *</FormLabel>
              <FormControl>
                <Select 
                  options={[
                    { value: 'huiles-essentielles', label: 'Huiles essentielles' },
                    { value: 'hydrolats', label: 'Hydrolats' },
                    { value: 'cosmetiques', label: 'Cosmétiques' },
                  ]}
                  placeholder="Sélectionnez une catégorie"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Image du produit</FormLabel>
            <FormControl>
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                context="product"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
```

---

## Outils et configuration

### Package.json - Dépendances

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "next": "^14.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "framer-motion": "^10.0.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "zod": "^3.0.0",
    "zustand": "^4.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@storybook/react": "^7.0.0",
    "@storybook/addon-essentials": "^7.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest --watch",
    "test:ci": "jest --coverage",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx}',
    '!src/components/**/*.stories.{ts,tsx}',
    '!src/components/**/*.d.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
}

module.exports = createJestConfig(customJestConfig)

// jest.setup.js
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => {
    return React.createElement('img', { src, alt, ...props })
  },
}))
```

### Storybook Configuration

```javascript
// .storybook/main.js
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-design-tokens',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  features: {
    experimentalRSC: true,
  },
}

// .storybook/preview.js
import '../src/app/globals.css'
import { withThemeByDataAttribute } from '@storybook/addon-styling'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  nextjs: {
    appDirectory: true,
  },
}

export const decorators = [
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 'data-theme',
  }),
]
```

### Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // ... autres couleurs
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}
```

---

## Bonnes pratiques

### 1. Nomenclature

- **Composants** : PascalCase (`ProductCard`, `UserProfile`)
- **Fichiers** : PascalCase pour les composants (`ProductCard.tsx`)
- **Dossiers** : kebab-case (`product-card/`, `user-profile/`)
- **Props** : camelCase (`onAddToCart`, `isLoading`)
- **Hooks** : `use` prefix (`useCart`, `useProducts`)

### 2. Structure des fichiers

```
ComponentName/
├── ComponentName.tsx       # Composant principal
├── ComponentName.test.tsx  # Tests unitaires
├── ComponentName.stories.tsx # Stories Storybook
├── ComponentSubpart.tsx    # Sous-composants si nécessaire
├── hooks/                  # Hooks spécifiques
├── types.ts               # Types TypeScript
└── index.ts               # Export principal
```

### 3. Props et interfaces

```tsx
// ✅ Interface explicite
interface ProductCardProps {
  /** Product data from API */
  product: Product
  /** Callback when adding to cart */
  onAddToCart?: (product: Product) => Promise<void>
  /** Visual variant */
  variant?: 'default' | 'compact' | 'featured'
  /** Custom className for styling */
  className?: string
  /** Loading state */
  isLoading?: boolean
  /** Disabled state */
  disabled?: boolean
}

// ✅ Props destructurées avec valeurs par défaut
export function ProductCard({
  product,
  onAddToCart,
  variant = 'default',
  className,
  isLoading = false,
  disabled = false,
}: ProductCardProps) {
  // ...
}
```

### 4. Gestion d'état

```tsx
// ✅ État local pour UI uniquement
function ProductCard({ product, onAddToCart }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // ✅ Logique métier dans des hooks personnalisés
  const { addToCart, isLoading } = useCart()
  
  // ✅ Actions simples
  const handleAddToCart = () => {
    addToCart(product)
    onAddToCart?.(product)
  }
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ... */}
    </div>
  )
}
```

### 5. Performance

```tsx
// ✅ Mémoisation appropriée
const ProductCard = memo(function ProductCard({ product, onAddToCart }) {
  // ✅ Callbacks mémorisés
  const handleAddToCart = useCallback(() => {
    onAddToCart(product)
  }, [product, onAddToCart])
  
  // ✅ Valeurs dérivées mémorisées
  const formattedPrice = useMemo(() => {
    return formatPrice(product.price, product.currency)
  }, [product.price, product.currency])
  
  return (
    <div>
      <span>{formattedPrice}</span>
      <button onClick={handleAddToCart}>
        Ajouter au panier
      </button>
    </div>
  )
})
```

### 6. Accessibilité

```tsx
// ✅ Attributs ARIA appropriés
export function ProductCard({ product, onAddToCart }) {
  return (
    <article 
      role="article"
      aria-labelledby={`product-${product.id}-title`}
      className="product-card"
    >
      <img 
        src={product.image}
        alt={product.imageAlt || product.title}
        loading="lazy"
      />
      
      <h3 
        id={`product-${product.id}-title`}
        className="product-title"
      >
        {product.title}
      </h3>
      
      <button
        onClick={() => onAddToCart(product)}
        aria-label={`Ajouter ${product.title} au panier`}
        disabled={product.outOfStock}
        aria-disabled={product.outOfStock}
      >
        {product.outOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
      </button>
    </article>
  )
}
```

### 7. Gestion d'erreurs

```tsx
// ✅ Error boundaries pour les composants critiques
function ProductGrid() {
  return (
    <ErrorBoundary
      fallback={<ProductGridError />}
      onError={(error) => {
        // Log to monitoring service
        console.error('ProductGrid error:', error)
      }}
    >
      <ProductGridContent />
    </ErrorBoundary>
  )
}

// ✅ États d'erreur dans les hooks
function useProducts() {
  const [error, setError] = useState<string | null>(null)
  
  const fetchProducts = async () => {
    try {
      setError(null)
      const products = await productApi.getProducts()
      return products
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      throw err
    }
  }
  
  return { error, fetchProducts }
}
```

---

## Conclusion

Cette architecture de composants optimisée pour HerbisVeritas V2 offre :

- **Maintenabilité** accrue grâce à la séparation claire des responsabilités
- **Réutilisabilité** maximale avec des composants atomiques et composables  
- **Testabilité** intégrée avec Jest et Storybook
- **Performance** optimisée avec les best practices React
- **Évolutivité** garantie par l'architecture modulaire

La migration peut être effectuée progressivement, en commençant par les composants les plus critiques et en s'étendant graduellement à l'ensemble de l'application.

Cette approche moderne garantit une base solide pour le développement futur et facilite la collaboration entre développeurs grâce à des conventions claires et une documentation exhaustive.