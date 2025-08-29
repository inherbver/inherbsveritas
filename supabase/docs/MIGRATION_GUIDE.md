# Guide de Migration - HerbisVeritas V2

## 🎯 Objectif

Ce guide explique **étape par étape** comment appliquer les migrations de la base de données HerbisVeritas V2 de manière sûre et traçable.

## 📋 Pré-requis

### Configuration Requise
- ✅ Accès au projet Supabase : `mntndpelpvcskirnyqvx`
- ✅ Clés API configurées dans `.env.local`
- ✅ Node.js 18+ installé
- ✅ Accès en écriture à la base de données

### Variables d'Environnement
```bash
# Vérifier la configuration
NEXT_PUBLIC_SUPABASE_URL=https://mntndpelpvcskirnyqvx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 Application des Migrations

### Étape 1: Backup de Sécurité

**Avant toute migration**, toujours créer un backup :

```sql
-- Dans Supabase Dashboard > SQL Editor
-- Exporter le schéma actuel
pg_dump --schema-only --no-owner --no-privileges \
  postgresql://postgres:PASSWORD@db.mntndpelpvcskirnyqvx.supabase.co:5432/postgres \
  > backup_schema_$(date +%Y%m%d_%H%M%S).sql
```

### Étape 2: Validation Pré-Migration

```sql
-- Vérifier l'état actuel
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Vérifier les connexions actives
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';
```

### Étape 3: Application de la Migration

#### Méthode Dashboard (Recommandée)

1. **Accéder au Dashboard**
   ```
   https://supabase.com/dashboard/project/mntndpelpvcskirnyqvx
   ```

2. **Ouvrir SQL Editor**
   - Cliquer sur "SQL Editor" dans le menu gauche
   - Créer une nouvelle query

3. **Copier la Migration**
   - Ouvrir `supabase/migrations/001_mvp_schema.sql`
   - Copier **tout le contenu**
   - Coller dans l'éditeur SQL

4. **Exécuter avec Précaution**
   - Vérifier la syntaxe
   - Cliquer "Run"
   - **Surveiller les logs** en temps réel

### Étape 4: Validation Post-Migration

```sql
-- 1. Vérifier les tables créées (doit retourner 13)
SELECT count(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE '%_migrations%';

-- 2. Vérifier les enums
SELECT 
  t.typname as enum_name,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('user_role', 'product_label', 'order_status', 'payment_status', 'featured_type')
GROUP BY t.typname
ORDER BY t.typname;

-- 3. Vérifier les contraintes FK
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  ccu.table_name as referenced_table
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.constraint_column_usage ccu 
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public' 
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- 4. Test RLS (doit retourner true pour toutes les tables)
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

## ✅ Checklist de Validation

### Tables Créées (13/13)
- [ ] users
- [ ] addresses  
- [ ] categories
- [ ] products
- [ ] carts
- [ ] cart_items
- [ ] orders
- [ ] order_items
- [ ] articles
- [ ] partners
- [ ] next_events
- [ ] newsletter_subscribers
- [ ] featured_items

### Enums Créés (7/7)
- [ ] user_role (user, admin, dev)
- [ ] address_type (shipping, billing)
- [ ] order_status (pending_payment, processing, shipped, delivered)
- [ ] payment_status (pending, succeeded, failed, refunded)
- [ ] product_label (7 labels HerbisVeritas)
- [ ] featured_type (product, article, event)

### Fonctionnalités
- [ ] RLS activé sur toutes les tables
- [ ] Index de performance créés
- [ ] Triggers updated_at fonctionnels
- [ ] Données de seed insérées (categories initiales)

## 🚨 Procédure de Rollback

En cas de problème :

### Rollback Immédiat
```sql
-- 1. Supprimer toutes les tables créées
DROP TABLE IF EXISTS featured_items CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS next_events CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
-- Note: users reste car lié à auth.users

-- 2. Supprimer les enums
DROP TYPE IF EXISTS featured_type;
DROP TYPE IF EXISTS product_label;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS address_type;
DROP TYPE IF EXISTS user_role;

-- 3. Supprimer les fonctions
DROP FUNCTION IF EXISTS update_updated_at_column();
```

### Rollback depuis Backup
```bash
# Restaurer depuis backup
psql postgresql://postgres:PASSWORD@db.mntndpelpvcskirnyqvx.supabase.co:5432/postgres \
  < backup_schema_YYYYMMDD_HHMMSS.sql
```

## 📊 Monitoring Post-Migration

### Métriques à Surveiller
```sql
-- Performance queries
SELECT schemaname, tablename, n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Logs à Vérifier
- ✅ Aucune erreur dans Supabase Dashboard > Logs
- ✅ Connexions actives normales
- ✅ Temps de réponse API < 200ms

## 🆘 Support et Aide

### En cas de problème
1. **Consulter les logs** : Dashboard > Logs > Database
2. **Vérifier la configuration** : Variables d'environnement
3. **Rollback si critique** : Suivre la procédure ci-dessus
4. **Documenter l'incident** : Issue GitHub avec logs complets

### Contacts
- **Lead Developer** : Responsable architecture
- **DevOps** : Problèmes d'infrastructure
- **Documentation** : supabase/docs/

---

**Prochaine étape :** Une fois 001_mvp_schema.sql appliquée avec succès → Passer à 002_seed_data.sql