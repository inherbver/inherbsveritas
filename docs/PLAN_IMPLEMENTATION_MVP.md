# 🎯 Plan d'Implémentation Logique HerbisVeritas MVP

## 📊 Analyse Actuelle vs Cible

### ✅ État Actuel (Acquis)
- Architecture Next.js 15 + Supabase + TypeScript ✅
- Base de données 13 tables + RLS ✅  
- Système i18n next-intl (FR/EN) ✅
- Shop page avec 9 produits + images ✅
- Redirection automatique `/` → `/shop` ✅

### 🎯 Cible (53 pages + 3 rôles)
- **Pages publiques** : 12 pages
- **Authentification** : 6 pages  
- **Profil utilisateur** : 6 pages
- **Administration** : 25+ pages
- **3 rôles** : user → editor → admin

Basé sur l'analyse des features exhaustives existantes dans `FEATURES_EXHAUSTIVES_PAR_ROLES.md`.

---

## 🚀 PHASE 1 : Fondations E-commerce (1-2 semaines)
*Objectif : Shop fonctionnel avec panier et pages produits*

### 🧴 1.1 Pages Produits Détaillées
- [x] **ProductDetail component** - Page `/products/[slug]` (EXISTANT - base fonctionnelle)
- [x] **Système d'onglets** (EXISTANT - `ProductTabs` component)
- [ ] **Enhancement images** - Intégration Supabase Storage avec fallbacks
- [x] **Labels HerbisVeritas** (EXISTANT - 7 badges dans ProductDetail)
- [ ] **États stock** - Améliorer indication visuelle (disponible, rupture, nouveau)

### 🛒 1.2 Système Panier Complet ✅ LARGEMENT IMPLÉMENTÉ
- [x] **Cart Sheet Modal** (EXISTANT - `CartSheet` component sophistiqué)
- [x] **Persistance invités** (EXISTANT - via hooks React Query)
- [x] **Quantités dynamiques** (EXISTANT - optimistic updates + validation stock)
- [x] **Calculs totaux** (EXISTANT - subtotal, labels analytics)
- [x] **Hook cart React Query** (EXISTANT - `use-cart-actions.ts` complet avec rollback)
- [ ] **Calculs TVA/frais port** - Logique métier à ajouter

### 📱 1.3 UI/UX Essential
- [x] **Layout responsive** (EXISTANT - Mobile-first avec Tailwind)
- [ ] **Loading states** - Améliorer skeleton components
- [ ] **Error boundaries** - Ajouter pages d'erreur custom
- [x] **Toast notifications** (BASIQUE - remplacer console par Sonner UI)

**🎯 État Actuel Phase 1 :**
- **Panier système** : 95% complet (hooks, optimistic updates, persistance)
- **ProductDetail** : 70% complet (base + onglets, manque images)
- **Toast system** : 30% complet (logique OK, UI manquante)

**✅ Livrables Phase 1 AJUSTÉS :**
- Enhancement produit detail avec images Supabase
- Toast UI avec Sonner (remplacer console logs)
- Loading states et error boundaries
- Calculs TVA/frais port sur panier

---

## 🔐 PHASE 2 : Authentification & Profil (1-2 semaines)
*Objectif : Utilisateurs peuvent créer des comptes et passer commandes*

### 🔑 2.1 Auth Supabase ✅ LARGEMENT IMPLÉMENTÉ
- [x] **Service auth** (EXISTANT - `authService` complet avec validation)
- [x] **Hooks auth** (EXISTANT - `use-auth-user`, `use-auth-state`, `use-auth-actions`)
- [x] **System 3 rôles** (EXISTANT - user/admin/dev + matrice permissions)
- [x] **LoginForm** (EXISTANT - validation complète + i18n)
- [ ] **Pages App Router** - Créer `/login`, `/register`, `/forgot-password` 
- [ ] **Middleware protection** - routes privées avec redirect
- [ ] **Callback handling** - Route `/auth/callback` pour Supabase

### 👤 2.2 Profil Utilisateur
- [ ] **Dashboard profil** (`/profile/account`) - Utiliser patterns Context7
- [ ] **Édition profil** (nom, email, téléphone) - Supabase profiles table
- [ ] **Gestion adresses** (livraison/facturation) - Schema existant
- [ ] **Changement mot de passe** - Hook Supabase auth
- [ ] **Paramètres compte** (newsletter, préférences)

### 📦 2.3 Gestion Commandes  
- [ ] **Historique commandes** (`/profile/orders`) - Query orders table
- [ ] **Détail commande** (`/profile/orders/[id]`) - Join avec order_items
- [ ] **Suivi expédition** (si tracking_number) - Column existante

