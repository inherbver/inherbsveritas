# Plan d'Implémentation - Page ProductDetail avec Onglets

## 📋 Contexte

Refactorisation de la page ProductDetail actuelle pour implémenter un système d'onglets moderne et accessible utilisant shadcn/ui Tabs. L'objectif est de remplacer l'affichage linéaire par une organisation en onglets pour améliorer l'UX et la lisibilité des informations produit.

**État actuel :** ProductDetail affiche toutes les informations en cards empilées verticalement  
**État cible :** Organisation en onglets selon les données disponibles du produit

## 🎯 Objectifs

### Fonctionnels
- ✅ Organisation claire des informations produit en sections logiques
- ✅ Affichage conditionnel des onglets selon les données disponibles
- ✅ Expérience utilisateur cohérente avec l'identité HerbisVeritas
- ✅ Support mobile avec navigation tactile optimisée

### Techniques  
- ✅ Utilisation du composant Tabs shadcn/ui déjà installé
- ✅ Respect des standards d'accessibilité WCAG 2.1
- ✅ Performance optimisée avec lazy loading
- ✅ Compatible avec les types Product MVP existants
- ✅ Architecture respectant les limites CLAUDE.md (<150 lignes)

## 🏗️ Architecture Composants

### Structure Cible

```
ProductDetail (≤150 lignes)
├── ProductHeader (image + infos principales)
├── ProductActions (quantité + panier + favoris)  
└── ProductTabs (onglets conditionnels)
    ├── DescriptionTab 
    ├── InciTab
    ├── UsageTab
    ├── PropertiesTab
    └── ConservationTab
```

### Responsabilités

**ProductDetail** (composant principal)
- Orchestration générale
- État quantité et ajout panier
- Logique onglets disponibles
- Layout responsive grid

**ProductTabs** (sous-composant)
- Génération dynamique des onglets
- Gestion navigation entre onglets
- Rendu conditionnel du contenu

**Onglets individuels** (composants légers)
- Affichage spécialisé par type de contenu
- Formatage approprié (listes, texte, grilles)
- Icônes et titres contextuels

## 📊 Mapping des Données Produit

### Onglets Disponibles par Données

| Onglet | Condition | Champ Product | Priorité |
|--------|-----------|---------------|----------|
| Description | `description_long` existe | `product.description_long` | 🔥 Haute |
| INCI | `inci_list.length > 0` | `product.inci_list` | 🔥 Haute |
| Usage | `usageInstructions` existe | `product.usageInstructions` | 🟡 Moyenne |
| Propriétés | `properties` existe | `product.properties` | 🟡 Moyenne |
| Conservation | Toujours affiché | Données statiques + produit | 🟢 Faible |

### Ordre d'Affichage
1. **Description** (si disponible) → Onglet par défaut
2. **INCI** (si disponible) → Information réglementaire importante
3. **Usage** (si disponible) → Conseils pratiques
4. **Propriétés** (si disponible) → Caractéristiques produit
5. **Conservation** (toujours) → Informations de conservation

## 🎨 Design et UX

### Layout Responsive

```scss
// Desktop (≥768px)
.product-detail {
  grid: "image info" / 1fr 1fr;
  
  .product-tabs {
    grid-column: 1 / -1; // Full width sous le grid principal
  }
}

// Mobile (<768px)  
.product-detail {
  grid: "image" "info" "tabs" / 1fr;
  
  .tabs-list {
    overflow-x: auto; // Scroll horizontal si nécessaire
    scroll-snap-type: x mandatory;
  }
}
```

### Système d'Icônes

| Onglet | Icône Lucide | Couleur Thème |
|--------|--------------|---------------|
| Description | `Info` | `text-primary` |
| INCI | `Beaker` | `text-green-600` |
| Usage | `Lightbulb` | `text-amber-600` |
| Propriétés | `Sparkles` | `text-purple-600` |
| Conservation | `Shield` | `text-blue-600` |

### États Visuels

**Actif :** `bg-background text-foreground shadow-sm`  
**Inactif :** `text-muted-foreground hover:bg-muted/50`  
**Focus :** `ring-2 ring-ring ring-offset-2`

## 🔧 Implémentation Technique

### Phase 1: Structure Base (2h)

**Tâches :**
1. ✅ Créer `ProductTabs` component (≤80 lignes)
2. ✅ Refactor `ProductDetail` pour intégrer onglets (≤150 lignes)
3. ✅ Logique onglets disponibles avec `useMemo`
4. ✅ Layout responsive avec Tailwind Grid

**Fichiers modifiés :**
- `src/components/products/product-detail.tsx`

**Fichiers créés :**
- `src/components/products/product-tabs.tsx`

### Phase 2: Contenu Onglets (3h)

**Tâches :**
1. ✅ Implémentation `DescriptionTab` avec prose styling
2. ✅ Implémentation `InciTab` avec formatage ingrédients
3. ✅ Implémentation `UsageTab` avec instructions étape par étape
4. ✅ Implémentation `PropertiesTab` avec bullets points  
5. ✅ Implémentation `ConservationTab` avec données statiques

**Fichiers créés :**
- `src/components/products/tabs/description-tab.tsx`
- `src/components/products/tabs/inci-tab.tsx`  
- `src/components/products/tabs/usage-tab.tsx`
- `src/components/products/tabs/properties-tab.tsx`
- `src/components/products/tabs/conservation-tab.tsx`

### Phase 3: Optimisations (1h)

**Tâches :**
1. ✅ Performance avec `React.memo` sur onglets
2. ✅ Lazy loading contenu lourd (si nécessaire)
3. ✅ Tests d'accessibilité avec lecteur d'écran
4. ✅ Tests responsive sur différents breakpoints

