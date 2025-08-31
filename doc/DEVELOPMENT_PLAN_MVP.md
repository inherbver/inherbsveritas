# Plan de Développement MVP - HerbisVeritas V2

## 📋 Vue d'Ensemble Stratégique MVP

Ce plan de développement définit la **roadmap MVP validée** basée sur l'architecture à 13 tables et les décisions business prises bloc par bloc pour HerbisVeritas V2.

### 🎯 Objectifs MVP

**Vision Produit MVP** : E-commerce cosmétique artisanal fonctionnel avec gestion de contenu, prêt pour lancement commercial en 12 semaines.

**Objectifs Techniques MVP** :
- ✅ Next.js 15 + App Router + Supabase
- ✅ Multilingue FR/EN (DE/ES → V2)
- ✅ 13 tables optimisées (vs 25+ actuelles)
- ✅ Patterns TypeScript modernes (Context7)
- ✅ Performance < 2s, SEO optimisé

**Objectifs Business MVP** :
- 🎯 **Launch ready** en 12 semaines
- 🎯 Support 1,000+ utilisateurs simultanés
- 🎯 Panier invité + Stripe + tracking Colissimo
- 🎯 Admin CMS pour contenu autonome
- 🎯 Labels HerbisVeritas + système partenaires

---

## 🏗️ Architecture MVP Validée

### Tables & Features Conservées (13 tables)

**🔵 Core E-commerce (8 tables) :**
1. `users` - 3 rôles (user/admin/dev)
2. `addresses` - Table séparée FK
3. `categories` - Hiérarchique + i18n JSONB
4. `products` - Labels HerbisVeritas + INCI + i18n JSONB  
5. `carts` - Guest/User système
6. `cart_items`
7. `orders` - Stripe complet, 4 états
8. `order_items` - Snapshot produits

**🟢 Content & Marketing (5 tables) :**
9. `articles` - TipTap éditeur riche (pas analytics)
10. `partners` - Points vente + réseaux sociaux
11. `next_events` - Hero simple (pas calendrier)
12. `newsletter_subscribers` - Basique (pas tracking)
13. `featured_items` - Hero polyvalent

### Features Reportées V2

❌ **Système complexes :**
- `login_attempts` (sécurité avancée)
- `tags`/`article_tags` (M:N → categories seulement)
- `markets` calendrier récurrence
- `pickup_points`/`shipping_methods` (prix fixe)
- `audit_logs`/`events` (monitoring)
- Analytics articles (`view_count`, `reading_time`)
- Promotions produits (`is_on_promotion`)

---

## 📅 Planning MVP - 12 Semaines

### Phase 1 : Foundation (Semaines 1-3)

#### **Semaine 1 : Architecture & Base + Tests Setup**
- [ ] **Setup projet Next.js 15**
  - Configuration TypeScript strict
  - Installation Supabase + shadcn/ui
  - Configuration next-intl v3.22+
  - ESLint + Prettier + Husky

- [ ] **Infrastructure Tests TDD**
  - Configuration Jest + React Testing Library
  - Configuration Playwright e2e
  - Structure dossiers `tests/` (unit/integration/e2e)
  - Scripts npm tests dans package.json
  - Configuration couverture de code > 80%

- [ ] **Migration base de données**
  - **TDD** : Tests fixtures + seeds AVANT migration
  - Création des 13 tables MVP
  - Types Supabase générés
  - RLS policies de base
  - Seeds data initiales

- [ ] **Types TypeScript finaux**
  - **TDD** : Tests utilitaires types AVANT implémentation
  - Implémentation TYPESCRIPT_TYPES_MVP_FINAL.md
  - Patterns Context7 intégrés
  - Utilitaires CRUD génériques

#### **Semaine 2 : Auth & Users (TDD First)**
- [ ] **Authentification Supabase**
  - **TDD** : Tests auth flows AVANT implémentation
  - **TDD** : Tests 3 rôles permissions AVANT middleware
  - Login/Register flows
  - 3 rôles (user/admin/dev)
  - Middleware protection routes
  - Profile management
  - **Tests** : Coverage auth > 90%