**🎯 État Actuel Phase 2 :**
- **Auth service** : 95% complet (hooks, validation, permissions)
- **LoginForm** : 90% complet (manque intégration App Router)
- **Profil system** : 30% complet (hooks OK, UI manquante)

**✅ Livrables Phase 2 AJUSTÉS :**
- Pages App Router pour auth (login/register/callback)
- Middleware protection routes privées
- Components profil avec Supabase profiles
- Historique commandes utilisateur

---

## 💳 PHASE 3 : Checkout & Paiement (1-2 semaines)
*Objectif : Commandes payantes avec Stripe*

### 🛍️ 3.1 Checkout Process ✅ PARTIELLEMENT IMPLÉMENTÉ
- [x] **Stripe checkout service** (EXISTANT - `checkout.ts` avec sessions)
- [x] **CheckoutButton** (EXISTANT - component avec loading states)
- [x] **Types Stripe** (EXISTANT - interfaces complètes)
- [x] **Frais port logique** (EXISTANT - 4.90€ MVP)
- [ ] **Page checkout** (`/checkout`) - Formulaire adresses
- [ ] **Route API** (`/api/stripe/checkout`) - Endpoint création session

### 💰 3.2 Integration Stripe ✅ SERVICE READY
- [x] **Stripe Checkout Sessions** (EXISTANT - createCheckoutSession)
- [x] **Métadonnées ordres** (EXISTANT - order_id, order_number, user_id)
- [ ] **Webhooks handling** - `/api/webhooks/stripe` avec signature verification
- [ ] **Pages résultats** (`/checkout/success`, `/checkout/canceled`)
- [ ] **Email confirmations** (via Supabase Edge Functions)

### 🔒 3.3 Sécurité Commandes
- [x] **Line items validation** (EXISTANT - prix, quantité, métadonnées)
- [ ] **Validation côté serveur** - Stock disponible avant paiement
- [ ] **Webhook signature verification** - Context7 patterns
- [ ] **Audit logs** transactions critiques
- [x] **RLS policies** (EXISTANT - orders table protected)

**🎯 État Actuel Phase 3 :**
- **Stripe service** : 80% complet (session creation, line items, metadata)
- **CheckoutButton** : 90% complet (loading, error handling, redirect)
- **Webhook system** : 20% complet (logique manquante)

**✅ Livrables Phase 3 AJUSTÉS :**
- Page checkout avec sélection adresses
- Route API Stripe avec validation serveur
- Webhooks avec signature verification Context7
- Pages success/canceled avec confirmation

---

## 📰 PHASE 4 : CMS & Contenu (1-2 semaines)
*Objectif : Magazine/blog + gestion contenu*

### 📝 4.1 Blog/Magazine Public ✅ FONDATIONS EXISTANTES
- [x] **ArticleCard component** (EXISTANT - 215 lignes, utilise ContentCard)
- [x] **Types article** (EXISTANT - Article, ArticleCategory interfaces)
- [x] **Hook formatting** (EXISTANT - useArticleFormatting i18n)
- [x] **ContentCard system** (EXISTANT - layout, metadata, badges)
- [ ] **Liste articles** (`/magazine`) - Page App Router + query
- [ ] **Article détail** (`/magazine/[slug]`) - Page + fetch Supabase
- [ ] **Catégories articles** (`/magazine/category/[slug]`)
- [x] **SEO optimisé** (EXISTANT - Next.js 15 metadata API)

### 🎨 4.2 Pages Institutionnelles  
- [ ] **À propos** (`/about`) - Page statique simple
- [ ] **Contact** (`/contact`) + formulaire - ContactForm component
- [ ] **FAQ** (`/faq`) - accordéon avec ui/accordion
- [ ] **CGV/Mentions légales** (`/terms`, `/privacy`) - Pages markdown
- [ ] **Politique retours** (`/returns`, `/shipping`)

### 📧 4.3 Newsletter
- [x] **Schema subscribers** (EXISTANT - newsletter_subscribers table)
- [ ] **Formulaire inscription** (footer + modals) - Component newsletter
- [ ] **Double opt-in** email confirmation via Supabase Edge Functions

**🎯 État Actuel Phase 4 :**
- **ArticleCard system** : 90% complet (component, types, formatting)
- **Database schema** : 100% complet (articles, categories tables)
- **Pages institutionnelles** : 10% complet (structure à créer)

**✅ Livrables Phase 4 AJUSTÉS :**
- Pages App Router pour magazine (/magazine, /magazine/[slug])
- Pages institutionnelles avec formulaire contact  
- Newsletter avec double opt-in Supabase Edge Functions

---

## 👑 PHASE 5 : Administration (2-3 semaines)
*Objectif : Dashboard admin pour gestion autonome*

