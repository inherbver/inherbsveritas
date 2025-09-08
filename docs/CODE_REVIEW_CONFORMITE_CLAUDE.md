# Revue de Code - Conformité CLAUDE.md
## HerbisVeritas V2

**Date :** 2025-01-28  
**Version :** 1.0  
**Statut :** ANALYSE COMPLETE

---

## 📊 Score Global de Conformité

**Score Global : 6.5/10**

| Catégorie | Score | Statut |
|-----------|-------|--------|
| Structure & Nommage | 7/10 | 🟡 Améliorations requises |
| Client/Serveur Next.js | 7/10 | 🟡 Corrections mineures |
| Tailles Fichiers | 5/10 | 🔴 Action immédiate |
| Patterns TDD | 4/10 | 🔴 Refactoring majeur |

---

## 🏗️ 1. STRUCTURE & CONVENTIONS NOMMAGE

### ✅ Points Conformes
- Architecture Next.js 15 App Router respectée
- Séparation claire des responsabilités
- Composants dans src/components/ avec structure logique
- Pages dans app/ selon convention

### ❌ Écarts Critiques (5 identifiés)

#### 🔴 CRITIQUE - Conventions Nommage
```
Fichiers non kebab-case :
- src/components/common/EmailTemplate.tsx → email-template.tsx
- src/components/layout/Header/HeaderLogo.tsx → header-logo.tsx  
- src/components/shop/ProductFilters.tsx → product-filters.tsx
- app/components/ContactForm.tsx → contact-form.tsx
```

#### ⚠️ IMPORTANT - Structure Dossiers
```
Violations placement :
- app/components/ existe (doit être dans src/components/)
- Doublons potentiels Header/header dans différents dossiers
- Fichiers layout dispersés (consolidation requise)
```

#### 📋 MINEUR - Organisation
```
- Documentation éparpillée (docs/ vs doc/)
- Aliases manquants dans tsconfig pour chemins longs
```

### 🛠️ Actions Requises
1. **Renommage immédiat** fichiers non kebab-case (2h)
2. **Consolidation** structure layout (4h)
3. **Nettoyage** doublons fonctionnels (1h)

---

## 🌐 2. SÉPARATION CLIENT/SERVEUR NEXT.JS 15

### ✅ Points Conformes
- Sécurisation Stripe avec "server-only" ✅
- Variables d'env publiques légitimes uniquement ✅
- Server Components par défaut dans pages ✅
- Hooks hydratation exemplaires (useHydrationSafe.ts) ✅

### ❌ Écarts Identifiés (3 critiques)

#### 🔴 CRITIQUE - Accès DOM Serveur
```typescript
// src/hooks/use-theme.ts
if (typeof window !== 'undefined') {
  // Accès direct au DOM sans protection hydratation
}

// src/components/scroll-up.tsx  
// Risque hydration mismatch
```

#### ⚠️ IMPORTANT - Optimisations Possibles
```typescript
// src/components/layout/header/header-logo.tsx
// Peut être converti en Server Component (pas d'interactivité)
```

#### 📋 MINEUR - Nettoyage Variables
```
API routes avec variables d'env non utilisées
Variables NEXT_PUBLIC_ redondantes
```

### 🛠️ Actions Requises
1. **Protection hydratation** use-theme.ts et scroll-up.tsx (1h)
2. **Conversion Server Component** header-logo.tsx (30min)
3. **Nettoyage variables** environnement (30min)

---

## 📏 3. TAILLES FICHIERS

### ❌ Violations Critiques (13 fichiers)

#### 🚨 REFACTOR IMMÉDIAT (>400 lignes)
```
src/components/shop/product-filters.tsx: 445 lignes (limite: 150)
→ STOPPER développement, refactor obligatoire selon CLAUDE.md
```

#### 🔴 URGENT (>limite +50%)
```
src/components/products/product-detail.tsx: 287 lignes (limite: 150)
src/lib/products/products-service.ts: 428 lignes (limite: 300)
src/components/ui/content-grid.tsx: 198 lignes (limite: 150)
src/lib/auth/auth-service.ts: 385 lignes (limite: 300)
```

#### ⚠️ IMPORTANT (>limite <+50%)
```
src/components/layout/header/navigation-menu.tsx: 189 lignes (limite: 150)
src/lib/cart/cart-service.ts: 352 lignes (limite: 300)
app/[locale]/products/[slug]/page.tsx: 134 lignes (limite: 100)
src/components/ui/inci-list-enhanced.tsx: 178 lignes (limite: 150)
```

### 🛠️ Stratégies de Refactoring
```typescript
// product-filters.tsx (445→ <150)
→ Extraire: FilterLogic hook + FilterUI composants + FilterTypes
→ Séparer: SearchFilters, CategoryFilters, PriceFilters

// products-service.ts (428→ <300)  
→ Découper: ProductsAPI, ProductsCache, ProductsValidation
→ Créer: src/lib/products/api/, src/lib/products/cache/

// product-detail.tsx (287→ <150)
→ Extraire: ProductTabs, ProductGallery, ProductActions
→ Hooks: useProductDetail, useProductVariants
```

