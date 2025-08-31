# Architecture Navigation MVP - HerbisVeritas V2

## 📋 Vue d'Ensemble

Cette documentation définit l'architecture navigation **alignée sur le MVP à 13 tables** et le plan de développement validé pour HerbisVeritas V2.

**Architecture Next.js 15 App Router** avec routes optimisées pour SEO et performance.

---

## 🗂️ Structure Routes MVP

### Navigation Header Principale

```
├── / (homepage - featured_items hero)
├── /boutique (catalogue produits)
├── /magazine (articles blog)
├── /nous-rencontrer (partenaires points de vente)
├── /nos-racines (histoire & valeurs)
└── /admin (tableau de bord admin - role admin/dev uniquement)
```

### Routes E-commerce (8 tables core)

**Tables impliquées :** `products`, `categories`, `carts`, `cart_items`, `orders`, `order_items`, `users`, `addresses`

```
/boutique/
├── categories/
│   ├── [slug] (liste produits par catégorie)
│   └── page.tsx (toutes catégories)
├── produits/
│   └── [slug] (détail produit)
├── recherche (filtres + search)
└── page.tsx (catalogue général)

/panier → /commande/
├── livraison (sélection adresse)
├── paiement (Stripe checkout)
├── confirmation (succès)
└── echec (erreur paiement)
```

### Routes Content (5 tables marketing)

**Tables impliquées :** `articles`, `partners`, `next_events`, `newsletter_subscribers`, `featured_items`

```
/magazine/
├── articles/
│   └── [slug] (détail article TipTap)
├── themes/
│   └── [slug] (articles par catégorie)
└── page.tsx (liste articles)

/nous-rencontrer/
├── partenaires (liste partenaires avec map)
├── evenements (table next_events)
└── [slug] (détail partenaire si nécessaire)

/nos-racines/
├── notre-histoire (page statique)
└── nos-valeurs (page statique)
```

### Routes Authentification (3 rôles MVP)

**Tables impliquées :** `users` (user/admin/dev roles)

```
/auth/
├── connexion
├── inscription
├── mot-de-passe
├── callback (Supabase)
└── reinitialisation

/compte/ (user role)
├── profil
├── commandes/
│   └── [id] (détail commande)
├── adresses
└── parametres
```

### Routes Admin (toutes tables)

**Permissions :** role = 'admin' | 'dev'

```
/admin/
├── tableau-de-bord
├── catalogue/
│   ├── produits/
│   │   ├── nouveau
│   │   └── [id] (édition)
│   └── categories/
│       ├── nouveau  
│       └── [id] (édition)
├── commandes/
│   └── [id] (gestion statuts)
├── contenu/
│   ├── articles/
│   │   ├── nouveau (éditeur TipTap)
│   │   └── [id] (édition)
│   ├── partenaires
│   ├── evenements
│   ├── newsletter (gestion emails)
│   └── hero (featured_items)
└── utilisateurs
```

---

## 🔗 Mapping Tables → Routes

### Tables E-commerce Core

| Table | Routes Frontend | Routes Admin |
|-------|----------------|--------------|
| `products` | `/boutique/produits/[slug]` | `/admin/catalogue/produits` |
| `categories` | `/boutique/categories/[slug]` | `/admin/catalogue/categories` |
| `carts` + `cart_items` | `/panier` | - |
| `orders` + `order_items` | `/compte/commandes` | `/admin/commandes` |
| `users` | `/compte/profil` | `/admin/utilisateurs` |
| `addresses` | `/compte/adresses` | - |

### Tables Content & Marketing

| Table | Routes Frontend | Routes Admin |
|-------|----------------|--------------|
| `articles` | `/magazine/articles/[slug]` | `/admin/contenu/articles` |
| `partners` | `/nous-rencontrer/partenaires` | `/admin/contenu/partenaires` |
| `next_events` | `/nous-rencontrer/evenements` | `/admin/contenu/evenements` |
| `newsletter_subscribers` | Form footer/popup | `/admin/contenu/newsletter` |
| `featured_items` | Hero homepage `/` | `/admin/contenu/hero` |

---

## 🛠️ Conventions Techniques

### Structure Fichiers Next.js 15

