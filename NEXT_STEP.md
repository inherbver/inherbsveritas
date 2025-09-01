# Optimisation Bundle Size Next.js 15 - Patterns et Refactoring HerbisVeritas

## Objectif
Optimiser le bundle size de l'application HerbisVeritas pour atteindre Core Web Vitals < 2s grâce aux dynamic imports et au code splitting avancé de Next.js 15.

## 1. Dynamic Imports - Patterns Recommandés

### 1.1 Composants Lourds avec Lazy Loading

#### Pattern: Dynamic Import avec Loading State
```typescript
// src/components/features/product-catalog.tsx
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load du composant ProductGrid (lourd car inclut filtres, tri, pagination)
const ProductGrid = dynamic(
  () => import('./product-grid').then(mod => mod.ProductGrid),
  {
    loading: () => <ProductGridSkeleton />,
    ssr: true // Garder SSR pour SEO
  }
)

// Lazy load composant INCI uniquement côté client (pas critique SEO)
const InciAnalyzer = dynamic(
  () => import('./inci-analyzer').then(mod => mod.InciAnalyzer),
  {
    ssr: false, // Désactiver SSR car utilise window/localStorage
    loading: () => <Skeleton className="h-[400px]" />
  }
)
```

### 1.2 Import Conditionnel par Rôle Utilisateur

#### Pattern: Dynamic Import basé sur permissions
```typescript
// src/components/features/admin-panel.tsx
'use client'

import { useAuth } from '@/hooks/use-auth'
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

export function AdminDashboard() {
  const { user } = useAuth()
  
  // Import admin uniquement si nécessaire (économise ~200KB)
  const AdminPanel = user?.role === 'admin' 
    ? dynamic(() => import('./admin/panel'), {
        loading: () => <AdminPanelSkeleton />
      })
    : () => null

  return <AdminPanel />
}
```

### 1.3 Import à la Demande (Click/Interaction)

#### Pattern: Load on Interaction
```typescript
// src/components/features/cart.tsx
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'

export function CartWidget() {
  const [showCart, setShowCart] = useState(false)
  
  // Import panier uniquement au clic (économise ~150KB initial)
  const CartDrawer = showCart 
    ? dynamic(() => import('./cart-drawer'), {
        loading: () => <CartDrawerSkeleton />
      })
    : () => null

  return (
    <>
      <Button onClick={() => setShowCart(true)}>
        Panier ({itemsCount})
      </Button>
      {showCart && <CartDrawer onClose={() => setShowCart(false)} />}
    </>
  )
}
```

## 2. Code Splitting par Route

### 2.1 Structure Routes Optimisée

```typescript
// app/(shop)/products/page.tsx
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Critical: chargé immédiatement (SEO)
import { ProductList } from '@/components/features/product-list'

// Non-critical: lazy loaded
const Filters = dynamic(() => import('@/components/features/filters'))
const Newsletter = dynamic(() => import('@/components/features/newsletter'))

export default function ProductsPage() {
  return (
    <>
      {/* Critical path: rendu serveur */}
      <ProductList />
      
      {/* Non-critical: lazy loaded */}
      <Suspense fallback={<FiltersSkeleton />}>
        <Filters />
      </Suspense>
      
      <Suspense fallback={null}>
        <Newsletter />
      </Suspense>
    </>
  )
}
```

### 2.2 Parallel Routes pour Admin

```typescript
// app/(admin)/@dashboard/page.tsx
// Route parallèle - bundle séparé
export default function AdminDashboard() {
  // Code admin isolé du bundle principal
}

// app/(admin)/@analytics/page.tsx  
// Autre route parallèle - bundle indépendant
const Analytics = dynamic(() => import('@/components/admin/analytics'))
```

## 3. Optimisation Libraries Externes

### 3.1 Configuration next.config.js

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Optimise imports automatiquement pour ces packages
    optimizePackageImports: [
      'lucide-react',      // Icons (économise ~300KB)
      '@radix-ui/react-*', // UI primitives
      'date-fns',          // Date utils
      'zod',               // Validation
      'react-hook-form'    // Forms
    ]
  },
  
  // Bundle analyzer pour monitoring
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer 
            ? '../analyze/server.html' 
            : './analyze/client.html'
        })
      )
    }
    return config
  }
}

module.exports = nextConfig
```

### 3.2 Import Sélectif Icons

```typescript
// ❌ MAUVAIS: Import tout le package
import { ShoppingCart, User, Menu } from 'lucide-react'

// ✅ BON: Import sélectif (économise ~200KB)
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart'
import User from 'lucide-react/dist/esm/icons/user'
import Menu from 'lucide-react/dist/esm/icons/menu'
```

## 4. Lazy Loading Composants Interface

### 4.1 Charts et Visualisations

```typescript
// src/components/admin/analytics.tsx
import dynamic from 'next/dynamic'

// Recharts: ~100KB - lazy load
const AreaChart = dynamic(
  () => import('recharts').then(mod => mod.AreaChart),
  { ssr: false }
)

const BarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { ssr: false }
)

// Usage avec fallback élégant
export function SalesAnalytics() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <AreaChart data={salesData} />
    </Suspense>
  )
}
```

### 4.2 Éditeurs Riches

```typescript
// src/components/cms/editor.tsx
import dynamic from 'next/dynamic'