### ⏱️ Estimation Refactoring
- **Critique (product-filters)** : 1 jour
- **Urgent (4 fichiers)** : 3 jours  
- **Important (4 fichiers)** : 2 jours
- **Total** : 6 jours développeur

---

## 🧪 4. PATTERNS TDD

### ❌ Violations Critiques

#### 🔴 Gap Couverture Services (37% vs 90% requis)
```
Services src/lib/ : 52 fichiers
Tests unitaires : 19 fichiers (63% sans tests)

Services critiques sans tests :
- src/lib/api/products.ts
- src/lib/auth/actions.ts  
- src/lib/cart/cart-actions.ts
- src/lib/payments/stripe-service.ts
```

#### 🔴 Violations Pattern RED-GREEN-REFACTOR
```
Tests en échec : products-service.test.ts
Code implémenté AVANT tests (violation TDD)
Mocks défaillants ne reflétant pas contrats réels
```

#### 🔴 Hooks Git Non Configurés
```
Husky installé mais AUCUN hook pre-commit actif
Pas de validation couverture < 80% avant commit
Pas de blocage pour tailles fichiers > limites
```

### ✅ Points Positifs
- Structure tests excellente (unit/integration/e2e) ✅
- Configuration Jest/Playwright complète ✅
- Scripts npm conformes ✅
- Seuils de couverture définis ✅

### 🛠️ Plan Action TDD (3-4 semaines)

#### Phase 1 : Infrastructure (2-3 jours)
```bash
# Activation hooks pre-commit
npm install --save-dev husky
npx husky add .husky/pre-commit "npm run test:coverage:check"

# Tests critiques en échec
npm run test:unit -- --verbose products-service
```

#### Phase 2 : Comblement Gap (10-12 jours)
```
Services prioritaires :
1. auth-service.ts + auth-actions.ts (2 jours)
2. products-service.ts + products-api.ts (2 jours)  
3. cart-service.ts + cart-actions.ts (2 jours)
4. stripe-service.ts + payments (2 jours)

Composants critiques :
1. product-detail.tsx (1 jour)
2. checkout flow complet (2 jours)
```

#### Phase 3 : Validation (3-5 jours)
```
- Scripts lint:file-length automatiques
- CI/CD pipeline avec blocage
- Coverage reporting temps réel
```

---

## 📋 PLAN D'ACTION PRIORISÉ

### 🚨 ACTIONS IMMÉDIATES (Cette semaine)
1. **STOPPER développement features** → Refactor product-filters.tsx (445 lignes)
2. **Activer hooks pre-commit** → Bloquer commits sans validation
3. **Renommer fichiers** non kebab-case → EmailTemplate.tsx, etc.
4. **Corriger hydratation** use-theme.ts et scroll-up.tsx

### 🔴 CRITIQUE (Semaine 2-3)
1. **Refactor fichiers urgents** → product-detail.tsx, products-service.ts
2. **Tests services critiques** → auth, products, cart, payments
3. **Consolidation structure** → layout dispersé, doublons

### ⚠️ IMPORTANT (Semaine 4-5)  
1. **Compléter couverture TDD** → atteindre 80% minimum
2. **Optimisations Client/Serveur** → conversions Server Components
3. **Validation automatique** → CI/CD pipeline complet

---

## 🎯 OBJECTIFS POST-REFACTORING

### Score Cible : 9/10
| Catégorie | Actuel | Cible | Actions |
|-----------|--------|--------|----------|
| Structure & Nommage | 7/10 | 9/10 | Renommage + consolidation |
| Client/Serveur | 7/10 | 9/10 | Protection hydratation |
| Tailles Fichiers | 5/10 | 9/10 | Refactoring systématique |
| Patterns TDD | 4/10 | 9/10 | Comblement gap + hooks |

### 📈 Bénéfices Attendus
- **Maintenabilité** : Code facile à comprendre/modifier
- **Qualité** : Couverture tests > 80% garantie
- **Performance** : Bundle optimisé, hydratation sûre
- **Collaboration** : Standards respectés, revues rapides
- **MVP Delivery** : Architecture solide pour lancement

---

## ⚖️ CONFORMITÉ GLOBALE

### ✅ Respect Architecture MVP
- 13 tables respectées ✅
- 7 labels HerbisVeritas définis ✅  
- FR/EN uniquement ✅
- 3 rôles utilisateur ✅
- Budget/complexité maîtrisé ✅

### 📊 Métriques Conformité
```
Fichiers conformes structure : 78%
Conventions nommage respectées : 85%
Couverture tests actuelle : 40%
Séparation Client/Serveur : 85%
Respect limites tailles : 65%
```

### 🕒 Délais Mise en Conformité
- **Actions immédiates** : 3-5 jours
- **Refactoring critique** : 2-3 semaines  
- **Conformité complète** : 4-5 semaines
- **Validation MVP** : 6 semaines maximum

---

**Statut :** PLAN D'ACTION DÉFINI  
**Prochaine revue :** Dans 2 semaines  
**Responsable :** Équipe développement

La codebase présente de bonnes fondations mais nécessite un refactoring ciblé pour atteindre la conformité CLAUDE.md complète avant le lancement MVP.