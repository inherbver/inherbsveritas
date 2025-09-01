# 🎯 Mocks Supabase Centralisés + Amélioration Tests

**Générée le :** 2025-01-28  
**Phase MVP :** Tests Unitaires - Centralisation et Amélioration Coverage
**Status :** ✅ **MOCKS CENTRALISÉS OPÉRATIONNELS**

---

## ✅ Réalisations Accomplies

### **Configuration Centralisée Complete**
- **Factory function** `createMockSupabaseClient()` dans `jest.setup.js` 
- **Coverage modules** : `@/lib/supabase/client`, `@/lib/supabase/server`, `@supabase/ssr`
- **Tests middleware** : 17/17 passent maintenant ✅
- **Élimination** mocks dupliqués dans 15+ fichiers

### **Pattern d'Usage Établi**
```typescript
// Usage simple - mocks automatiques
const mockSupabase = global.createMockSupabaseClient({
  auth: { getUser: customMockFn }
})
```

---

## 🛠️ Actions Spécifiques Immédiates

### 1. **Compléter CSS Variables Manquantes (45 min)**
```bash
# Mettre à jour app/globals.css avec variables référencées
# Définir: --primary-50 à --primary-900
# Définir: --secondary-50 à --secondary-900  
# Définir: --accent-50 à --accent-900
# Variables typography, spacing, shadow, etc.
```

### 2. **Améliorer Tests Coverage (60 min)**
```bash
# Objectif: Passer de 29.77% → 80%+
npm run test:tdd
# Créer tests manquants:
# - tests/unit/components/ui/button.test.tsx
# - tests/unit/components/ui/input.test.tsx
# - tests/unit/components/ui/card.test.tsx
```

**Pattern TDD obligatoire maintenu :**
- 🔴 Tests pour composants existants
- 🟢 Couverture cases d'usage critiques  
- 🔵 Refactor si nécessaire

### 3. **Business Logic Phase 2 (90 min)**

**Categories Hiérarchiques :**
- Types TypeScript avec i18n JSONB
- CRUD categories avec composants UI existants
- Navigation tree utilisant Card components

**Labels HerbisVeritas :**
- Enum 7 types (Bio, Naturel, Vegan, etc.)
- Integration ProductCard existant
- Tests business rules

**État Zustand Panier :**
- Store simple MVP (extensible V2)
- Persistence localStorage
- Merge cart guest→user
- Tests state management

---

## 📋 Validation Réussite Étape

### Critères de Completion ✅
- [ ] **CSS Variables** : Toutes les variables Tailwind définies dans globals.css
- [ ] **Tests Coverage** : > 80% (actuellement 29.77%)
- [ ] **Business Logic** : Categories hiérarchiques opérationnelles
- [ ] **Labels HerbisVeritas** : Enum 7 types intégré ProductCard
- [ ] **Zustand Store** : Panier MVP avec persistence localStorage
- [ ] **Build** : `npm run build` succès
- [ ] **Types** : `npm run typecheck` succès

### Tests de Validation
```bash
# Suite validation complète
npm run test:unit -- --testPathPattern="components/ui"
npm run build
npm run typecheck
npm run lint
```

---

## 🔄 Étape Suivante (Après Completion)

**Phase 2, Semaine 4 :**
1. **Catalogue Frontend** avec filtres/recherche
2. **ProductList** utilisant ProductCard standardisé
3. **i18n Frontend** messages centralisés FR/EN

**Préparation Semaine 5 :**
- Store Zustand évolutif vers slices pattern
- Layout Components (Header, Footer responsive)
- Cart UI slide-over avec composants existants

---

## 🎨 Design Tokens HerbisVeritas

### Couleurs Primaires
```css
/* globals.css - Variables CSS HerbisVeritas */
:root {
  --color-primary: 120 50% 35%;    /* Vert bio principal */
  --color-secondary: 45 25% 20%;   /* Brun terre */
  --color-accent: 90 35% 45%;      /* Vert clair */
}
```

### Typography Scale
```css
/* Échelle typographique cohérente */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
```

---

## 📚 Ressources Context7 Utilisées

**shadcn/ui Best Practices :**
- Structure progressive MVP→V2
- CSS variables pour thème cohérent
- TypeScript strict + validation Zod
- Tests Jest + React Testing Library

**Next.js 15 App Router :**
- Server/Client Components séparation
- Bundling optimisé composants
- Performance Core Web Vitals < 2s

---

## ⚡ Commande de Démarrage

```bash
# Démarrer cette étape immédiatement
# 1. Finaliser CSS variables
code app/globals.css

# 2. Améliorer tests coverage
npm run test:tdd

# 3. Implémenter business logic
mkdir -p src/types src/lib src/stores
```

---

**Durée estimée :** 3-4 heures  
**Priorité :** 🔥 **CRITIQUE** (transition Phase 1→2)  
**Dependencies :** ✅ Design system avancé déjà en place

Cette étape finalise **Phase 1** et lance **Phase 2 : E-commerce Core** du plan MVP.