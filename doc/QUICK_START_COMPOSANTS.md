# Guide Quick Start - Composants MVP HerbisVeritas

## 🚀 Démarrage Rapide

### Installation & Setup

```bash
# 1. Cloner et installer dépendances
git clone <repo>
cd inherbisveritas
npm install

# 2. Lancer tests composants MVP
npm run test:mvp        # 38/38 tests passants ✅

# 3. Mode développement avec TDD
npm run test:mvp:watch  # Watch mode pour TDD
npm run dev            # Development server
```

---

## 🛍️ Usage Composants Boutique

### ProductCard - Composant Principal

```tsx
import { ProductCard, useCart } from '@/components/modules/boutique'
import { Product } from '@/types/product'

function BoutiquePage() {
  const { addItem } = useCart()
  
  const product: Product = {
    id: '1',
    name: 'Huile lavande bio',
    price: 15.99,
    currency: 'EUR',
    stock: 10,
    unit: '10ml',
    labels: ['bio', 'origine_occitanie'],
    is_active: true,
    is_new: true
  }

  return (
    <ProductCard 
      product={product}
      onAddToCart={addItem}
      variant="default"
    />
  )
}
```

### ProductGrid - Collection

```tsx
import { ProductGrid } from '@/components/modules/boutique'

function CataloguePage() {
  return (
    <ProductGrid 
      products={products}
      onAddToCart={addToCart}
      columns={{ default: 1, sm: 2, md: 3, lg: 4 }}
      emptyMessage="Aucun produit trouvé"
    />
  )
}
```

### useCart Hook - Panier

```tsx
import { useCart } from '@/components/modules/boutique'

function CartComponent() {
  const { 
    items, 
    itemsCount, 
    total, 
    addItem, 
    removeItem, 
    clearCart 
  } = useCart()

  return (
    <div>
      <p>Panier: {itemsCount} articles - {total.toFixed(2)} €</p>
      <button onClick={clearCart}>Vider panier</button>
    </div>
  )
}
```

---

## 🎨 Composants UI shadcn/ui

### Button - 6 Variants

```tsx
import { Button } from '@/components/ui'

<Button variant="default">Ajouter au panier</Button>
<Button variant="secondary">Voir détails</Button>
<Button variant="outline">Favoris</Button>
<Button variant="ghost">Menu</Button>
<Button variant="destructive">Supprimer</Button>
<Button variant="link">En savoir plus</Button>
```

### Badge - Labels HerbisVeritas

```tsx
import { Badge } from '@/components/ui'

<Badge variant="bio">Bio</Badge>
<Badge variant="recolte">Récolté à la main</Badge>
<Badge variant="origine">Origine Occitanie</Badge>
<Badge variant="partenariat">Partenariat producteurs</Badge>
<Badge variant="rituel">Rituel bien-être</Badge>
<Badge variant="essence">Essence précieuse</Badge>
<Badge variant="rupture">Rupture de récolte</Badge>
```

### Card - Structure

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'

<Card>
  <CardHeader>
    <CardTitle>Huile lavande</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Huile essentielle bio...</p>
  </CardContent>
  <CardFooter>
    <Button>Ajouter au panier</Button>
  </CardFooter>
</Card>
```

---

## 🧪 TDD Workflow

### Écrire Tests d'Abord

```typescript
// tests/unit/components/modules/boutique/mon-composant.test.tsx
import { render, screen } from '@testing-library/react'
import { MonComposant } from '@/components/modules/boutique'

describe('MonComposant', () => {
  it('should render correctly', () => {
    // 🔴 RED - Test qui échoue d'abord
    render(<MonComposant />)
    expect(screen.getByText('Mon texte')).toBeInTheDocument()
  })
})
```

### Mode TDD Watch

```bash
npm run test:mvp:watch
# Jest va relancer les tests automatiquement
# Suivre cycle Red-Green-Refactor
```

### Coverage Check

```bash
npm run test:mvp
# Vérifier coverage > 80% pour nouveaux composants
```

---

## 📁 Structure Fichiers

### Créer Nouveau Composant

```bash
# 1. Créer structure
mkdir -p src/components/modules/boutique/components/mon-composant
cd src/components/modules/boutique/components/mon-composant

# 2. Fichiers standards
touch mon-composant.tsx  # Composant principal
touch index.ts          # Export
```

### Template Composant

```tsx
// mon-composant.tsx
'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface MonComposantProps {
  className?: string
  children?: React.ReactNode
}

export function MonComposant({ 
  className, 
  children 
}: MonComposantProps) {
  return (
    <Card className={cn('p-4', className)}>
      {children}
    </Card>
  )
}
```

### Export Index

```tsx
// index.ts
export { MonComposant, type MonComposantProps } from './mon-composant'
```

---

## 🏷️ Labels HerbisVeritas

### Types Disponibles

```typescript
export type ProductLabel = 
  | 'bio'                    // Vert - "Bio"
  | 'recolte_main'           // Ambre - "Récolté à la main"
  | 'origine_occitanie'      // Bleu - "Origine Occitanie" 
  | 'partenariat_producteurs' // Violet - "Partenariat producteurs"
  | 'rituel_bien_etre'       // Rose - "Rituel bien-être"
  | 'essence_precieuse'      // Indigo - "Essence précieuse"
  | 'rupture_recolte'        // Rouge - "Rupture de récolte"
```

### Usage dans Composants

```tsx
import { LABEL_DISPLAY, LABEL_BADGE_VARIANTS } from '@/types/product'

function AfficherLabels({ labels }: { labels: ProductLabel[] }) {
  return (
    <div className="flex gap-1">
      {labels.map(label => (
        <Badge 
          key={label}
          variant={LABEL_BADGE_VARIANTS[label] as any}
        >
          {LABEL_DISPLAY[label]}
        </Badge>
      ))}
    </div>
  )
}
```

---

## 🎯 Démo Interactive

### Lancer Démo Complète

```bash
# 1. Démarrer serveur dev
npm run dev

# 2. Créer page démo temporaire
# app/demo/page.tsx
import { BoutiqueDemo } from '@/components/demo/boutique-demo'

export default function DemoPage() {
  return <BoutiqueDemo />
}

# 3. Accéder à http://localhost:3000/demo
```

---

## 🔧 Debugging & Troubleshooting

### Tests Échouent

```bash
# Vérifier imports
npm run typecheck

# Relancer tests proprement
npm run test:mvp -- --clearCache
npm run test:mvp
```

### Composants Ne S'affichent Pas

```bash
# Vérifier structure exports
ls -la src/components/ui/
ls -la src/components/modules/boutique/

# Vérifier imports dans le composant
head -10 src/components/ui/button.tsx
```

### CSS Ne S'applique Pas

```bash
# Vérifier Tailwind fonctionne
npm run dev
# Inspecter éléments navigateur pour classes CSS
```

---

## 📚 Références Utiles

### Scripts NPM

```bash
npm run test:mvp          # Tests composants MVP
npm run test:mvp:watch    # Mode TDD watch
npm run dev               # Development server  
npm run build             # Build production
npm run typecheck         # Vérification TypeScript
```

### Fichiers Importants

- `src/components/ui/` - Composants base
- `src/components/modules/boutique/` - Logique métier
- `src/types/product.ts` - Types business
- `jest.config.mvp.js` - Config tests MVP

### Commandes Git

```bash
git status
git add src/components/
git commit -m "feat(components): nouveau composant MVP"
```

---

**🎉 Vous êtes prêt à développer avec les composants MVP HerbisVeritas !**

Pour questions : Consulter `doc/COMPONENTS_ARCHITECTURE_MVP_FINAL.md`