- [ ] **Addresses système**
  - **TDD** : Tests CRUD addresses AVANT API
  - **TDD** : Tests validation Zod AVANT forms
  - CRUD addresses séparées
  - Shipping/billing types
  - Adresses par défaut
  - Validation forms Zod
  - **Tests** : Coverage addresses > 85%

#### **Semaine 3 : Infrastructure UI + Products Foundation (TDD First)**

**🎯 NOUVEAU : Infrastructure Composants Évolutive**
- [ ] **Design System Foundation**
  - **TDD** : Tests composants UI AVANT implémentation
  - Setup shadcn/ui + Tailwind avec CSS variables
  - Structure `/src/components/` progressive
  - Integration messages centralisés dans composants
  - **Tests** : Coverage composants base > 90%

- [ ] **Composants Base MVP (Phase 1)**
  - **TDD** : Tests Button 2 variants AVANT UI
  - **TDD** : Tests Input validation AVANT forms
  - **TDD** : Tests Card container AVANT layout
  - Button (primary/secondary uniquement)
  - Input (text, email, password avec validation intégrée)
  - Card container simple
  - Alert/Toast avec AuthMessage support
  - **Tests** : Coverage UI base > 85%

- [ ] **Categories hiérarchiques**
  - **TDD** : Tests hiérarchie categories AVANT CRUD
  - **TDD** : Tests i18n JSONB AVANT admin
  - CRUD admin categories avec composants UI
  - i18n JSONB intégré
  - Navigation tree frontend avec Card components
  - **Tests** : Coverage categories > 85%

- [ ] **Products de base**
  - **TDD** : Tests labels HerbisVeritas AVANT enum
  - **TDD** : Tests ProductCard simple AVANT UI
  - CRUD produits avec composants UI standardisés
  - Labels HerbisVeritas (7 types)
  - INCI list cosmétique
  - Upload images avec composants réutilisables
  - **Tests** : Coverage produits > 80%

### Phase 2 : E-commerce Core (Semaines 4-7) - TDD Intensive

#### **Semaine 4 : Composants Business + Catalogue (TDD First)**

**🎯 Composants Business MVP (Phase 2)**
- [ ] **ProductCard Évolutif**
  - **TDD** : Tests ProductCard MVP simple AVANT UI
  - **TDD** : Tests props extensibles AVANT V2 prep
  - ProductCard monolithe simple (image, title, price, button)
  - Props extensibles pour évolution V2
  - Integration avec messages centralisés
  - Lazy loading images intégré
  - **Tests** : Coverage ProductCard > 90%

- [ ] **Forms Composants avec Messages**
  - **TDD** : Tests AuthForms AVANT UI
  - **TDD** : Tests validation + messages AVANT integration
  - LoginForm/SignupForm avec AuthMessage system
  - FormWrapper réutilisable avec gestion erreurs
  - Input validation temps réel
  - Loading states intégrés
  - **Tests** : Coverage forms > 85%

- [ ] **Frontend catalogue**
  - **TDD** : Tests layout composants AVANT UI
  - **TDD** : Tests filtres + recherche AVANT logique
  - **E2E** : Tests parcours catalogue complet
  - ProductList avec ProductCard standardisés
  - Filtres par catégorie/labels avec composants UI
  - Recherche textuelle avec Input component
  - Layout responsive avec components système
  - **Tests** : Coverage catalogue > 85%

- [ ] **i18n Frontend**
  - **TDD** : Tests traductions FR/EN AVANT next-intl
  - **TDD** : Tests switch langues AVANT UI
  - Traductions FR/EN avec messages centralisés
  - Switch langues avec composants UI
  - Fallback français intégré
  - **Tests** : Coverage i18n > 90%

#### **Semaine 5 : Panier Évolutif & Layout (TDD First)**

