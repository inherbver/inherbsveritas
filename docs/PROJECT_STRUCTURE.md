# PROJECT_STRUCTURE - HerbisVeritas V2

## 📋 Structure de Projet MVP

Ce document définit l'organisation stricte des fichiers et dossiers pour le MVP HerbisVeritas V2 basé sur l'architecture 13 tables validée.

**⚠️ CRITIQUE : Respecter cette structure pour éviter les doublons et maintenir la cohérence MVP.**

---

## 🏗️ Architecture Générale

```
inherbisveritas/
├── 📁 docs/                    # Documentation projet
├── 📁 public/                  # Assets statiques
├── 📁 scripts/                 # Scripts maintenance DB
├── 📁 src/                     # Code source principal
├── 📁 supabase/                # Configuration Supabase
├── 📄 CLAUDE.md               # Instructions Claude
├── 📄 package.json            # Dépendances Node.js
└── 📄 next.config.js          # Configuration Next.js
```

---

## 📂 Structure Détaillée `/src`

### `/src/app` - App Router Next.js 15

```
src/app/
├── 📁 (site)/                 # Routes publiques groupées
│   ├── 📁 about/              # Page À propos
│   ├── 📁 admin/              # Interface admin (protégée)
│   ├── 📁 cart/               # Panier utilisateur
│   ├── 📁 checkout/           # Tunnel d'achat
│   ├── 📁 contact/            # Page contact
│   ├── 📁 dashboard/          # Tableau de bord user
│   ├── 📁 magazine/           # Articles CMS
│   │   └── 📁 [slug]/         # Article détail
│   ├── 📁 partners/           # Partenaires/points de vente
│   ├── 📁 pricing/            # Tarification (si nécessaire)
│   └── 📁 products/           # Catalogue produits
├── 📁 api/                    # API Routes
│   └── 📁 register/           # Endpoints auth
├── 📄 layout.tsx              # Layout root global
├── 📄 page.tsx                # Page d'accueil
├── 📄 not-found.tsx           # Page 404
├── 📄 error.tsx               # Error boundary
├── 📄 head.tsx                # Meta tags globales
└── 📄 providers.tsx           # Context providers
```

### `/src/components` - Composants React

**Convention Noms :** `PascalCase` pour composants, index.tsx pour exports