### ✏️ 5.1 Rôles & Permissions ✅ SYSTÈME EXISTANT
- [x] **System 3 rôles** (EXISTANT - user/admin/dev dans authService)
- [x] **Matrice permissions** (EXISTANT - rolePermissions avec hierarchie)
- [x] **Hooks permissions** (EXISTANT - useUserRole, hasRole, isAdmin)
- [x] **RLS policies** (EXISTANT - tables protégées par rôles)
- [x] **Page unauthorized** (EXISTANT - app/unauthorized.tsx)
- [ ] **Middleware protection** - Routes admin avec redirect

### 📊 5.2 Dashboard Admin
- [ ] **Accueil admin** (`/admin`) - métriques temps réel
- [ ] **Navigation admin** - sidebar/breadcrumb avec permissions
- [ ] **Layout admin** - Structure cohérente pour toutes pages admin

### 🧴 5.3 Gestion Produits (Editor+)
- [ ] **Liste produits** (`/admin/products`) - DataTable avec filtres
- [ ] **Créer produit** (`/admin/products/new`) - Form avec validation
- [ ] **Éditer produit** (`/admin/products/[id]/edit`) - Update existant
- [x] **Schema produits** (EXISTANT - 13 tables avec relations)
- [ ] **Upload images** Supabase Storage integration
- [ ] **Gestion stock** + alertes rupture basé sur low_stock_threshold

**🎯 État Actuel Phase 5 :**
- **Système permissions** : 95% complet (rôles, matrice, hooks, RLS)  
- **Pages admin** : 5% complet (unauthorized page seulement)
- **Database admin** : 100% complet (schema complet avec permissions)

**✅ Livrables Phase 5 AJUSTÉS :**
- Pages admin protégées par middleware
- Dashboard avec métriques business Supabase
- CRUD produits avec upload images Storage
- Navigation admin avec permissions contextuelles

---

## 🚀 PHASE 6 : Administration Avancée (3-4 semaines)
*Objectif : Gestion complète et autonomie totale*

### 📦 6.1 Gestion Commandes (Admin)
- [ ] **Dashboard commandes** (`/admin/orders`)
- [ ] **Mise à jour statuts** (processing → shipped → delivered)
- [ ] **Gestion paiements** + remboursements Stripe
- [ ] **Export données** commandes (CSV/Excel)

### 👥 6.2 Gestion Utilisateurs (Admin)
- [ ] **Liste utilisateurs** (`/admin/users`)
- [ ] **Modification rôles** user ↔ editor ↔ admin
- [ ] **Statistiques utilisateurs** engagement
- [ ] **Support client** (notes internes)

### 📝 6.3 Gestion Contenu (Editor+)
- [ ] **Articles magazine** (`/admin/magazine`)
- [ ] **Éditeur WYSIWYG** (TipTap)
- [ ] **Upload images** article
- [ ] **Planification publication**

### 🤝 6.4 Gestion Business
- [ ] **Partenaires** (`/admin/partners`)
- [ ] **Événements** (`/admin/markets`)  
- [ ] **Newsletter admin** (`/admin/newsletter`)

**✅ Livrables Phase 6 :**
- Gestion 360° sans développeur
- Évolutivité contenu marketing
- Business intelligence intégrée

---

## ⚡ PHASE 7 : Optimisations & Performance (2 semaines)
*Objectif : Production-ready et scalabilité*

### 🔧 7.1 Performance Technique
- [ ] **Core Web Vitals** < 2s (LCP, FID, CLS)
- [ ] **Cache stratégique** (5min revalidate)
- [ ] **Image optimization** Next.js Image
- [ ] **Bundle analysis** + splitting optimal

### 📱 7.2 UX Avancée
- [ ] **PWA basics** (manifest, service worker)
- [ ] **Offline mode** panier + navigation
- [ ] **Touch gestures** mobile optimized
- [ ] **Accessibility** WCAG 2.1 AA

### 🔐 7.3 Sécurité Production
- [ ] **Headers sécurité** (CSP, HSTS)
- [ ] **Rate limiting** API routes
- [ ] **Audit sécurité** dependencies
- [ ] **Monitoring errors** (Sentry integration)

**✅ Livrables Phase 7 :**
- Site production-ready
- Performance optimale
- Sécurité niveau entreprise

---

## 📅 Timeline Récapitulatif

| Phase | Durée | Focus | Pages Livrées |
|-------|-------|-------|---------------|
| **Phase 1** | 1-2 sem | E-commerce Core | Enhancement existant |
| **Phase 2** | 1-2 sem | Auth & Profil | 4-6 pages |
| **Phase 3** | 1-2 sem | Checkout & Pay | 2-3 pages |
| **Phase 4** | 1-2 sem | CMS & Contenu | 6-8 pages |
| **Phase 5** | 2-3 sem | Admin Core | 3-5 pages |
| **Phase 6** | 3-4 sem | Admin Avancé | 15-20 pages |
| **Phase 7** | 2 sem | Performance | Optimisations |

