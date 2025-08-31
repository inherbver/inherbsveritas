# Internationalisation MVP - HerbisVeritas V2

## Configuration Technique

### Framework
- **next-intl v3.22.4** : Solution d'internationalisation pour Next.js 15
- **Architecture** : App Router avec structure `[locale]`  
- **Locales MVP** : `fr` (défaut), `en`
- **Locales V2** : `de`, `es` (reportées)
- **Statut** : ✅ Configuration routing implémentée

### Structure Fichiers

```
src/
├── i18n/
│   ├── routing.ts          # Configuration routes localisées
│   └── request.ts          # Configuration serveur
├── messages/
│   ├── fr.json            # Traductions françaises
│   └── en.json            # Traductions anglaises
├── middleware.ts           # Routage automatique
└── app/
    └── [locale]/          # Routes internationalisées
        ├── layout.tsx     # Layout locale-aware
        └── ...
```

### Configuration Routes

#### Pathnames Localisés (✅ Implémenté)
```typescript
pathnames: {
  '/': '/',
  '/products': { fr: '/produits', en: '/products' },
  '/cart': { fr: '/panier', en: '/cart' },
  '/checkout': { fr: '/commande', en: '/checkout' },
  '/magazine': { fr: '/magazine', en: '/magazine' },
  '/partners': { fr: '/partenaires', en: '/partners' },
  '/about': { fr: '/a-propos', en: '/about' },
  '/contact': { fr: '/contact', en: '/contact' }
}
```

#### Middleware (✅ Configuration prête)
- Redirection automatique vers locale
- Support URLs sans préfixe pour français (mode 'always' avec prefixes)
- Détection navigateur pour locale initiale
- Alternate links SEO activés

### Messages Disponibles

#### 📋 Statut MVP : À Implémenter (Semaine 4)
Selon le plan MVP, l'implémentation i18n frontend est prévue en **Semaine 4**.

#### Navigation (📋 À implémenter)
- Liens principaux (boutique, produits, panier, etc.)
- Actions utilisateur (connexion, déconnexion, inscription)

#### E-commerce (📋 À implémenter)
- Produits (titre, description, labels, actions)
- Panier (états, actions, messages)
- Commande (étapes, formulaires, validation)

#### Contenu (📋 À implémenter)
- Articles (catégories, navigation)
- Partenaires (types, informations)
- Authentification (formulaires, messages)
- Footer (liens, newsletter, légal)

## Planning MVP Intégration

### ✅ Phase 1 Complétée
- Configuration next-intl v3.22.4
- Structure routing (`src/i18n/routing.ts`, `src/i18n/request.ts`)
- Pathnames localisés configurés
- Types TypeScript exportés

### 📋 Phase 2 : Semaine 4 (À venir)
- Création fichiers messages (`src/messages/fr.json`, `src/messages/en.json`)
- Implémentation middleware.ts
- Layout [locale] avec next-intl
- Tests i18n avec couverture > 90%

### 📋 Phase 3 : Semaines 5-12 (Progressive)
- Traductions composants UI au fur et mesure
- Messages d'erreur et validation localisés
- Tests e2e multilingues
- SEO multilingue complet

## Utilisation Développeur

### Composants
```typescript
import { useTranslations } from 'next-intl'

function ProductCard() {
  const t = useTranslations('Products')
  
  return (
    <button>{t('addToCart')}</button>
  )
}
```

### Pages Serveur
```typescript
import { getTranslations } from 'next-intl/server'

export default async function ProductsPage() {
  const t = await getTranslations('Products')
  
  return <h1>{t('title')}</h1>
}
```

### Navigation
```typescript
import { Link, usePathname } from '@/i18n/routing'

function Navigation() {
  return (
    <Link href="/products">
      {/* Génère automatiquement /produits ou /products */}
    </Link>
  )
}
```

## URLs Générées

### Français (défaut)
- `/` → Homepage française
- `/produits` → Page produits
- `/panier` → Panier
- `/a-propos` → Page à propos

### Anglais
- `/en` → Homepage anglaise  
- `/en/products` → Page produits
- `/en/cart` → Panier
- `/en/about` → Page à propos

## Évolution V2

### Locales Additionnelles
- Allemand (`de`) : marché DACH
- Espagnol (`es`) : marché hispanophone

### Features Avancées
- Formatage devises par région
- Dates/heures localisées
- Validation formulaires par locale
- SEO multilingue avancé

## Maintenance

### Ajout Traductions
1. Éditer `src/messages/{locale}.json`
2. Maintenir cohérence clés entre locales
3. Tester affichage sur toutes les pages

### Debug
```bash
npm run dev
# Test URLs :
# http://localhost:3000 (français)
# http://localhost:3000/en (anglais)
```

### Performance
- Messages chargés côté serveur
- Pas de surcharge client
- SSG compatible multilingue

## Statut Actuel MVP

### ✅ Implémenté (Semaine 2)
- Configuration next-intl v3.22.4 installée
- Routing configuration dans `src/i18n/routing.ts`
- Types TypeScript Locale et Pathnames
- Pathnames localisés FR/EN définis
- Request configuration prête

### 📋 Prochaines Actions (Semaine 4)
1. **TDD First** : Tests i18n avant implémentation
2. Création middleware.ts pour routage automatique
3. Implémentation layout [locale] 
4. Fichiers messages fr.json/en.json
5. Tests couverture i18n > 90%

### Architecture Respectée
- Strictement FR/EN pour MVP (DE/ES reportés V2)
- Français par défaut (URLs sans préfixe)
- SEO multilingue avec alternate links
- Compatible avec architecture 13 tables MVP