```
src/components/
├── 📁 About/                  # Section À propos
│   └── 📄 index.tsx
├── 📁 Admin/                  # Interface administration
│   ├── 📄 Dashboard.tsx       # Tableau de bord admin
│   ├── 📄 ProductsCRUD.tsx    # CRUD produits
│   ├── 📄 OrdersManagement.tsx # Gestion commandes
│   └── 📄 UsersManagement.tsx # Gestion utilisateurs
├── 📁 Articles/               # Module magazine
│   ├── 📄 ArticlesList.tsx    # Liste articles
│   ├── 📄 ArticleCard.tsx     # Card article
│   └── 📄 ArticleDetail.tsx   # Vue détail
├── 📁 CallToAction/           # CTA sections
│   └── 📄 index.tsx
├── 📁 Cart/                   # Système panier
│   ├── 📄 CartSheet.tsx       # Panier coulissant
│   ├── 📄 CartItem.tsx        # Item panier
│   └── 📄 CartSummary.tsx     # Résumé totaux
├── 📁 Categories/             # Navigation catégories
│   ├── 📄 CategoryTree.tsx    # Arbre hiérarchique
│   └── 📄 CategoryFilter.tsx  # Filtres produits
├── 📁 Common/                 # Composants génériques
│   ├── 📄 Breadcrumb.tsx      # Fil d'Ariane
│   ├── 📄 Loader.tsx          # Indicateurs charge
│   ├── 📄 PreLoader.tsx       # Preloader app
│   ├── 📄 ScrollUp.tsx        # Scroll to top
│   └── 📄 SectionTitle.tsx    # Titres sections
├── 📁 Contact/                # Formulaire contact
│   └── 📄 index.tsx
├── 📁 Dashboard/              # Tableau de bord user
│   ├── 📄 ProfileSettings.tsx # Paramètres profil
│   ├── 📄 OrderHistory.tsx    # Historique commandes
│   └── 📄 AddressBook.tsx     # Carnet adresses
├── 📁 Features/               # Features produit
│   ├── 📄 SingleFeature.tsx
│   ├── 📄 featuresData.tsx
│   └── 📄 index.tsx
├── 📁 Footer/                 # Pied de page
│   └── 📄 index.tsx
├── 📁 Header/                 # En-tête navigation
│   ├── 📄 index.tsx
│   ├── 📄 ThemeToggler.tsx    # Toggle dark/light
│   └── 📄 menuData.tsx        # Data navigation
├── 📁 Hero/                   # Hero sections
│   └── 📄 index.tsx
├── 📁 Newsletter/             # Inscription newsletter
│   ├── 📄 SignupPopup.tsx     # Popup inscription
│   └── 📄 FooterSignup.tsx    # Signup footer
├── 📁 Orders/                 # Gestion commandes
│   ├── 📄 OrderSummary.tsx    # Résumé commande
│   ├── 📄 OrderTracking.tsx   # Suivi livraison
│   └── 📄 OrderHistory.tsx    # Historique
├── 📁 Partners/               # Partenaires
│   └── 📄 index.tsx
├── 📁 Products/               # Catalogue produits
│   ├── 📄 ProductCard.tsx     # Card produit
│   ├── 📄 ProductDetail.tsx   # Détail produit
│   ├── 📄 ProductsList.tsx    # Liste produits
│   ├── 📄 ProductFilters.tsx  # Filtres recherche
│   └── 📄 index.tsx
├── 📁 UI/                     # Composants UI base
│   ├── 📄 Button.tsx          # shadcn/ui Button
│   ├── 📄 Input.tsx           # shadcn/ui Input
│   ├── 📄 HydrationSafe.tsx   # Wrapper hydratation
│   └── 📄 ...                 # Autres composants shadcn
└── 📁 NotFound/               # Page 404
    └── 📄 index.tsx
```

### `/src/lib` - Logique Métier

**Convention Noms :** `kebab-case` pour dossiers, `camelCase` pour fichiers

```
src/lib/
├── 📁 articles/               # Module magazine
│   ├── 📄 actions.ts          # Actions serveur articles
│   ├── 📄 queries.ts          # Requêtes articles
│   └── 📄 types.ts            # Types articles
├── 📁 auth/                   # Authentification
│   ├── 📄 auth.ts             # Configuration auth
│   ├── 📄 middleware.ts       # Middleware protection
│   └── 📄 providers.ts        # Auth providers
├── 📁 cart/                   # Système panier
│   ├── 📄 actions.ts          # Actions panier
│   ├── 📄 store.ts            # Store Zustand
│   └── 📄 utils.ts            # Utilitaires panier
├── 📁 cms/                    # Content Management
│   ├── 📄 tiptap.ts           # Configuration TipTap
│   └── 📄 media.ts            # Gestion médias
├── 📁 commerce/               # E-commerce core
│   ├── 📄 checkout.ts         # Logique checkout
│   ├── 📄 orders.ts           # Gestion commandes
│   └── 📄 shipping.ts         # Calculs livraison
├── 📁 newsletter/             # Newsletter
│   ├── 📄 actions.ts          # Inscription/désinscription
│   └── 📄 types.ts            # Types newsletter
├── 📁 orders/                 # Commandes
│   ├── 📄 actions.ts          # Actions commandes
│   ├── 📄 queries.ts          # Requêtes commandes
│   ├── 📄 tracking.ts         # Suivi Colissimo
│   └── 📄 status.ts           # États commandes
├── 📁 partners/               # Partenaires
│   ├── 📄 actions.ts          # CRUD partenaires
│   └── 📄 queries.ts          # Requêtes partenaires
├── 📁 products/               # Produits
│   ├── 📄 actions.ts          # CRUD produits
│   ├── 📄 queries.ts          # Requêtes produits
│   ├── 📄 filters.ts          # Filtres recherche
│   └── 📄 labels.ts           # Labels HerbisVeritas
├── 📁 supabase/               # Configuration Supabase
│   ├── 📄 client.ts           # Client browser
│   ├── 📄 server.ts           # Client serveur
│   ├── 📄 admin.ts            # Client admin
│   └── 📄 middleware.ts       # Middleware auth
├── 📄 type-guards.ts          # Guards TypeScript
└── 📄 utils.ts                # Utilitaires généraux
```

