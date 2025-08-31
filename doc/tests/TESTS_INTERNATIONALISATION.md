# Tests Internationalisation - HerbisVeritas V2

**Date :** 31 août 2025  
**Système :** next-intl v4.1.0 + Next.js 15  
**Statut :** ✅ Fonctionnel

## Configuration Validée

### Structure Fichiers
```
app/
├── layout.tsx                 # Root layout avec CSS imports
└── [locale]/
    ├── layout.tsx            # Locale layout avec validation
    ├── page.tsx              # Page d'accueil
    └── shop/
        └── page.tsx          # Page boutique

src/
├── i18n-config.ts           # Configuration locales et pathnames
├── navigation.ts            # Navigation utilities next-intl
├── i18n.ts                  # Request config avec messages
└── i18n/
    └── messages/
        ├── fr.json          # Messages français
        └── en.json          # Messages anglais
```

### Configuration Core
```typescript
// src/i18n-config.ts
export const locales = ["en", "fr"] as const;
export const defaultLocale: Locale = "fr";
export const localePrefix = "always";
export const pathnames = {
  "/": "/",
  "/shop": {
    en: "/shop",
    fr: "/boutique",
  }
};
```

## Tests Validation Manuel

### Routes Principales
| URL | Statut | Description |
|-----|---------|------------|
| `http://localhost:3009/` | 200 | Redirige vers `/fr` |
| `http://localhost:3009/fr` | 200 | Page d'accueil française |
| `http://localhost:3009/en` | 200 | Page d'accueil anglaise |
| `http://localhost:3009/fr/boutique` | 200 | Page boutique française |
| `http://localhost:3009/en/shop` | 200 | Page boutique anglaise |

### Middleware Behavior
```
🔄 [middleware] Processing: GET /fr/boutique
🔄 [middleware] Rewriting /boutique to /shop for locale fr
✅ GET /fr/boutique 200 in 2274ms

🔄 [middleware] Processing: GET /en/shop  
✅ GET /en/shop 200 in 375ms
```

## Tests Automatisés Recommandés

### Jest - Configuration i18n
```bash
# Test critique - configuration next-intl
npm test tests/integration/i18n/routing-regression.test.ts

# Vérifie:
✅ localePrefix = "always"  
✅ defaultLocale = "fr"
✅ pathnames mapping correct
✅ messages JSON valides
```

### Playwright - Navigation E2E  
```bash
# Tests parcours utilisateur
npm run test:e2e tests/e2e/i18n-routing-critical.spec.ts

# Vérifie:
✅ Navigation / → /fr < 2s
✅ Navigation /en < 2s
✅ Navigation /fr/boutique < 2s  
✅ Navigation /en/shop < 2s
✅ Pas d'erreurs 404 ou timeouts
```

## Diagnostic Rapide

### Health Check Command
```bash
# Démarrage serveur
npm run dev

# Vérifications rapides
curl -I http://localhost:3009/fr         # → 200
curl -I http://localhost:3009/en         # → 200  
curl -I http://localhost:3009/fr/boutique # → 200
curl -I http://localhost:3009/en/shop     # → 200
```

### Logs Middleware  
Le middleware doit afficher :
```
🔄 [middleware] Processing: GET /[path]
🔄 [middleware] ✅ Complete in [X]ms: { path: '/[path]' }
```

Sans erreurs de redirection ou timeouts.

## Erreurs Communes Résolues

### ❌ Erreur: Routes 404 généralisées
**Cause :** Structure `/src/app` au lieu de `/app`  
**Solution :** Migration vers `/app/[locale]/`

### ❌ Erreur: CSS imports non trouvés  
**Cause :** Chemins relatifs incorrects après migration  
**Solution :** Correction paths dans `/app/layout.tsx`

### ❌ Erreur: Redirect loops  
**Cause :** Pages dupliquées `/boutique` + `/shop`  
**Solution :** Suppression doublons, pathnames mapping seul

## Maintenance

### Ajout Nouvelle Langue
1. Ajouter locale dans `src/i18n-config.ts`
2. Créer `src/i18n/messages/[locale].json`  
3. Mettre à jour `pathnames` si nécessaire
4. Tester routes avec health check

### Ajout Nouvelle Route
1. Définir pathname mapping dans `i18n-config.ts`
2. Créer page dans `app/[locale]/[route]/page.tsx`
3. Ajouter messages dans JSON si nécessaire
4. Valider navigation E2E

## Références

- **Configuration :** `src/i18n-config.ts`
- **Middleware :** `middleware.ts`  
- **Messages :** `src/i18n/messages/`
- **Documentation next-intl :** https://next-intl-docs.vercel.app/
- **Tests stabilité :** `docs/TESTING_GUIDE_I18N_STABILITY.md`

---

**Système validé et prêt pour développement MVP.**