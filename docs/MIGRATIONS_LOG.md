# Historique des Migrations - HerbisVeritas V2 MVP

## 📋 Log des Migrations Appliquées

| Date | Migration | Méthode | Statut | Environnement | Notes |
|------|-----------|---------|--------|---------------|--------|
| 2025-01-31 | 001_mvp_schema | Dashboard SQL Editor | ✅ **APPLIQUÉE** | Development | 13 tables MVP + 7 ENUMs + RLS + 3 catégories initiales |
| - | 002_basic_rls_dev | - | ⏳ Pending | Development | Sécurité RLS additionnelle phase dev |

## 🎯 Migrations Planifiées

### À Appliquer Prochainement
- [ ] **002_basic_rls_dev.sql** - RLS additionnelles pour développement sécurisé
- [ ] **003_users_triggers.sql** - Triggers d'audit utilisateurs (phase production)
- [ ] **004_products_search.sql** - Optimisations recherche full-text (semaine 8-9)

### Futures (Phases 2-3)
- [ ] **005_analytics_tables.sql** - Tables analytics business (V2)
- [ ] **006_multi_lang_expand.sql** - Extension DE/ES i18n (V2)
- [ ] **007_advanced_roles.sql** - Rôles granulaires (manager, editor) (V3)

## 📝 Procédure Standard Équipe

### 1. Avant d'Appliquer une Migration

```bash
# 1. Backup automatique (Supabase Dashboard)
# 2. Tester la migration en local si possible
# 3. Review du SQL par 2 personnes minimum
# 4. Documentation des changements
```

### 2. Application via Dashboard

```sql
-- Dans Supabase Dashboard → SQL Editor
-- 1. Créer nouvelle query
-- 2. Copier contenu migration depuis supabase/migrations/
-- 3. Exécuter
-- 4. Vérifier résultats via list_tables
-- 5. Mettre à jour ce log
```

### 3. Vérification Post-Migration

```bash
# Via MCP Supabase (Claude Code)
- list_tables → Vérifier tables créées
- execute_sql "SELECT count(*) FROM users" → Tester accès
- get_advisors → Vérifier pas de problèmes sécurité
```

## 🔐 Notes Sécurité

**CRITIQUE**: Toute migration touchant RLS ou permissions doit être:
1. ✅ Testée avec utilisateur test
2. ✅ Validée par audit security
3. ✅ Rollback plan défini
4. ✅ Documentation mise à jour

## 🚀 État de la Base MVP

**Objectif**: 13 tables opérationnelles pour développement auth/panier/commandes

### Tables Critiques MVP
- [x] `users` - Authentification 3 rôles ✅
- [x] `addresses` - Profils utilisateur ✅
- [x] `products` - Catalogue cosmétique ✅
- [x] `carts` / `cart_items` - Panier invité ✅
- [x] `orders` / `order_items` - Commandes Stripe ✅
- [x] `categories` - Navigation produits ✅ (3 catégories initiales)
- [x] `articles` - Magazine TipTap ✅
- [x] `partners` - Points de vente ✅
- [x] `next_events` - Événements Hero ✅
- [x] `newsletter_subscribers` - Inscriptions ✅
- [x] `featured_items` - Hero homepage ✅

### ENUMs HerbisVeritas
- [x] `user_role` (user/admin/dev) ✅
- [x] `product_label` (7 labels bio officiels: recolte_main, bio, origine_occitanie, etc.) ✅
- [x] `order_status` / `payment_status` (Stripe workflow) ✅
- [x] `address_type` / `featured_type` (shipping/billing + hero) ✅

## 📞 Escalation

**En cas de problème migration:**
1. 🛑 STOP développement
2. 📋 Capturer erreur complète  
3. 💡 Rollback si nécessaire via Dashboard
4. ✅ Contacter lead technique
5. 📝 Post-mortem + amélioration procédure

---

**Dernière MAJ**: 2025-01-31  
**Responsable**: Équipe Dev HerbisVeritas  
**Status**: Phase développement MVP