### `/src/types` - Types TypeScript

**Convention Noms :** `kebab-case` pour fichiers

```
src/types/
├── 📁 commerce/               # Types e-commerce
│   ├── 📄 cart.ts             # Types panier
│   ├── 📄 order.ts            # Types commandes
│   └── 📄 payment.ts          # Types paiement
├── 📄 database.ts             # Types Supabase générés
├── 📄 context7-patterns.ts    # Patterns Context7
├── 📄 blog.ts                 # Types articles/magazine
├── 📄 client.ts               # Types client
├── 📄 feature.ts              # Types features
└── 📄 menu.ts                 # Types navigation
```

### `/src/stores` - State Management

```
src/stores/
├── 📁 commerce/               # Stores commerce
│   ├── 📄 cart.ts             # Store panier Zustand
│   ├── 📄 checkout.ts         # Store checkout
│   └── 📄 user.ts             # Store utilisateur
└── 📄 index.ts                # Export stores
```

### `/src/hooks` - Hooks React Custom

**Convention Noms :** `camelCase` avec préfixe `use`

```
src/hooks/
├── 📄 useHydrationSafe.ts     # Hook anti-hydratation
├── 📄 useCart.ts              # Hook panier
├── 📄 useAuth.ts              # Hook authentification
├── 📄 useProducts.ts          # Hook produits
└── 📄 useLocalStorage.ts      # Hook storage
```

### `/src/utils` - Utilitaires

**Convention Noms :** `camelCase`

```
src/utils/
├── 📄 auth.ts                 # Utilitaires auth
├── 📄 email.ts                # Utilitaires email
├── 📄 markdown.ts             # Parser markdown
├── 📄 markdownToHtml.ts       # Conversion MD→HTML
└── 📄 validateEmail.ts        # Validation email
```

### `/src/i18n` - Internationalisation

```
src/i18n/
├── 📄 request.ts              # Configuration next-intl
└── 📄 routing.ts              # Routes i18n
```

### `/src/messages` - Traductions

```
src/messages/
├── 📄 en.json                 # Traductions anglais
└── 📄 fr.json                 # Traductions français
```

### `/src/styles` - Styles CSS

```
src/styles/
├── 📄 index.css               # Styles globaux Tailwind
└── 📄 prism-vsc-dark-plus.css # Thème code syntax
```

---

## 📁 Structure Complémentaire

### `/docs` - Documentation

```
docs/
├── 📄 PROJECT_STRUCTURE.md    # Ce fichier
├── 📄 DEVELOPMENT_PLAN_MVP.md # Plan développement
├── 📄 DATABASE_SCHEMA_MVP.md  # Schéma base données
├── 📄 API_SPECIFICATIONS.md   # Spécifications API
├── 📄 DESIGN_SYSTEM.md        # Système design
├── 📄 INTERNATIONALIZATION_GUIDE.md # Guide i18n
└── 📄 ...                     # Autres docs techniques
```

### `/public` - Assets Statiques

```
public/
├── 📁 images/                 # Images site
│   ├── 📁 logo/               # Logos variantes
│   ├── 📁 hero/               # Images hero
│   ├── 📁 footer/             # Assets footer
│   └── 📁 products/           # Images produits (upload)
├── 📄 favicon.ico             # Icône site
└── 📄 robots.txt              # SEO crawler
```

### `/supabase` - Configuration DB

```
supabase/
├── 📁 migrations/             # Migrations SQL
│   └── 📄 001_mvp_schema.sql  # Schéma 13 tables
├── 📁 docs/                   # Documentation Supabase
└── 📄 README.md               # Guide configuration
```

