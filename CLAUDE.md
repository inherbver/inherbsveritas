# CLAUDE - Configuration de Comportement HerbisVeritas V2

## 📋 Instructions Permanentes

Ce fichier définit les **patterns de comportement obligatoires** que Claude doit suivre systématiquement lors du développement de HerbisVeritas V2.

**⚠️ CRITIQUE : Claude DOIT consulter ce fichier avant CHAQUE action significative.**

---

## 🎯 Contexte Projet

- **Projet :** HerbisVeritas V2 - E-commerce cosmétique bio
- **Stack :** Next.js 15 + TypeScript + Supabase + next-intl 
- **Architecture :** MVP 13 tables, 12 semaines de développement
- **Objectif :** Launch-ready sous €125k budget

---

## 🔧 Patterns de Développement

### 1. **Lecture Systématique Obligatoire**
Avant TOUTE action, Claude DOIT lire dans cet ordre :
- [ ] `CLAUDE.md` (ce fichier)
- [ ] `docs/DEVELOPMENT_PLAN_MVP.md` (roadmap)
- [ ] `docs/DATABASE_SCHEMA_MVP.md` (schéma actuel)
- [ ] `.env.local` (configuration)

### 2. **Architecture MVP Stricte**
- ✅ **UNIQUEMENT** les 13 tables validées
- ✅ **UNIQUEMENT** les 7 labels HerbisVeritas définis
- ✅ **UNIQUEMENT** FR/EN pour MVP (DE/ES → V2) - Architecture évolutive simple
- ✅ **UNIQUEMENT** 3 rôles users (user/admin/dev)
- ❌ **JAMAIS** ajouter de complexité non-MVP

### 3. **Gestion des Fichiers**
```bash
# TOUJOURS lire avant d'éditer
Read → Edit/Write
# JAMAIS écraser sans lire
# TOUJOURS préserver les patterns existants
```

### 4. **TodoWrite Obligatoire**
- ✅ Créer todo AVANT de commencer une tâche multi-étapes
- ✅ Marquer in_progress IMMÉDIATEMENT au début
- ✅ Marquer completed DÈS que fini
- ✅ Nettoyer la liste si obsolète

### 5. **TypeScript Strict - Context7 Patterns**
**🚫 INTERDICTION ABSOLUE du type `any` :**
- ✅ **TOUJOURS** utiliser `unknown` puis type guards
- ✅ **TOUJOURS** generic constraints `<T extends Something>`
- ✅ **TOUJOURS** validation runtime avec Zod
- ✅ **TOUJOURS** branded types pour domaine métier
- ❌ **JAMAIS** `any`, `object`, ou types implicites
- ❌ **JAMAIS** `as any` ou cast dangereux

**Patterns Obligatoires :**
```typescript
// ✅ Type guards au lieu de any
function isApiResponse(data: unknown): data is ApiResponse {
  return typeof data === 'object' && data !== null && 'result' in data;
}

// ✅ Generic constraints
function updateEntity<T extends HasId>(entity: T, updates: Partial<T>): T

// ✅ Branded types pour sécurité domaine
type ProductId = string & { readonly _brand: 'ProductId' };
```

### 6. **HTML Sémantique - Priorité aux Balises Natives**
**🎯 RÈGLE D'OR : Balises sémantiques > div :**
- ✅ `<main>`, `<section>`, `<article>`, `<aside>`, `<nav>`
- ✅ `<header>`, `<footer>`, `<figure>`, `<figcaption>`
- ✅ `<button>` au lieu de `<div onClick>`
- ✅ `<form>`, `<fieldset>`, `<legend>` pour formulaires
- ❌ **JAMAIS** `<div>` quand une balise sémantique existe
- ❌ **JAMAIS** `<span onClick>` au lieu de `<button>`

**Justification requise :** Chaque `<div>` doit avoir une raison valide ou être remplacé.

### 7. **Commits - Convention Obligatoire**
**🎯 EXIGENCE : Conventional Commits en français concis :**
- ✅ **Format** : `type(scope): description courte`
- ✅ **Types** : `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`
- ✅ **Langue** : Français pour description
- ✅ **Longueur** : Max 50 caractères pour titre
- ✅ **Exemples** :
  - `feat(products): ajout labels HerbisVeritas`
  - `fix(auth): correction rôles utilisateur`
  - `refactor(db): migration vers schéma 13 tables`

**Justification requise :** Chaque commit doit être traçable et lié au plan MVP.

### 8. **Hydration Mismatch - Prévention Obligatoire**
**🚫 ZERO TOLERANCE pour les hydration mismatches :**
- ✅ **TOUJOURS** `typeof window !== 'undefined'` pour browser APIs
- ✅ **TOUJOURS** `useEffect` pour client-only logic
- ✅ **TOUJOURS** `dynamic` avec `{ ssr: false }` pour composants client
- ✅ **TOUJOURS** `suppressHydrationWarning` pour dates/times
- ❌ **JAMAIS** `window`, `localStorage`, `Date.now()` au render initial
- ❌ **JAMAIS** contenu différent server vs client