**🎯 Total : 12-18 semaines (3-4,5 mois) - RÉDUCTION MAJEURE**

---

## 🎯 Recommandations Stratégiques

### 🚀 Quick Wins (Phase 1-2)
- Commencer par l'expérience e-commerce
- Valider rapidement avec de vrais clients
- Itérer sur les retours utilisateur

### 💰 Revenue Focus (Phase 3)
- Prioriser checkout fonctionnel
- Tests A/B sur conversion
- Analyse abandons panier

### 📈 Growth Enablers (Phase 4-6)
- CMS pour autonomie contenu
- Admin pour scale sans devs
- Analytics pour décisions data

### ⚡ Performance Last (Phase 7)
- Optimiser une fois le MVP validé
- Focus metrics business d'abord
- Polish technique en final

---

## 📋 Checklist Validation par Phase

### Phase 1 - E-commerce Core
- [x] Product detail pages fonctionnelles (base + onglets existants)
- [x] Panier persistant (invité + connecté) - système complet implémenté
- [x] Navigation shop fluide (existant)
- [ ] Images Supabase Storage intégrées (enhancement requis)
- [x] Labels HerbisVeritas visibles (7 badges intégrés)

### Phase 2 - Auth & Profil
- [x] Service authentification (authService complet avec validation)
- [x] System 3 rôles (user/admin/dev + permissions)
- [ ] Pages App Router auth (/login, /register, /callback)
- [ ] Profil utilisateur avec Supabase profiles
- [ ] Gestion adresses
- [ ] Historique commandes
- [ ] Sécurité RLS validée

### Phase 3 - Checkout & Paiement
- [ ] Checkout complet
- [ ] Paiement Stripe sécurisé
- [ ] Emails confirmation automatiques
- [ ] Gestion erreurs robuste
- [ ] Tests paiement validés

### Phase 4 - CMS & Contenu
- [ ] Blog/magazine public
- [ ] Pages institutionnelles
- [ ] Newsletter opérationnelle
- [ ] SEO optimisé
- [ ] Contenu éditorialisé

### Phase 5 - Administration
- [ ] Dashboard admin sécurisé
- [ ] Gestion produits autonome
- [ ] Rôles et permissions
- [ ] Interface intuitive
- [ ] Statistiques basiques

### Phase 6 - Admin Avancé
- [ ] Gestion commandes complète
- [ ] Administration utilisateurs
- [ ] CMS éditorial
- [ ] Business intelligence
- [ ] Export données

### Phase 7 - Performance
- [ ] Core Web Vitals validés
- [ ] Bundle optimisé
- [ ] Sécurité production
- [ ] Monitoring actif
- [ ] Documentation complète

---

## 🔧 Stack Technique Recommandé

### Frontend
- **Next.js 15** - App Router + Server Components
- **TypeScript** - Typage strict
- **Tailwind CSS** - Design system
- **Framer Motion** - Animations
- **React Query/TanStack Query** - State management
- **React Hook Form** - Gestion formulaires
- **Sonner** - Toast notifications

### Backend & BaaS
- **Supabase** - Auth + Database + Storage
- **PostgreSQL** - Base de données
- **Row Level Security** - Sécurité granulaire
- **Supabase Edge Functions** - Serverless

### Paiement & E-commerce
- **Stripe** - Paiement sécurisé
- **Stripe Webhooks** - Synchronisation statuts
- **Colissimo** - Expédition France

### Outils & DevOps
- **GitHub Actions** - CI/CD
- **Vercel** - Déploiement production
- **Sentry** - Monitoring erreurs
- **Plausible/Google Analytics** - Analytics

---

## 🎯 Métriques de Succès par Phase

### Phase 1 - E-commerce
- Pages produits visitées > 100/jour
- Taux ajout panier > 15%
- Temps session > 2min

### Phase 2 - Auth
- Taux inscription > 5%
- Profils complétés > 80%
- Taux retour connecté > 40%

### Phase 3 - Paiement
- Taux conversion panier > 10%
- Abandon checkout < 60%
- Paiements réussis > 95%

### Phase 4 - Contenu
- Pages vues blog > 50/jour
- Newsletter abonnés > 100
- Temps lecture > 1min30

### Phase 5-6 - Admin
- Temps gestion produit < 5min
- Admin utilisations > 3x/semaine
- Autonomie éditoriale 100%

### Phase 7 - Performance
- LCP < 2s
- FID < 100ms
- Availability > 99.5%

---

**Dernière mise à jour :** 9 septembre 2025  
**Version :** MVP 1.0  
**Statut :** 📋 Plan validé - Prêt pour exécution