**🎯 State Management Évolutif**
- [ ] **Store Zustand MVP→V2**
  - **TDD** : Tests store simple AVANT state management
  - **TDD** : Tests localStorage persistence AVANT hooks
  - **TDD** : Tests merge cart guest→user AVANT auth
  - Store Zustand simple MVP (préparé pour slices V2)
  - Persistence localStorage avec middleware prep
  - Merge cart guest→user
  - Architecture évolutive vers slices pattern
  - **Tests** : Coverage panier store > 90%

**🎯 Composants Layout MVP (Phase 3)**
- [ ] **Layout Components**
  - **TDD** : Tests Header responsive AVANT UI
  - **TDD** : Tests Footer links AVANT content
  - Header avec nav simple + auth state display
  - Footer avec links essentiels
  - PageLayout container responsive
  - Sidebar basique (préparé pour collapsible V2)
  - **Tests** : Coverage layout > 85%

- [ ] **Cart UI Évolutif**
  - **TDD** : Tests CartSheet slide-over AVANT UI
  - **TDD** : Tests calculs totaux AVANT formules
  - **E2E** : Tests parcours ajout panier complet
  - CartSheet slide-over avec composants UI
  - CartSummary avec Card components
  - Add to cart avec Button + loading states
  - Quantités avec Input + validation
  - **Tests** : Coverage cart UI > 85%

#### **Semaine 6 : Commandes (TDD First)**
- [ ] **Checkout flow**
  - **TDD** : Tests validation Zod checkout AVANT forms
  - **TDD** : Tests workflow checkout AVANT UI
  - **E2E** : Tests checkout complet guest + user
  - Sélection adresses
  - Formulaire livraison/facturation
  - Récap commande
  - Validation Zod complète
  - **Tests** : Coverage checkout > 85%

- [ ] **États commandes**
  - **TDD** : Tests machine états AVANT business logic
  - **TDD** : Tests transitions AVANT admin interface
  - 4 états MVP (pending_payment → delivered)
  - Transitions métier
  - Interface admin statuts
  - **Tests** : Coverage états commandes > 90%

#### **Semaine 7 : Stripe Complet (TDD Critical)**
- [ ] **Intégration Stripe**
  - **TDD** : Tests webhooks Stripe AVANT API routes
  - **TDD** : Tests gestion erreurs AVANT retry logic
  - **Integration** : Tests Stripe test mode complets
  - Checkout Session hosted
  - Webhooks payment_intent
  - Gestion erreurs paiement
  - Retry automatiques
  - **Tests** : Coverage Stripe > 95% (critique paiement)

- [ ] **Tracking Colissimo**
  - **TDD** : Tests calcul prix AVANT business logic
  - **TDD** : Tests notifications email AVANT templates
  - Prix fixe 4,90€
  - Numéros de suivi
  - URLs tracking automatiques
  - Notifications email
  - **Tests** : Coverage shipping > 85%

### Phase 3 : Content & Marketing (Semaines 8-10) - TDD Content

#### **Semaine 8 : Magazine TipTap (TDD First)**
- [ ] **Articles CMS**
  - **TDD** : Tests éditeur TipTap AVANT UI admin
  - **TDD** : Tests workflow publish AVANT business logic
  - **TDD** : Tests gestion images AVANT upload
  - Éditeur TipTap admin
  - Gestion images
  - Preview/publish workflow
  - Categories articles
  - **Tests** : Coverage CMS articles > 80%

- [ ] **Frontend magazine**
  - **TDD** : Tests SEO meta tags AVANT génération
  - **TDD** : Tests responsive AVANT CSS
  - **E2E** : Tests parcours lecture magazine complet
  - Pages articles + détail  
  - Navigation categories
  - SEO meta tags
  - Responsive reading
  - **Tests** : Coverage magazine frontend > 85%

#### **Semaine 9 : Marketing Features**
- [ ] **Partenaires**
  - CRUD admin partners
  - Page "Nous retrouver"
  - Réseaux sociaux (Facebook/Instagram)
  - Map display

- [ ] **Next Events Hero**
  - Admin événement simple
  - Affichage Hero homepage
  - Toggle activation
  - Mobile optimization