### Phase 4: Tests & Documentation (1h)

**Tâches :**
1. ✅ Tests unitaires `ProductTabs` component
2. ✅ Tests e2e navigation onglets Playwright
3. ✅ Documentation des composants (JSDoc)
4. ✅ Mise à jour de la doc architecture

## 📱 Spécifications Mobile

### Breakpoints
- `sm` (640px+) : Onglets avec labels complets
- `<640px` : Onglets avec icônes seulement

### Navigation Tactile
```typescript
// Configuration Tabs pour mobile
<TabsList className="w-full justify-start overflow-x-auto">
  <TabsTrigger className="flex-shrink-0 min-w-[60px]">
    <Icon className="w-4 h-4" />
    <span className="sr-only sm:not-sr-only sm:ml-2">Label</span>
  </TabsTrigger>
</TabsList>
```

### Scroll Horizontal
```css
.tabs-list-mobile {
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}

.tabs-list-mobile::-webkit-scrollbar {
  display: none;
}
```

## ♿ Accessibilité

### Standards WCAG 2.1 AA

**Navigation Clavier :**
- ✅ `Tab` : Navigation entre onglets
- ✅ `←→` : Navigation horizontale intra-onglets
- ✅ `Enter/Space` : Activation onglet
- ✅ `Home/End` : Premier/dernier onglet

**Attributs ARIA :**
```typescript
// Automatiquement gérés par Radix UI
role="tablist"           // TabsList
role="tab"               // TabsTrigger
role="tabpanel"          // TabsContent
aria-selected="true"     // Onglet actif
aria-controls="panel-id" // Association trigger→content
tabindex="0/-1"          // Focus management
```

**Labels Descriptifs :**
```typescript
<TabsTrigger 
  value="inci" 
  aria-label="Voir la composition INCI complète du produit"
>
  <Beaker className="w-4 h-4" />
  INCI
</TabsTrigger>
```

**Annonces Changements :**
- Changement d'onglet annoncé automatiquement
- État de chargement communiqué si lazy loading
- Erreurs de chargement accessibles

## 🚀 Performance

### Optimisations Bundle

**Tree Shaking :**
- Import sélectif des icônes Lucide
- Components onglets en modules séparés
- Lazy loading du contenu volumineux

**Memoization :**
```typescript
const availableTabs = React.useMemo(() => {
  return computeAvailableTabs(product)
}, [product.description_long, product.inci_list, product.properties])

const TabContent = React.memo(({ content, type }) => {
  return <FormattedContent content={content} type={type} />
})
```

### Lazy Loading Conditionnel

```typescript
// Uniquement si contenu INCI > 20 ingrédients
const InciTab = React.lazy(() => import('./tabs/inci-tab'))

// Avec Suspense fallback
<Suspense fallback={<TabContentSkeleton />}>
  <InciTab ingredients={product.inci_list} />
</Suspense>
```

## 🧪 Stratégie de Tests

### Tests Unitaires (Jest + RTL)

**Fichier :** `tests/unit/components/products/product-tabs.test.tsx`

```typescript
describe('ProductTabs', () => {
  it('affiche uniquement les onglets avec données disponibles')
  it('sélectionne le premier onglet par défaut')
  it('change d\'onglet au clic')  
  it('gère la navigation clavier')
  it('formate correctement le contenu INCI')
  it('affiche conservation même sans données spécifiques')
})
```

### Tests E2E (Playwright)

**Fichier :** `tests/e2e/product-detail-tabs.spec.ts`

```typescript
test.describe('Product Detail Tabs', () => {
  test('navigation complète entre onglets')
  test('contenu responsive selon breakpoint')
  test('accessibilité navigation clavier')
  test('chargement conditionnel des onglets')
})
```

### Tests d'Accessibilité

**Outils :**
- `@axe-core/playwright` pour tests automatisés
- Tests manuels lecteur d'écran (NVDA/JAWS)
- Validation contraste couleurs

## 📦 Livrables

### Code
- [ ] `src/components/products/product-detail.tsx` (refactorisé)
- [ ] `src/components/products/product-tabs.tsx` (nouveau)
- [ ] `src/components/products/tabs/` (5 composants onglets)

### Tests
- [ ] Tests unitaires ProductTabs
- [ ] Tests e2e navigation onglets
- [ ] Tests accessibilité

### Documentation  
- [ ] JSDoc composants
- [ ] Guide d'utilisation
- [ ] Exemple d'intégration

## ⏱️ Timeline

**Total estimé :** 7 heures  
**Répartition :**
- Phase 1 (Structure) : 2h
- Phase 2 (Contenu) : 3h  
- Phase 3 (Optimisation) : 1h
- Phase 4 (Tests/Doc) : 1h

**Jalons :**
- **J+1 :** Structure base fonctionnelle
- **J+2 :** Tous onglets implémentés
- **J+3 :** Optimisations et tests complets

## 🔍 Critères de Validation

### Fonctionnels
- ✅ Affichage conditionnel selon données produit
- ✅ Navigation fluide entre onglets
- ✅ Formatage approprié de chaque type de contenu
- ✅ Responsive design mobile/desktop

### Techniques
- ✅ Respect limite 150 lignes par fichier  
- ✅ Performance bundle (pas d'augmentation significative)
- ✅ Accessibilité WCAG 2.1 AA
- ✅ Tests coverage > 80%

### Qualité Code
- ✅ TypeScript strict sans erreurs
- ✅ Conformité conventions CLAUDE.md
- ✅ Documentation JSDoc complète
- ✅ Architecture modulaire et maintenable

---

**Version :** 1.0  
**Dernière mise à jour :** 2025-01-28  
**Statut :** 📋 Plan approuvé, prêt pour implémentation