**Patterns Anti-Hydration :**
```typescript
// ✅ Client-only component
const ClientOnly = dynamic(() => import('./ClientComponent'), { ssr: false });

// ✅ Safe browser API access  
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <div>Loading...</div>;

// ✅ Safe date rendering
<time suppressHydrationWarning>{new Date().toLocaleString()}</time>
```

### 9. **Documentation Traçable**
Chaque modification DOIT être :
- 📝 Documentée avec raison business
- 🏷️ Taguée avec version/date
- 🔗 Liée au plan MVP
- ✅ Validée contre l'architecture
- 🔒 Typée strictement sans `any`

---

## 🚫 Interdictions Strictes

### ❌ **Ne JAMAIS faire :**
- Créer des tables non-MVP
- Ajouter des langues autres que FR/EN
- Complexifier au-delà du plan MVP
- Modifier le schéma 13 tables sans validation
- Ignorer les 7 labels HerbisVeritas définis
- Créer des features non-planifiées
- Bypasser la documentation
- **UTILISER `any` en TypeScript**
- **Utiliser `<div>` quand balise sémantique existe**
- **Omettre validation runtime (Zod)**
- **Cast dangereux `as any` ou `as unknown as T`**
- **Créer hydration mismatches (server ≠ client)**
- **Accéder `window`/`localStorage` au render initial**
- **Dates/times sans `suppressHydrationWarning`**

### ❌ **Ne JAMAIS oublier :**
- Lire CLAUDE.md avant chaque action
- Vérifier l'architecture MVP
- Documenter les changements
- Maintenir la traçabilité
- Respecter le budget temps/complexité

---

## ✅ Validations Requises

Avant CHAQUE modification importante :
1. **Cohérence MVP** : Est-ce dans le plan 12 semaines ?
2. **Architecture** : Respecte les 13 tables ?
3. **Business** : Sert les objectifs de lancement ?
4. **Simplicité** : Minimal viable ?
5. **Documentation** : Traçable pour nouveaux devs ?

---

## 🎯 Objectifs Business à Garder en Tête

- 🚀 **Launch ready** en 12 semaines maximum
- 💰 **Budget** sous €125k année 1  
- 👥 **Support** 1,000+ utilisateurs simultanés
- 🛒 **E-commerce** complet (panier invité + Stripe)
- 📝 **CMS** autonome pour contenu
- 🏷️ **Labels HerbisVeritas** + système partenaires
- 🌐 **i18n** FR/EN seulement

---

## 🔄 Workflow Standard

```mermaid
graph TD
    A[Demande utilisateur] --> B[Lire CLAUDE.md]
    B --> C[Lire docs MVP]
    C --> D[Valider vs architecture]
    D --> E{MVP conforme?}
    E -->|Non| F[Refuser/Simplifier]
    E -->|Oui| G[TodoWrite]
    G --> H[Implémenter]
    H --> I[Documenter]
    I --> J[Marquer complété]
```

---

## 📞 Points d'Escalade

Si **conflit** entre demande utilisateur et architecture MVP :
1. 🛑 **STOPPER** l'action
2. 📋 **EXPLIQUER** le conflit architecture
3. 💡 **PROPOSER** alternative MVP-compliant
4. ✅ **ATTENDRE** validation utilisateur
5. 📝 **DOCUMENTER** la décision

---

## 🔧 Configuration Supabase

- **Project ID :** `mntndpelpvcskirnyqvx`
- **URL :** `https://mntndpelpvcskirnyqvx.supabase.co`
- **Migration actuelle :** `001_mvp_schema.sql`
- **État attendu :** 13 tables + 7 enums + RLS

---

## 📚 Références Critiques

- `docs/DEVELOPMENT_PLAN_MVP.md` → Planning 12 semaines
- `docs/DATABASE_SCHEMA_MVP.md` → Architecture technique
- `src/types/database.ts` → Types TypeScript MVP
- `supabase/migrations/001_mvp_schema.sql` → Schéma SQL
- `package.json` scripts → Commandes npm

---

**Version :** 1.0.0  
**Dernière MAJ :** 2025-01-28  
**Statut :** ✅ ACTIF

---

## 🎯 Prochaines Étapes Prioritaires

Selon le plan MVP, les prochaines actions sont :
1. ✅ Schéma 13 tables (FAIT)
2. 🔄 Configuration labels HerbisVeritas (EN COURS)
3. 📋 Setup shadcn/ui design system
4. 🌐 Configuration next-intl FR/EN
5. 👤 Système auth 3 rôles

**Claude : Consulte TOUJOURS cette liste avant de suggérer des actions !**