### `/scripts` - Scripts Maintenance

```
scripts/
├── 📁 hooks/                  # Git hooks
├── 📄 apply-migration.js      # Application migration
├── 📄 check-migration-status.js # Vérification statut
├── 📄 seed-data.js            # Données initiales
└── 📄 reset-database.js       # Reset complet DB
```

---

## 🎯 Règles de Placement Strictes

### ✅ **À Faire**

1. **Vérification Préalable :**
   ```bash
   # Avant création, chercher fichiers similaires
   git grep -r "ComponentName" src/
   find src/ -name "*component*" -type f
   ```

2. **Placement Correct :**
   - **Composants React** → `src/components/[Module]/`
   - **Logique métier** → `src/lib/[module]/`
   - **Types TypeScript** → `src/types/`
   - **Pages App Router** → `src/app/(site)/[page]/`
   - **API Routes** → `src/app/api/[endpoint]/`

3. **Convention Noms :**
   - **Composants** : `PascalCase.tsx`
   - **Fichiers logique** : `camelCase.ts`
   - **Dossiers modules** : `kebab-case/`
   - **Pages routes** : `page.tsx`, `layout.tsx`

### ❌ **Interdictions**

1. **Doublons Fonctionnels :**
   - `Cart.tsx` ET `Cart/index.tsx` ❌
   - `ProductCard.tsx` ET `Product/Card.tsx` ❌

2. **Mauvais Placement :**
   - Composants dans `app/` ❌ → `components/`
   - Logique dans `components/` ❌ → `lib/`
   - API logic dans `components/` ❌ → `lib/`

3. **Structure Non-MVP :**
   - Nouveaux dossiers racine ❌
   - Modules non-planifiés ❌
   - Complexité beyond 13 tables ❌

---

## 🔧 Pattern d'Utilisation

### Avant Création de Fichier

```typescript
// 1. Vérifier existence
// git grep -r "ProductCard" src/

// 2. Identifier module
// → Module "products" → src/components/Products/

// 3. Respecter convention
// → ProductCard.tsx (PascalCase component)

// 4. Structure export
// src/components/Products/ProductCard.tsx
export const ProductCard = () => { /* ... */ }

// src/components/Products/index.ts
export { ProductCard } from './ProductCard'
export { ProductsList } from './ProductsList'
```

### Import Pattern Standardisé

```typescript
// Imports absolus depuis src/
import { ProductCard } from '@/components/Products'
import { getProducts } from '@/lib/products/queries'
import { Product } from '@/types/database'
import { useCart } from '@/hooks/useCart'
```

---

## 📊 Validation Structure

### Checklist Pré-Création

- [ ] ✅ Fichier n'existe pas déjà (`git grep`, `find`)
- [ ] ✅ Module identifié selon MVP
- [ ] ✅ Dossier cible validé selon ce guide
- [ ] ✅ Convention nom respectée
- [ ] ✅ Pas de doublon fonctionnel
- [ ] ✅ Import paths configurés

### Validation Post-Création

- [ ] ✅ Export ajouté à `index.ts` module
- [ ] ✅ Types TypeScript cohérents
- [ ] ✅ Imports relatifs corrects
- [ ] ✅ Documentation inline ajoutée
- [ ] ✅ Tests unitaires si critique

---

## 🎯 Points d'Escalation Structure

**Si conflit ou doute sur placement :**

1. 🛑 **STOP** création fichier
2. 📋 **CONSULTER** ce guide + plan MVP
3. 🔍 **RECHERCHER** patterns existants similaires
4. 💡 **VALIDER** avec architecture 13 tables
5. ✅ **DOCUMENTER** décision si nouvelle

---

**Version :** 1.0.0  
**Créé :** 2025-01-28  
**Statut :** ✅ ACTIF MVP

Cette structure garantit la **cohérence**, **maintenabilité** et **scalabilité** du projet HerbisVeritas V2 selon les contraintes MVP validées.