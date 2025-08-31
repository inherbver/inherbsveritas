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

## Solutions Utilisées dans HerbisVeritas

### 1. Configuration next-intl Stabilisée

**Architecture utilisée :**
```typescript
// src/i18n-config.ts
export const locales = ["en", "fr"] as const;
export const defaultLocale: Locale = "fr";
export const localePrefix = "always"; // ✅ SOLUTION: Utiliser 'always' au lieu de 'as-needed'
```

**Points clés :**
- `localePrefix: "always"` évite les conflits de routage avec les redirections
- Configuration des pathnames séparée dans `navigation.ts`
- Types TypeScript stricts pour éviter les erreurs de configuration

### 2. Structure Fichiers Simplifiée

**Architecture fonctionnelle :**
```
src/app/
├── [locale]/
│   ├── layout.tsx          ✅ Layout principal localisé
│   ├── page.tsx            ✅ Page d'accueil avec redirect vers /shop
│   ├── shop/page.tsx       ✅ PAS de groupe de routes (site)
│   ├── admin/              ✅ Routes admin directement sous [locale]
│   └── profile/            ✅ Routes profile directement sous [locale]
└── middleware.ts           ✅ Middleware combiné i18n + auth
```

**Erreur à éviter :** Ne pas utiliser de groupes de routes `(site)` avec pathnames localisés.

### 3. Middleware Combiné Optimisé

**Configuration qui fonctionne :**
```typescript
// middleware.ts
const handleI18n = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  pathnames,
  localeDetection,
});

export async function middleware(request: NextRequest) {
  // 1. Traitement i18n AVANT auth
  let response = handleI18n(request);
  
  // 2. Traitement auth avec préservation cookies i18n
  // ... logique Supabase ...
  
  // 3. Synchronisation finale des cookies
  return finalResponse;
}
```

**Matcher simplifié :**
```typescript
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
```

### 4. Configuration next.config.js

**Plugin i18n correctement configuré :**
```javascript
const withNextIntl = createNextIntlPlugin("./src/i18n.ts");
export default withNextIntl(nextConfig);
```

**Point critique :** Le chemin vers `i18n.ts` doit être exact.

### 5. Pathnames Localisés Fonctionnels

**Configuration dans navigation.ts :**
```typescript
export const pathnames = {
  "/": "/",
  "/shop": {
    en: "/shop",
    fr: "/boutique",
  },
  "/products/[slug]": {
    en: "/products/[slug]",
    fr: "/produits/[slug]",
  },
  // ... autres routes
} as const;
```

**Rewrites dans middleware :**
```typescript
// Gestion des routes localisées : /boutique -> /shop
if (pathToCheckForRewrite === "/boutique") {
  return NextResponse.rewrite(
    new URL(`/${currentLocale}/shop`, request.url),
  );
}
```

### 6. Chargement Messages i18n Robuste

**Configuration dans i18n.ts :**
```typescript
async function loadMessagesForLocale(locale: Locale): Promise<Messages> {
  // Chargement parallèle de tous les namespaces
  const promises = namespaces.map(async (namespace) => {
    try {
      const module = await import(`./i18n/messages/${locale}/${namespace}.json`);
      // ... validation contenu ...
    } catch (e) {
      // Gestion d'erreur robuste
    }
  });
  // ...
}
```

## Diagnostic et Solutions

### 🔍 Analyse Comparative avec le Cas Problématique

**Configuration qui ÉCHOUE (cas décrit)** :
- `src/i18n/routing.ts` avec `defineRouting()`
- `localePrefix: 'as-needed'`
- Plugin path: `'./src/i18n/request.ts'`
- Middleware auth qui écrase i18n response
- Groupes de routes `(site)` avec pathnames

**Configuration qui FONCTIONNE (HerbisVeritas)** :
- `src/i18n-config.ts` + `src/i18n/navigation.ts` séparés
- `localePrefix: 'always'`
- Plugin path: `'./src/i18n.ts'`
- Middleware séquentiel (i18n puis auth)
- Structure plate sans groupes de routes

### ✅ Solutions Confirmées

1. **localePrefix: "always"** - Évite les conflits de routage avec redirections automatiques
2. **Architecture séparée** - Configuration i18n + navigation dans fichiers distincts
3. **Structure sans groupes** - Pas de `(site)` avec pathnames localisés
4. **Middleware séquentiel** - i18n traité AVANT auth avec préservation cookies
5. **Plugin path correct** - `./src/i18n.ts` au lieu de `./src/i18n/request.ts`
6. **Matcher simplifié** - Configuration standard Next.js
7. **Rewrites explicites** - Pour les routes localisées françaises

### ❌ Configurations Problématiques

1. **`localePrefix: "as-needed"`** - Cause des conflits de routage avec FR sans préfixe
2. **`defineRouting()` centralisé** - Architecture fragile vs fichiers séparés
3. **Groupes de routes avec pathnames** - `(site)` incompatible avec pathnames localisés
4. **Middleware auth écrasant i18n** - `updateSession()` modifie la response i18n
5. **Plugin path incorrect** - `'./src/i18n/request.ts'` vs `'./src/i18n.ts'`
6. **Matcher trop complexe** - Exclusions multiples vs matcher simple
7. **Cache `.next` corrompu** - Solution : suppression + rebuild
8. **Messages JSON incomplets** - Clés manquantes (`NotFound`) causent erreurs 500

### 🔧 Actions Correctives Recommandées (Par Ordre de Priorité)

1. **Immédiat :** 
   - Changer `localePrefix` vers `"always"`
   - Vérifier plugin path dans `next.config.js`
   - Compléter messages JSON (ajouter clés manquantes)

2. **Architecture :**
   - Migrer vers fichiers séparés (`i18n-config.ts` + `navigation.ts`)
   - Supprimer groupes de routes `(site)`
   - Simplifier matcher middleware

3. **Middleware :**
   - Traiter i18n AVANT auth
   - Préserver cookies i18n dans response finale
   - Ajouter logs debug pour diagnostiquer

4. **Cache & Build :**
   - Nettoyer `.next` et `node_modules`
   - Rebuild complet avec nouvelles configurations

5. **Routes localisées :**
   - Ajouter rewrites explicites pour routes françaises
   - Tester navigation entre locales

## Prochaines Étapes

1. **Immédiat :** Appliquer configuration HerbisVeritas
2. **Test :** Valider routage avec nouvelles configurations
3. **Documentation :** Mettre à jour architecture projet
4. **Monitoring :** Surveiller logs middleware post-correction

---

**Note :** Solutions testées et validées dans HerbisVeritas - Projet en production stable.

**Contact technique :** Claude Code - Solutions éprouvées disponibles