# Dataflow — Produits (HerbisVeritas V2 MVP)

Ce document regroupe les **commentaires ROOT** à placer en tête des fichiers clés.  
Objectif : homogénéité du flux de données, zéro hallucination, zéro usage inventé.

**Architecture MVP :** Une seule table `products` - pas de variants/images séparées.

---

## 1) Types & Contrat

**Fichier :** `src/lib/types/domain/product.ts`

```ts
/**
 * ROOT: DATA CONTRACT — PRODUCTS MVP (Source of Truth)
 * Table unique: products (13 tables MVP - pas de product_variants/product_images)
 * DTO_VERSION: 1
 * ProductDTO:
 *  - id: uuid; slug: string(unique); name: string; description_short/long: string|null
 *  - status: 'active'|'inactive'|'draft'
 *  - price: number (en unités 19.90, PAS en cents); currency: 'EUR'
 *  - image_url: string|null (UNE seule image MVP)
 *  - labels: ProductLabel[] (7 labels HerbisVeritas fixes)
 *  - category_id: uuid|null; inci_list: string[]|null
 *  - stock: number; unit: string; is_active: boolean; is_new: boolean
 *  - translations: JSONB { fr?: {...}, en?: {...} } (inline, pas table séparée)
 *  - timestamps: created_at, updated_at
 * Invariants:
 *  - Tableaux optionnels => [] (jamais `undefined`)
 *  - Prix TOUJOURS en unités (pas cents - différence avec dataflow générique)
 *  - Labels: enum strict 7 valeurs HerbisVeritas (pas extensible MVP)
 *  - Changement de shape => bump DTO_VERSION + MAJ clés React Query + tests + docs
 */
```

## 2) Validation & Mapping

**Fichier :** `src/lib/schemas/product.ts`

```ts
/**
 * ROOT: VALIDATION SCHEMA — PRODUCTS MVP
 * Rôle:
 *  - Valider DB -> DTO (enums stricts ProductLabel; nullables normalisés; arrays jamais `undefined`)
 *  - Centraliser les règles (prix unités, status, i18n JSONB)
 *  - Fonctions pures (aucun I/O); synchrones
 * Erreurs:
 *  - Rejeter toute valeur hors enum ProductLabel (7 valeurs fixes)
 *  - Ne jamais corriger silencieusement (throw explicite)
 *  - Prix négatifs rejetés
 */
```

**Fichier :** `src/lib/mappers/product.mapper.ts`

```ts
/**
 * ROOT: MAPPER — PRODUCTS MVP
 * Pipeline:
 *  DBRow (table products) -> ProductDTO (via schema) -> ProductViewModel (UI-ready)
 * Règles:
 *  - Prix RESTENT en unités (19.90, pas 1990 cents)
 *  - Arrays jamais `undefined` (-> [])
 *  - i18n: sélectionner champs localisés JSONB ou fallback documenté
 *  - image_url null => placeholder image par défaut
 *  - Labels: mapper enum -> display text via LABEL_DISPLAY
 * Interdits:
 *  - AUCUN accès réseau ni lecture storage
 *  - AUCUNE mutation globale
 *  - AUCUNE conversion prix (restent en unités)
 */
```

## 3) Accès Données

**Fichier :** `src/lib/supabase/products.queries.ts`

```ts
/**
 * ROOT: DATA ACCESS — PRODUCTS MVP
 * Table unique: products (colonnes: id, slug, name, price, image_url, labels[], category_id, etc.)
 * Lecture publique (storefront):
 *  - SELECT avec WHERE is_active=true AND status='active'
 *  - Pagination/tri côté serveur; jamais de full-scan client
 *  - Utiliser les filtres: category_id, labels (ANY), price range, search (name ilike)
 * Sécurité:
 *  - RLS: anon => SELECT uniquement status='active' et is_active=true
 *  - Aucune clé service_role côté client; secrets côté serveur exclusivement
 * Contrat retour:
 *  - { products: ProductDTO[], pagination?: { total, page, pageSize } }
 */
```

## 4) API Routes

**Fichier :** `app/api/products/route.ts`

```ts
/**
 * ROOT: API CONTRACT — GET /api/products
 * Query: ?category=uuid&labels=bio,recolte_main&search=term&page=1&limit=24
 * Response: { products: ProductDTO[] } (pagination dans headers si besoin)
 * Cache: public + stale-while-revalidate; revalidateTag('products') sur mutation
 * Erreurs: 400 (query invalide) | 500 (inattendu)
 * Interdits: création de nouvelles libs; contournement RLS; exposition service_role
 */
```

**Fichier :** `app/api/products/[slug]/route.ts`

```ts
/**
 * ROOT: API CONTRACT — GET /api/products/[slug]
 * Path: slug unique; retourne ProductDTO détaillé (status='active' en public)
 * Cache: public + S-W-R; revalidateTag('products') sur mutation
 * Erreurs: 404 si produit inexistant/non publié; 500 sinon
 */
```

## 5) Hooks React Query

**Fichier :** `src/hooks/use-products.ts`

```ts
/**
 * ROOT: REACT QUERY POLICY — PRODUCTS (LIST)
 * QueryKey: ['products', { category, labels, search, page, limit, DTO_VERSION: 1 }]
 * Cache: staleTime=60_000ms; placeholderData=page précédente
 * select(): map DTO -> ViewModel via mapper (jamais dans les composants)
 * Retry: 3x avec backoff exponentiel
 * Interdits: fetch direct dans composants; keys non déterministes; mutation state côté client
 */
```