// TipTap Editor: ~300KB - lazy load obligatoire
const RichTextEditor = dynamic(
  () => import('./rich-text-editor'),
  {
    ssr: false,
    loading: () => <EditorPlaceholder />
  }
)

// MDX Preview: ~150KB
const MDXPreview = dynamic(
  () => import('./mdx-preview'),
  { ssr: false }
)
```

## 5. Monitoring et Métriques

### 5.1 Web Vitals Tracking

```typescript
// app/_components/web-vitals.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Objectifs HerbisVeritas
    const targets = {
      FCP: 1800,  // First Contentful Paint < 1.8s
      LCP: 2500,  // Largest Contentful Paint < 2.5s
      FID: 100,   // First Input Delay < 100ms
      CLS: 0.1,   // Cumulative Layout Shift < 0.1
      TTFB: 600   // Time to First Byte < 600ms
    }

    const isGood = metric.value <= (targets[metric.name] || Infinity)
    
    // Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_status: isGood ? 'good' : 'needs_improvement',
        metric_delta: metric.delta
      })
    }

    // Console warning si dégradation
    if (!isGood) {
      console.warn(`⚠️ ${metric.name}: ${metric.value}ms (target: ${targets[metric.name]}ms)`)
    }
  })

  return null
}
```

### 5.2 Bundle Analysis Script

```json
// package.json
{
  "scripts": {
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "bundle:check": "npm run build:analyze && node scripts/check-bundle-size.js"
  }
}
```

```javascript
// scripts/check-bundle-size.js
const fs = require('fs')
const path = require('path')

const MAX_SIZES = {
  'First Load JS': 85,    // 85KB max par page
  'Total Bundle': 300,     // 300KB total
  'Largest Page': 100      // 100KB max single page
}

// Parse .next/build-manifest.json
const buildManifest = JSON.parse(
  fs.readFileSync('.next/build-manifest.json', 'utf8')
)

// Vérifier tailles et alerter si dépassement
Object.entries(buildManifest.pages).forEach(([page, assets]) => {
  const size = calculateSize(assets)
  if (size > MAX_SIZES['Largest Page']) {
    console.error(`❌ Page ${page}: ${size}KB (max: ${MAX_SIZES['Largest Page']}KB)`)
    process.exit(1)
  }
})

console.log('✅ Bundle sizes OK!')
```

## 6. Métriques Attendues

### Avant Optimisation (Estimation)
- First Load JS: ~250KB
- LCP: 3.5s
- FCP: 2.2s
- Bundle total: 850KB

### Après Optimisation (Objectifs)
- First Load JS: < 85KB (-66%)
- LCP: < 2.0s (-43%)
- FCP: < 1.5s (-32%)
- Bundle total: < 400KB (-53%)

### Gains par Technique
1. **Dynamic Imports**: -200KB (admin, charts, editors)
2. **Code Splitting**: -150KB (routes parallèles)
3. **Tree Shaking**: -100KB (icons, utils)
4. **Lazy Loading**: -120KB (cart, INCI, filters)
5. **SSR Sélectif**: -80KB (client-only components)

## 7. Checklist Implémentation

- [ ] Installer @next/bundle-analyzer
- [ ] Configurer optimizePackageImports dans next.config.js
- [ ] Refactorer imports icons vers imports sélectifs
- [ ] Implémenter dynamic imports pour composants admin
- [ ] Lazy load cart et INCI analyzer
- [ ] Créer skeletons pour tous les lazy loaded components
- [ ] Setup Web Vitals tracking
- [ ] Configurer bundle size monitoring CI/CD
- [ ] Tester sur Lighthouse (objectif: score > 95)
- [ ] Documenter patterns dans guide développeur

## 8. Exemple Refactoring Complet

### Avant (Composant Categories)
```typescript
// ❌ 180KB chargés immédiatement
import { CategoryGrid } from './category-grid'
import { CategoryFilters } from './category-filters'
import { CategoryChart } from './category-chart'
import { Search, Filter, ChevronDown } from 'lucide-react'

export function Categories() {
  return (
    <div>
      <CategoryFilters />
      <CategoryGrid />
      <CategoryChart />
    </div>
  )
}
```

### Après (Optimisé)
```typescript
// ✅ 45KB initial, reste en lazy load
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Icons sélectifs
import Search from 'lucide-react/dist/esm/icons/search'

// Critical: SEO important
import { CategoryGrid } from './category-grid'

// Non-critical: lazy loaded
const CategoryFilters = dynamic(() => import('./category-filters'))
const CategoryChart = dynamic(
  () => import('./category-chart'),
  { ssr: false } // Client-only
)

export function Categories() {
  return (
    <div>
      <Suspense fallback={<FiltersSkeleton />}>
        <CategoryFilters />
      </Suspense>
      
      <CategoryGrid /> {/* Rendu immédiat pour SEO */}
      
      <Suspense fallback={<ChartSkeleton />}>
        <CategoryChart />
      </Suspense>
    </div>
  )
}
```

## Conclusion

Cette stratégie d'optimisation permettra à HerbisVeritas d'atteindre les objectifs Core Web Vitals < 2s tout en maintenant une excellente expérience utilisateur. Les gains estimés de 50-60% sur le bundle size initial amélioreront significativement les performances, particulièrement sur mobile et connexions lentes.