# Stratégie de Nettoyage Composants - HerbisVeritas V2

## 📋 Situation Actuelle

**Tests Status :**
- ✅ **Tests MVP** : 38/38 passants (Button + ProductCard)
- ❌ **Tests legacy** : 18 failed, 7 passed, 25 total (274 tests restants)
- 🎯 **Objectif** : Maintenir productivité sans casser l'existant

**Structure Actuelle :**
```
src/components/
├── ui/              ✅ Nouveaux composants shadcn/ui
├── modules/         ✅ Nouvelle architecture modulaire
├── [20+ dossiers]   ❌ Anciens composants (About/, Admin/, etc.)
└── index.ts         ✅ Exports compatibilité
```

---

## 🎯 Stratégie Progressive

### Phase 1 : Isoler les Tests MVP (✅ FAIT)

**Réalisations :**
- Configuration `jest.config.mvp.js` séparée
- Script `npm run test:mvp` focalisé
- **38/38 tests passants** pour nouveaux composants

### Phase 2 : Migration Graduelle (EN COURS)

**Principe :** Migration par domaine métier, pas suppression massive

#### 2.1 Audit Composants Existants

```bash
# Composants à analyser pour migration
src/components/
├── auth/            → modules/auth/components/
├── forms/           → modules/*/components/ (selon usage)
├── Products/        → modules/boutique/components/
├── Common/          → ui/ (si réutilisable)
└── [autres]         → Évaluation cas par cas
```

#### 2.2 Migration Prioritaire

**Semaine 4 (Phase 2 E-commerce) :**
1. **Products/** → `modules/boutique/components/`
2. **Cart/** → `modules/boutique/components/`
3. **Categories/** → `modules/boutique/components/`

**Semaine 8 (Phase 3 Content) :**
4. **Articles/** → `modules/magazine/components/`
5. **Partners/** → `modules/corporate/components/`

#### 2.3 Tests Progressifs

```bash
# Pendant migration, maintenir 2 configs
npm run test:mvp     # Nouveaux composants
npm run test:legacy  # Anciens composants (à créer)
```

---

## 🛠️ Plan d'Action Immédiat

### Aujourd'hui : Pas de Disruption

**✅ Actions Sûres :**
- Garder structure actuelle intacte
- Focus sur développement nouveaux composants
- Utiliser `test:mvp` pour nouveaux développements

**❌ Actions Risquées (à éviter) :**
- Suppression massive dossiers existants
- Modification imports existants
- Cassage tests legacy

### Semaine 4 : Migration Ciblée

**🎯 Focus Boutique uniquement :**
```bash
# Migration Products → modules/boutique
1. Copier Products/ vers modules/boutique/components/
2. Mettre à jour imports progressivement  
3. Migrer tests associés
4. Garder anciens comme fallback temporaire
```

---

## 📊 Stratégie Tests

### Configuration Duale

```javascript
// jest.config.mvp.js (✅ Actuel)
testMatch: [
  'tests/unit/components/ui/**/*.test.{ts,tsx}',
  'tests/unit/components/modules/**/*.test.{ts,tsx}',
]

// jest.config.legacy.js (à créer si besoin)
testMatch: [
  'tests/unit/components/*.test.{ts,tsx}',
  'tests/unit/lib/**/*.test.{ts,tsx}',
  'tests/integration/**/*.test.{ts,tsx}',
]
```

### Scripts Package.json

```json
{
  "test:mvp": "jest --config jest.config.mvp.js",
  "test:legacy": "jest --config jest.config.legacy.js", 
  "test:all": "npm run test:mvp && npm run test:legacy"
}
```

---

## 🔍 Analyse Dépendances Critiques

### Composants Potentiellement Utilisés

**À vérifier avant suppression :**
```bash
# Rechercher imports dans le code
grep -r "from.*components/About" src/
grep -r "from.*components/Admin" app/
grep -r "import.*Header" src/
```

### Composants Sûrs à Migrer

**Bons Candidats :**
- `Products/` → `modules/boutique/`
- `Cart/` → `modules/boutique/`  
- `Articles/` → `modules/magazine/`

**Nécessitent Audit :**
- `Header/` → Peut être utilisé partout
- `Common/` → Composants partagés
- `forms/` → Utilisés par auth et admin

---

## ⚡ Actions Immédiates Recommandées

### 1. Maintenir Status Quo Structure

**Garder tous dossiers actuels** pour éviter casse
- Ne pas supprimer dossiers existants
- Laisser tests legacy échouer temporairement
- Focus développement sur nouveaux composants

### 2. Utiliser Configuration MVP

```bash
# Pour nouveau développement uniquement
npm run test:mvp       # 38/38 passants ✅
npm run test:mvp:watch # Mode watch pour TDD
```

### 3. Migration par Étapes

**Semaine 4 :** Products + Cart seulement
**Semaine 8 :** Articles seulement  
**Post-MVP :** Audit et cleanup global

---

## 🎯 Objectifs Finaux

### Court Terme (Semaines 4-12 MVP)

- ✅ Nouveaux composants 100% testés et fonctionnels
- ✅ Structure modulaire établie pour évolution V2
- ⚠️ Coexistence temporaire avec anciens composants

### Long Terme (Post-MVP V2)

- 🧹 Cleanup complet ancienne structure
- 🔄 Migration tous composants vers modules/
- 🧪 Suite de tests unifiée et optimisée

---

**Principe Clé :** Évolution progressive sans disruption du développement MVP en cours.

**Status :** 🟢 Tests MVP stables - Prêt pour développement Phase 2