#### **Semaine 10 : Newsletter & Featured**
- [ ] **Newsletter basique**
  - Popup inscription
  - Footer signup
  - Admin gestion emails
  - Export listes

- [ ] **Hero management**
  - Featured items polyvalent
  - Gestion produits/articles/événements
  - Ordre affichage
  - Images custom override

### Phase 4 : Admin & Polish (Semaines 11-12) - TDD Quality

#### **Semaine 11 : Admin Dashboard (TDD First)**
- [ ] **Interface admin complète**
  - **TDD** : Tests permissions rôles AVANT middleware
  - **TDD** : Tests CRUD operations AVANT UI admin
  - **TDD** : Tests batch operations AVANT business logic
  - Dashboard analytics basiques
  - CRUD toutes entités
  - Permissions rôles
  - Batch operations
  - **Tests** : Coverage admin > 85%

- [ ] **Gestion commandes**
  - **TDD** : Tests filtres commandes AVANT UI
  - **TDD** : Tests changement statuts AVANT API
  - Liste commandes filtrable
  - Détail commande complet
  - Changement statuts
  - Export données
  - **Tests** : Coverage gestion commandes > 90%

#### **Semaine 12 : Launch Prep (TDD Performance)**
- [ ] **Performance & SEO**
  - **Tests** : Performance Core Web Vitals < 2s
  - **Tests** : SEO meta tags validation
  - **Tests** : Sitemap.xml génération
  - Core Web Vitals < 2s
  - Meta tags dynamiques
  - Sitemap.xml
  - Robots.txt
  - **Tests** : Performance budget respecté

- [ ] **Production ready**
  - **Tests** : Error boundaries scenarios
  - **Tests** : Variables environnement validation
  - **Integration** : Tests monitoring Sentry
  - Variables environnement
  - Error boundaries
  - Monitoring Sentry
  - **Suite complète** : Tests critiques passage

- [ ] **Tests finaux & Documentation**
  - **Régression** : Suite tests complète > 80% coverage
  - **E2E** : Tous parcours utilisateur validés
  - **Performance** : Tests charge 1000 users simultanés
  - **Security** : Tests sécurité + pentest automatisé
  - Guide admin
  - Procédures déploiement
  - Rollback plans
  - Support documentation

---

## 👥 Organisation Équipe MVP

### Rôles Recommandés

**👤 Lead Developer (1 FTE)**
- Architecture générale
- Backend Supabase + RLS
- Intégrations Stripe
- Code review

**👤 Frontend Developer (1 FTE)**  
- Components React/Next.js
- UI/UX implementation
- Mobile responsive
- Performance optimization

**👤 CMS/Admin Developer (0.5 FTE)**
- Interface admin
- TipTap integration
- CRUD operations
- Data management

### Méthodologie

**🔄 Sprints 1 semaine**
- Planning lundi matin
- Daily standup
- Demo vendredi
- Retrospective

**📊 KPIs Équipe TDD**
- Vélocité par sprint TDD (tests first)
- Bug rate < 2% (amélioré grâce TDD)
- Code coverage > 80% (obligatoire)
- Performance budget respecté
- **TDD compliance** : 100% code sous tests
- **Red-Green-Refactor** : Cycles respectés
- **Régression** : 0 tests qui échouent en production

---

## 👥 Organisation Équipe MVP

### Rôles Recommandés

**👤 Lead Developer (1 FTE)**
- Architecture générale
- Backend Supabase + RLS
- Infrastructure composants évolutive
- Code review

**👤 Frontend Developer (1 FTE)**  
- Components React/Next.js avec shadcn/ui
- UI/UX implementation + messages centralisés
- Mobile responsive
- Performance optimization

**👤 CMS/Admin Developer (0.5 FTE)**
- Interface admin avec composants standardisés
- TipTap integration
- CRUD operations
- Data management

### Outils & Technologies

