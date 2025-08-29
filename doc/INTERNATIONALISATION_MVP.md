# Internationalisation MVP - HerbisVeritas V2

## Configuration Technique

### Framework
- **next-intl v3.26.5** : Solution d'internationalisation pour Next.js 15
- **Architecture** : App Router avec structure `[locale]`
- **Locales MVP** : `fr` (défaut), `en`
- **Locales V2** : `de`, `es` (reportées)

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

#### Pathnames Localisés
```typescript
pathnames: {
  '/products': { fr: '/produits', en: '/products' },
  '/cart': { fr: '/panier', en: '/cart' },
  '/checkout': { fr: '/commande', en: '/checkout' },
  '/magazine': { fr: '/magazine', en: '/magazine' },
  '/partners': { fr: '/partenaires', en: '/partners' },
  '/about': { fr: '/a-propos', en: '/about' },
  '/contact': { fr: '/contact', en: '/contact' }
}
```

#### Middleware
- Redirection automatique vers locale
- Support URLs sans préfixe pour français
- Détection navigateur pour locale initiale

### Messages Disponibles

#### Navigation
- Liens principaux (boutique, produits, panier, etc.)
- Actions utilisateur (connexion, déconnexion, inscription)

#### E-commerce
- Produits (titre, description, labels, actions)
- Panier (états, actions, messages)
- Commande (étapes, formulaires, validation)

#### Contenu
- Articles (catégories, navigation)
- Partenaires (types, informations)
- Authentification (formulaires, messages)
- Footer (liens, newsletter, légal)

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