**Fichier :** `src/hooks/use-product.ts`

```ts
/**
 * ROOT: REACT QUERY POLICY — PRODUCT (DETAIL)
 * QueryKey: ['product', { slug, DTO_VERSION: 1 }]
 * Cache: staleTime=300_000ms (5min - contenu stable)
 * Règles: toujours passer par mapper -> ViewModel; jamais d'accès DB brut depuis l'UI
 * Enabled: uniquement si slug fourni et non vide
 */
```

## 6) UI Components

**Fichier :** `src/components/products/product-card.tsx`

```ts
/**
 * ROOT: UI CONTRACT — ProductCard
 * Props: ProductViewModel (jamais un DBRow direct)
 * AUCUN fetch ici; affichage pur + micro-interactions
 * Prix: formatPrice(price, 'EUR', locale) - price déjà en unités
 * Images: image_url || getDefaultProductImage()
 * Labels: LABEL_DISPLAY[label] pour texte; LABEL_BADGE_VARIANTS[label] pour styling
 */
```

**Fichier :** `src/components/products/product-grid.tsx`

```ts
/**
 * ROOT: UI CONTRACT — ProductGrid
 * Entrée: ProductViewModel[] (provenant des hooks)
 * AUCUN fetch; pas de joins/tri coûteux ici; layout + virtualization si >100 items
 * Skeleton: ProductCardSkeleton pendant loading
 */
```

## 7) Helpers

**Fichier :** `src/lib/format/price.ts`

```ts
/**
 * ROOT: PRICE FORMATTER MVP (SINGLE SOURCE OF TRUTH)
 * formatPrice(price: number, currency='EUR', locale='fr-FR'): string
 * Entrée: prix en unités (19.90, pas 1990 cents)
 * Sortie: "19,90 €" ou "€19.90"
 * Interdits: dupliquer la logique prix dans l'UI; convertir cents ↔ unités (MVP pas de cents)
 */
```

**Fichier :** `src/lib/images/product-images.ts`

```ts
/**
 * ROOT: IMAGE POLICY MVP
 * getDefaultProductImage(): string - image par défaut si image_url null
 * getResponsiveImageProps(url): { src, srcset?, sizes? }
 * Responsive: [320, 480, 768] (webp si dispo, fallback jpg)
 * Ne jamais upscaler > original; conserver ratio; pas d'URL hardcodées
 */
```

## 8) Sécurité & Policies

**Fichier :** `supabase/policies/products.sql`

```sql
-- ROOT: RLS INTENT — PRODUCTS MVP
-- anon: SELECT uniquement sur is_active=true AND status='active'
-- authenticated: mêmes restrictions en lecture storefront (pas d'admin UI MVP)
-- service_role: accès complet (server actions/cron); JAMAIS exposé au client
```

## 9) Tests

**Fichier :** `tests/unit/products/api.spec.ts`

```ts
/**
 * ROOT: TEST CONTRACT — /api/products
 * Cas min: 200 (happy path), 400 (query invalide), 500 (erreur)
 * Goldens: snapshots DTO & ViewModel (prévenir drifts)
 * Si DTO_VERSION change: régénérer snapshots + mettre à jour clés
 * Mock: Supabase responses, pas de vraie DB en tests unitaires
 */
```

**Fichier :** `tests/unit/products/mappers.spec.ts`

```ts
/**
 * ROOT: TEST CONTRACT — MAPPERS PRODUCTS MVP
 * Doit couvrir: normalisation nullables, enums ProductLabel stricts, prix unités, i18n JSONB fallback
 * Cas edge: image_url null, labels vide, translations manquantes
 * Interdits: mocks réseau; dépendances non déterministes
 */
```

## 10) Spécificités HerbisVeritas MVP

**Fichier :** `src/lib/constants/product-labels.ts`

```ts
/**
 * ROOT: HERBISVERITAS LABELS — BUSINESS RULES
 * 7 labels fixes (pas extensible MVP):
 *  - recolte_main, bio, origine_occitanie, partenariat_producteurs, 
 *    rituel_bien_etre, rupture_recolte, essence_precieuse
 * LABEL_DISPLAY: mapping label -> texte affiché
 * LABEL_BADGE_VARIANTS: mapping label -> classe CSS variant
 * Interdits: ajout de nouveaux labels sans validation métier + bump DTO_VERSION
 */
```

---

## 📌 Checklist Intégration MVP

✅ **Créer structure:**
- [ ] `docs/claude/` dossier
- [ ] Types domain unifiés
- [ ] Schemas validation Zod
- [ ] Mappers DB → DTO → ViewModel
- [ ] Helpers prix et images

✅ **Adapter existant:**
- [ ] Hooks React Query avec keys DTO_VERSION
- [ ] API routes contrat normalisé
- [ ] Composants avec props ViewModel seulement

✅ **Ajouter ROOT comments:**
- [ ] Copier/coller headers dans chaque fichier listé
- [ ] Vérifier cohérence avec schema 13 tables MVP
- [ ] Tester que build passe

✅ **Documentation:**
- [ ] Mettre à jour CLAUDE.md avec référence dataflow
- [ ] Commit avec message conventionnel français

**⚠️ Spécificités MVP à respecter:**
- Prix en unités (pas cents)
- Une image par produit (pas gallery)
- 7 labels HerbisVeritas fixes
- JSONB translations inline
- Table unique `products`