**🛠️ Stack Technique :**
- Next.js 15 + TypeScript
- Supabase Pro
- Vercel Pro
- shadcn/ui + Tailwind CSS
- Radix UI Components

**🧪 Testing Infrastructure :**
- Jest + React Testing Library
- Playwright (e2e)
- Coverage tools
- CI/CD GitHub Actions

**🎨 Design System :**
- shadcn/ui (MIT License)
- Design tokens workflow
- UI Testing infrastructure
- Messages centralisés system

---

## 🎯 Indicateurs de Succès MVP

### Techniques TDD + Infrastructure UI
- [ ] **Performance** : < 2s First Contentful Paint (validé par tests)
- [ ] **Bundle Size** : < 150kb initial (avec shadcn/ui optimisé)
- [ ] **Availabilité** : 99.5% uptime (monitoring automatisé)
- [ ] **Mobile** : Score Lighthouse > 90 (tests automatisés)
- [ ] **Security** : 0 vulnérabilités critiques (pentest automatisé)
- [ ] **Code Quality** : > 80% test coverage (obligatoire)
- [ ] **UI Components** : > 85% test coverage composants
- [ ] **Messages System** : 100% AuthMessage integration
- [ ] **Design System** : 0 breaking changes vers V2
- [ ] **Bug Rate** : < 2% production (amélioré via TDD)
- [ ] **Régression** : 0 bugs réintroduits (suite tests)
- [ ] **Évolutivité** : Backward compatibility 100% vers V2

### Business
- [ ] **Conversion** : 2%+ panier→commande
- [ ] **SEO** : Top 10 mots-clés cibles
- [ ] **Users** : 500+ utilisateurs actifs/mois
- [ ] **Revenue** : €10,000/mois après 3 mois

### UX/Tech
- [ ] **Admin autonomie** : CMS utilisable sans dev
- [ ] **Mobile UX** : 100% features disponibles
- [ ] **i18n** : 100% traductions FR/EN
- [ ] **Error rate** : < 1% transactions

---

## 🚀 Go-Live Strategy

### Phase Pre-Launch (1 semaine avant)

**🧪 Testing intensif :**
- [ ] Tests charge (1000 users simultanés)
- [ ] Paiements Stripe mode live
- [ ] Emails transactionnels
- [ ] Backup/restore procedures

**📊 Monitoring setup :**
- [ ] Sentry error tracking
- [ ] Vercel analytics
- [ ] Supabase monitoring
- [ ] Custom business metrics

### Launch Day

**⚡ Launch sequence :**
1. DNS switch domain production
2. Enable Stripe live keys
3. Activate email notifications
4. Social media announce
5. Monitor dashboards

**🚨 Rollback plan :**
- DNS revert < 5 min
- Database snapshot available
- Static holding page ready

### Post-Launch (Semaine +1)

**📈 Monitoring :**
- Daily metrics review
- User feedback collection
- Performance monitoring
- Bug fix prioritization

**🔧 Support :**
- 24h response time bugs critiques
- Documentation updates
- User onboarding support

---

## 🛣️ Roadmap V2 (Post-MVP)

### Features V2 (Mois 4-8)

**🌐 i18n Complet :**
- Langues DE/ES ajoutées
- Traductions professionnelles
- Currency multi-devises

**📊 Analytics Avancées :**
- Google Analytics 4 intégré  
- Articles analytics (views, time)
- Conversion funnels
- A/B testing framework

**🚚 Logistique Avancée :**
- Points retrait Colissimo
- Multiple shipping methods
- Tracking avancé
- Returns management

**🏷️ Marketing Avancé :**
- Système promotions/coupons
- Email marketing automation
- Reviews & ratings produits
- Loyalty program

**🔒 Sécurité & Audit :**
- Audit logs complets
- Login attempts monitoring
- RGPD compliance tools
- Advanced role permissions

### Budget V2 : €80,000 (6 mois)

---

Ce plan MVP préserve toutes les fonctionnalités business critiques validées tout en permettant un lancement commercial rapide et un budget maîtrisé sous €125k année 1.