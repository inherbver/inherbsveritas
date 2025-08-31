# Note Technique : Problème 404 Généralisé avec Next.js 15 + next-intl

**Date :** 31 août 2025  
**Projet :** HerbisVeritas V2 MVP  
**Auteur :** Claude Code  
**Criticité :** BLOQUANT  
**Statut :** EN COURS D'INVESTIGATION  

## Résumé Exécutif

Problème critique de routage affectant l'ensemble de l'application. Toutes les routes retournent des erreurs 404 malgré une configuration apparemment correcte de next-intl avec Next.js 15 App Router.

## Environnement Technique

### Stack Concerné
- **Next.js :** 15.3.0
- **next-intl :** 3.26.5  
- **Architecture :** App Router
- **Langues :** FR (défaut), EN
- **Middleware :** Combinaison next-intl + Supabase Auth

### Configuration Actuelle

#### Structure Fichiers
```
src/app/
├── [locale]/
│   ├── layout.tsx          ✅ Existe
│   ├── page.tsx            ✅ Existe (simplifié pour debug)
│   ├── not-found.tsx       ✅ Créé
│   ├── shop/
│   │   └── page.tsx        ✅ Déplacé du groupe (site)
│   ├── [locale]/[...rest]/
│   │   └── page.tsx        ✅ Catch-all créé
│   └── (site)/             ❌ Groupe conflictuel avec pathnames
└── middleware.ts           ✅ Combiné i18n + auth
```

#### Configuration i18n (`src/i18n/routing.ts`)
```typescript
export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',    // FR sans préfixe, EN avec /en
  alternateLinks: true,
  pathnames: {                  // ⚠️ CONFLIT POTENTIEL
    '/': '/',
    '/shop': {
      fr: '/boutique',
      en: '/shop'
    }
    // ... autres routes
  }
})
```

#### Middleware (`middleware.ts`)
```typescript
const handleI18nRouting = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request)
  return await updateSession(request, response)  // Auth Supabase
}

export const config = {
  matcher: [
    '/',                              // Route racine explicite
    '/(fr|en)/:path*',               // Routes localisées
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Symptômes Observés

### 1. Erreurs HTTP
```bash
GET / 404 in 2160ms          # Route racine
GET /fr/boutique 404 in 489ms  # Route française 
GET /en/shop 404 in 35ms      # Route anglaise
```

### 2. Comportements Anormaux
- **Timeout navigateur :** 10+ secondes avant 404
- **Compilation silencieuse :** Aucune erreur TypeScript/build
- **Page simplifiée :** Même avec composant minimal, 404 persiste
- **Persistance :** Redémarrage serveur n'aide pas

### 3. Tests Effectués

#### ✅ Tests Validés
- Vérification existence fichiers physiques
- Validation configuration next-intl
- Simplification page racine (suppression dépendances)
- Compatibilité versions packages
- Structure dossiers conforme App Router

#### ❌ Tests Échoués  
- Navigation vers routes existantes
- Accès direct avec locale explicite (`/fr`, `/en`)
- Routes avec et sans préfixe locale

## Analyses Techniques

### 1. Conflit Groupes de Routes vs Pathnames

**Hypothèse Principale :** Incompatibilité entre groupes de routes Next.js `(site)` et configuration `pathnames` de next-intl.

```typescript
// Configuration pathnames définit :
'/shop': { fr: '/boutique', en: '/shop' }

// Mais fichier physique était dans :
src/app/[locale]/(site)/shop/page.tsx

// next-intl cherche :  
src/app/[locale]/shop/page.tsx
```

**Action :** Fichier déplacé vers structure attendue, mais problème persiste.

### 2. Middleware Chain Issues

**Problème Potentiel :** Combinaison middleware i18n + auth pourrait causer des conflits.

```typescript
// Pattern actuel
const response = handleI18nRouting(request)
return await updateSession(request, response)

// Problème possible : updateSession modifie response
// et casse le routage i18n initial
```

### 3. Configuration next.config.js

```javascript
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
module.exports = withNextIntl(nextConfig)
```

**Validation :** Configuration semble correcte, fichier `request.ts` existe et charge les messages.

### 4. Matcher Middleware Trop Restrictif

**Théorie :** Ancien matcher pourrait ne pas capturer toutes les routes nécessaires.

```typescript
// Ancien (possiblement restrictif)
'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'

// Nouveau (plus explicite) 
'/', '/(fr|en)/:path*', '/((?!_next/static|...).*)'
```

## Actions Correctives Tentées

### Phase 1 : Correction Structure
1. ✅ Déplacement fichiers hors groupe `(site)`
2. ✅ Création page `not-found.tsx` localisée  
3. ✅ Ajout route catch-all `[...rest]`
4. ✅ Amélioration validation locale avec `hasLocale`

### Phase 2 : Optimisation Middleware  
1. ✅ Matcher explicite pour routes racine et localisées
2. ✅ Exclusion assets et fichiers système
3. 🔄 Test en cours : Impact sur résolution routes

### Phase 3 : Debug Configuration
1. ✅ Vérification versions packages compatibles
2. ✅ Validation fichiers messages i18n existent
3. 🔄 Investigation plus poussée structure vs pathnames

## Hypothèses Investigations Futures

### 1. Problème Fondamental Middleware
```typescript
// Test isolation : middleware i18n seul
export default createIntlMiddleware(routing)
// Sans combinaison Supabase auth
```

### 2. Configuration localePrefix Conflictuelle
```typescript
// Test avec configuration simple
localePrefix: 'always'  // Au lieu de 'as-needed'
```

### 3. Cache/Build Corrompu
```bash
rm -rf .next
rm -rf node_modules  
npm install --legacy-peer-deps
npm run dev
```

### 4. Route Layout Missing
Vérifier si `src/app/layout.tsx` (root global) interfère avec `[locale]/layout.tsx`.

## Métriques Impact

### Performance
- **Temps réponse :** 2-10 secondes avant 404
- **Timeout navigateur :** Fréquent
- **Build time :** Normal (~2 secondes)

### Fonctionnel  
- **Routes affectées :** 100% (toutes)
- **Locales affectées :** FR et EN
- **Environnement :** Development uniquement testé

## Recommandations Immédiates

### 1. Isolation Testing
Créer configuration minimale next-intl sans Supabase auth pour identifier la cause.

### 2. Revue Architecture  
Retour analyse complète structure vs pathnames avec expert next-intl.

### 3. Escalade Technique
Considérer ouverture issue GitHub sur repository next-intl avec reproduction case.

### 4. Fallback Solution
Prévoir configuration alternative sans pathnames localisés pour déblocage MVP.

## Prochaines Étapes

1. **Immédiat :** Test middleware i18n isolé
2. **Court terme :** Configuration localePrefix alternative  
3. **Moyen terme :** Review complète architecture routage
4. **Fallback :** Implémentation sans pathnames si nécessaire

---

**Note :** Ce problème bloque l'ensemble du développement frontend. Priorité absolue pour résolution avant continuation features MVP.

**Contact technique :** Claude Code - Session continue pour résolution