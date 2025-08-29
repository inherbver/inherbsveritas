# HerbisVeritas V2 - Système de Migrations Supabase

## 📋 Vue d'Ensemble

Ce dossier contient toutes les migrations de la base de données HerbisVeritas V2, organisées de manière chronologique et documentée pour faciliter la maintenance et l'onboarding des nouveaux développeurs.

## 🎯 Architecture MVP

**Base de données :** PostgreSQL via Supabase  
**Schéma :** 13 tables essentielles (vs 25+ de l'ancienne version)  
**Objectif :** E-commerce cosmétique bio prêt pour lancement en 12 semaines

## 📂 Structure des Migrations

```
supabase/
├── README.md                    # Ce fichier
├── config.toml                  # Configuration Supabase
├── migrations/                  # Migrations SQL chronologiques
│   ├── 001_mvp_schema.sql      # ✅ Schéma initial MVP (13 tables)
│   ├── 002_seed_data.sql       # 🔄 Données initiales
│   └── 003_rls_policies.sql    # 🔄 Politiques sécurité avancées
├── seed/                       # Scripts de données de test
└── docs/                       # Documentation détaillée
    ├── MIGRATION_GUIDE.md      # Guide pour appliquer les migrations
    ├── SCHEMA_OVERVIEW.md      # Vue d'ensemble du schéma
    └── ROLLBACK_PROCEDURES.md  # Procédures de rollback
```

## 🚀 Comment Appliquer les Migrations

### Méthode 1: Dashboard Supabase (Recommandée pour MVP)
1. Aller sur https://supabase.com/dashboard/project/mntndpelpvcskirnyqvx
2. Section "SQL Editor"
3. Ouvrir le fichier de migration (ex: `001_mvp_schema.sql`)
4. Copier-coller le contenu complet
5. Cliquer "Run" et vérifier les logs

### Méthode 2: CLI Supabase (Production)
```bash
# Installation
npm install -g supabase

# Connexion et link du projet
supabase login
supabase link --project-ref mntndpelpvcskirnyqvx

# Application des migrations
supabase db push

# Vérification
supabase db pull
```

### Méthode 3: Script Node.js (Développement)
```bash
npm run migrate:apply
```

## 📊 État des Migrations

| Migration | Statut | Description | Date | Auteur |
|-----------|--------|-------------|------|---------|
| 001_mvp_schema.sql | ✅ Prête | Schéma initial 13 tables MVP | 2025-01-28 | Claude Code |
| 002_seed_data.sql | 🔄 En cours | Données initiales de test | - | - |
| 003_rls_policies.sql | 📋 Planifiée | Politiques RLS avancées | - | - |

## 🔍 Légende Statuts
- ✅ **Prête** : Migration testée et validée
- 🔄 **En cours** : Migration en développement
- 📋 **Planifiée** : Migration prévue mais pas commencée
- ❌ **Échouée** : Migration avec erreurs
- 🚫 **Annulée** : Migration abandonnée

## 🏗️ Schéma MVP (13 Tables)

### Core E-commerce (8 tables)
1. **users** - 3 rôles (user/admin/dev)
2. **addresses** - Table séparée FK moderne
3. **categories** - Hiérarchique + i18n JSONB
4. **products** - Labels HerbisVeritas + INCI + i18n
5. **carts** - Système Guest/User
6. **cart_items** - Articles panier
7. **orders** - Stripe complet, 4 états MVP
8. **order_items** - Snapshot produits

### Content & Marketing (5 tables)
9. **articles** - Magazine TipTap (pas analytics)
10. **partners** - Points vente + réseaux sociaux
11. **next_events** - Hero simple (pas calendrier)
12. **newsletter_subscribers** - Basique (pas tracking)
13. **featured_items** - Hero polyvalent

## 🔐 Sécurité RLS

Toutes les tables sont sécurisées avec Row Level Security (RLS) :
- **Publique** : Lecture des données actives (produits, articles publiés)
- **Propriétaire** : CRUD sur ses données (commandes, adresses)
- **Admin** : Accès complet via role admin

## 🧪 Tests et Validation

Après chaque migration, vérifier :
```sql
-- Lister toutes les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Vérifier les enums
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype;

-- Test RLS
SET ROLE authenticated;
SELECT * FROM products WHERE is_active = true LIMIT 5;
```

## 📞 Support

**Problème avec une migration ?**
1. Consulter les logs Supabase Dashboard
2. Vérifier la documentation dans `/docs`
3. Rollback si nécessaire (voir ROLLBACK_PROCEDURES.md)
4. Contacter l'équipe dev

---

**Prochaines étapes :** Application de 001_mvp_schema.sql → Seed data → Tests RLS