```
app/
├── (public)/           # Routes publiques
│   ├── page.tsx       # Homepage
│   ├── boutique/
│   ├── magazine/
│   ├── nous-rencontrer/
│   └── nos-racines/
├── auth/              # Authentification
├── compte/            # Espace user (middleware)
├── admin/             # Espace admin (middleware)
├── api/               # API routes
└── globals.css
```

### Conventions Nommage (kebab-case)

- ✅ **Fichiers/dossiers** : `kebab-case` (`user-profile.tsx`)
- ✅ **Composants React** : `PascalCase` (`UserProfile`)
- ✅ **URLs** : `kebab-case` (`/a-propos/notre-histoire`)
- ✅ **Variables** : `camelCase` (`currentUser`)

### Protection Routes

```typescript
// middleware.ts
const protectedRoutes = {
  '/compte': ['user', 'admin', 'dev'],
  '/admin': ['admin', 'dev']
}

const publicRoutes = [
  '/', '/boutique', '/magazine', '/nous-rencontrer', '/nos-racines',
  '/auth', '/contact', '/legal', '/support'
]
```

---

## 🚀 Implémentation Phases

### Phase 1 (Semaine 3) - Infrastructure UI
- [ ] Setup routes de base `/boutique`, `/magazine`, `/nous-rencontrer`, `/nos-racines`
- [ ] Composants Layout (Header avec navigation principale, Footer)
- [ ] Pages catégories avec design system shadcn/ui

### Phase 2 (Semaines 4-7) - E-commerce Core
- [ ] Routes produits avec labels HerbisVeritas
- [ ] Flow commande complet (panier → Stripe)
- [ ] Gestion addresses utilisateur

### Phase 3 (Semaines 8-10) - Content & Marketing
- [ ] Magazine TipTap avec routes articles
- [ ] Page `/nous-rencontrer` avec partenaires, map et événements
- [ ] Page `/nos-racines` avec histoire et valeurs
- [ ] Hero management featured_items

### Phase 4 (Semaines 11-12) - Admin & Polish
- [ ] Interface admin complète toutes tables
- [ ] SEO optimisé (sitemap.xml, meta tags)
- [ ] Performance < 2s Core Web Vitals

---

## 📊 SEO & Performance

### URLs Optimisées

```
✅ /boutique/categories/soins-visage
✅ /boutique/produits/savon-lavande-bio
✅ /magazine/articles/guide-cosmétique-naturel
✅ /a-propos/partenaires
❌ /shop/cat/1
❌ /products/item?id=123
```

### Métadonnées Dynamiques

```typescript
// app/boutique/produits/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug)
  return {
    title: `${product.name} | HerbisVeritas`,
    description: product.description_short,
    openGraph: {
      images: [product.image_url],
    },
  }
}
```

### Sitemap Automatique

```typescript
// app/sitemap.ts
export default async function sitemap() {
  const [products, articles, categories] = await Promise.all([
    getProducts(),
    getPublishedArticles(), 
    getCategories()
  ])

  return [
    ...products.map(p => ({
      url: `${baseUrl}/boutique/produits/${p.slug}`,
      lastModified: p.updated_at,
      priority: 0.8,
    })),
    ...articles.map(a => ({
      url: `${baseUrl}/magazine/articles/${a.slug}`,
      lastModified: a.updated_at,
      priority: 0.6,
    }))
  ]
}
```

---

## 🔄 Migration Routes Existantes

### Existant → MVP Navigation

| Route Actuelle | Nouvelle Route MVP | Action |
|---|---|---|
| `/login` | `/auth/connexion` | Redirect 301 |
| `/signup` | `/auth/inscription` | Redirect 301 |
| `/profile` | `/compte/profil` | Redirect 301 |
| `/admin` | `/admin/tableau-de-bord` | Redirect 301 |

### Redirections Next.js

```typescript
// next.config.js
const redirects = [
  {
    source: '/login',
    destination: '/auth/connexion',
    permanent: true, // 301
  },
  {
    source: '/profile',
    destination: '/compte/profil', 
    permanent: true,
  }
]
```

---

Cette architecture navigation MVP est **alignée sur les 13 tables validées** et **priorise les fonctionnalités business critiques** pour un lancement commercial rapide en 12 semaines.