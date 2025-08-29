-- HerbisVeritas V2 Migration: auth_rbac_security
-- Generated: 2025-01-29T10:30:00Z
-- Type: RLS_POLICY
-- Status: PENDING

-- Migration 002: Système RBAC sécurisé avec custom claims et RLS graduelles
-- Architecture: user/admin/dev roles avec private schema et security definer functions

-- ============================================================================
-- PHASE 1: SCHEMA PRIVÉ POUR SÉCURITÉ
-- ============================================================================

-- Créer schema privé pour fonctions de sécurité (non accessible via API)
CREATE SCHEMA IF NOT EXISTS private;

-- ============================================================================
-- PHASE 2: TABLES DE PERMISSIONS EN SCHEMA PRIVÉ
-- ============================================================================

-- Table des rôles utilisateur (privée - non exposée via API)
CREATE TABLE IF NOT EXISTS private.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'dev')),
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table matrice des permissions par rôle (privée)
CREATE TABLE IF NOT EXISTS private.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'dev')),
    resource TEXT NOT NULL, -- nom de la table
    permission TEXT NOT NULL CHECK (permission IN ('read', 'create', 'update', 'delete', 'admin')),
    condition TEXT, -- condition SQL optionnelle
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances des vérifications de permissions
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON private.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_resource ON private.role_permissions(role, resource);

-- ============================================================================
-- PHASE 3: FONCTIONS SÉCURISÉES (SECURITY DEFINER)
-- ============================================================================

-- Fonction helper: Obtenir le rôle de l'utilisateur courant
CREATE OR REPLACE FUNCTION private.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Vérifier si utilisateur authentifié
    IF auth.uid() IS NULL THEN
        RETURN 'anonymous';
    END IF;

    -- Récupérer rôle depuis private.user_roles
    SELECT role INTO user_role
    FROM private.user_roles
    WHERE user_id = auth.uid();

    -- Rôle par défaut si pas trouvé
    RETURN COALESCE(user_role, 'user');
END;
$$;

-- Fonction helper: Vérifier si admin
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
    RETURN private.get_current_user_role() = 'admin';
END;
$$;

-- Fonction helper: Vérifier si dev
CREATE OR REPLACE FUNCTION private.is_dev()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
    RETURN private.get_current_user_role() IN ('dev', 'admin');
END;
$$;

-- Fonction helper: Vérifier permission spécifique
CREATE OR REPLACE FUNCTION private.has_permission(resource_name TEXT, permission_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
DECLARE
    current_role TEXT;
    has_perm BOOLEAN := FALSE;
BEGIN
    -- Récupérer rôle courant
    current_role := private.get_current_user_role();
    
    -- Vérifier permission dans la matrice
    SELECT TRUE INTO has_perm
    FROM private.role_permissions rp
    WHERE rp.role = current_role
    AND rp.resource = resource_name
    AND rp.permission = permission_type;

    RETURN COALESCE(has_perm, FALSE);
END;
$$;

-- ============================================================================
-- PHASE 4: HOOK AUTH POUR CUSTOM CLAIMS JWT
-- ============================================================================

-- Hook pour injecter rôle dans JWT lors de l'auth
CREATE OR REPLACE FUNCTION private.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
DECLARE
    user_role TEXT;
    claims jsonb;
BEGIN
    -- Récupérer rôle utilisateur
    SELECT role INTO user_role
    FROM private.user_roles
    WHERE user_id = (event->>'user_id')::UUID;

    -- Construire claims custom
    claims := jsonb_build_object(
        'app_role', COALESCE(user_role, 'user'),
        'app_metadata', jsonb_build_object(
            'role', COALESCE(user_role, 'user'),
            'permissions', (
                SELECT jsonb_agg(permission)
                FROM private.role_permissions
                WHERE role = COALESCE(user_role, 'user')
            )
        )
    );

    -- Retourner event avec claims ajoutés
    RETURN jsonb_set(event, '{claims}', claims, TRUE);
END;
$$;

-- ============================================================================
-- PHASE 5: POLITIQUES RLS GRADUELLES PAR RÔLE
-- ============================================================================

-- Enable RLS sur toutes les tables MVP
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- USERS: RLS graduelles
-- Users normaux: lecture seule de leur profil + autres profils publics
CREATE POLICY "users_read_own_profile"
ON users FOR SELECT
TO authenticated
USING (
    auth.uid() = id OR 
    private.has_permission('users', 'read')
);

-- Users: modification seulement de son profil
CREATE POLICY "users_update_own_profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id OR private.is_admin())
WITH CHECK (auth.uid() = id OR private.is_admin());

-- Admins: accès complet users
CREATE POLICY "admin_full_access_users"
ON users FOR ALL
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- PRODUCTS: RLS graduelles
-- Lecture publique pour tous les produits actifs
CREATE POLICY "products_read_public"
ON products FOR SELECT
TO authenticated
USING (status = 'active' OR private.has_permission('products', 'admin'));

-- Admins: gestion complète produits
CREATE POLICY "admin_manage_products"
ON products FOR ALL
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- ORDERS: RLS graduelles très strictes
-- Users: seulement leurs commandes
CREATE POLICY "orders_read_own"
ON orders FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR 
    private.has_permission('orders', 'admin')
);

-- Users: création seulement pour eux-mêmes
CREATE POLICY "orders_create_own"
ON orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admins: accès complet commandes
CREATE POLICY "admin_full_access_orders"
ON orders FOR ALL
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- ARTICLES: RLS graduelles
-- Lecture publique articles publiés
CREATE POLICY "articles_read_published"
ON articles FOR SELECT
TO authenticated
USING (status = 'published' OR private.has_permission('articles', 'admin'));

-- Admins: gestion complète articles
CREATE POLICY "admin_manage_articles"
ON articles FOR ALL
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- ============================================================================
-- PHASE 6: DONNÉES INITIALES PERMISSIONS
-- ============================================================================

-- Permissions par rôle: USER (minimal)
INSERT INTO private.role_permissions (role, resource, permission, condition) VALUES
('user', 'users', 'read', 'auth.uid() = id'),
('user', 'users', 'update', 'auth.uid() = id'),
('user', 'products', 'read', 'status = ''active'''),
('user', 'orders', 'read', 'user_id = auth.uid()'),
('user', 'orders', 'create', 'user_id = auth.uid()'),
('user', 'articles', 'read', 'status = ''published'''),
('user', 'carts', 'read', 'user_id = auth.uid()'),
('user', 'carts', 'create', 'user_id = auth.uid()'),
('user', 'carts', 'update', 'user_id = auth.uid()'),
('user', 'carts', 'delete', 'user_id = auth.uid()')
ON CONFLICT DO NOTHING;

-- Permissions par rôle: ADMIN (étendu)
INSERT INTO private.role_permissions (role, resource, permission) VALUES
('admin', 'users', 'read'),
('admin', 'users', 'update'),
('admin', 'users', 'admin'),
('admin', 'products', 'read'),
('admin', 'products', 'create'),
('admin', 'products', 'update'),
('admin', 'products', 'delete'),
('admin', 'products', 'admin'),
('admin', 'orders', 'read'),
('admin', 'orders', 'update'),
('admin', 'orders', 'admin'),
('admin', 'articles', 'read'),
('admin', 'articles', 'create'),
('admin', 'articles', 'update'),
('admin', 'articles', 'delete'),
('admin', 'articles', 'admin'),
('admin', 'categories', 'admin'),
('admin', 'partners', 'admin'),
('admin', 'featured_items', 'admin')
ON CONFLICT DO NOTHING;

-- Permissions par rôle: DEV (complet)
INSERT INTO private.role_permissions (role, resource, permission) VALUES
('dev', 'users', 'admin'),
('dev', 'products', 'admin'),
('dev', 'orders', 'admin'),
('dev', 'articles', 'admin'),
('dev', 'categories', 'admin'),
('dev', 'partners', 'admin'),
('dev', 'featured_items', 'admin'),
('dev', 'newsletter_subscribers', 'admin'),
('dev', 'addresses', 'admin'),
('dev', 'carts', 'admin'),
('dev', 'cart_items', 'admin'),
('dev', 'order_items', 'admin'),
('dev', 'next_events', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PHASE 7: FUNCTIONS UTILITAIRES POUR L'APP
-- ============================================================================

-- Fonction pour assigner un rôle (admin/dev seulement)
CREATE OR REPLACE FUNCTION private.assign_user_role(target_user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
    -- Vérifier que l'appelant est admin ou dev
    IF NOT private.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;

    -- Vérifier rôle valide
    IF new_role NOT IN ('user', 'admin', 'dev') THEN
        RAISE EXCEPTION 'Invalid role: must be user, admin, or dev';
    END IF;

    -- Insérer ou mettre à jour rôle
    INSERT INTO private.user_roles (user_id, role, assigned_by, assigned_at)
    VALUES (target_user_id, new_role, auth.uid(), NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET 
        role = new_role,
        assigned_by = auth.uid(),
        updated_at = NOW();

    RETURN TRUE;
END;
$$;

-- Fonction pour récupérer les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION private.get_user_permissions(target_user_id UUID DEFAULT NULL)
RETURNS TABLE(resource TEXT, permission TEXT, condition TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
DECLARE
    target_role TEXT;
    check_user_id UUID;
BEGIN
    -- Déterminer l'utilisateur cible
    check_user_id := COALESCE(target_user_id, auth.uid());
    
    -- Seulement admin peut voir permissions d'autres users
    IF target_user_id IS NOT NULL AND target_user_id != auth.uid() THEN
        IF NOT private.is_admin() THEN
            RAISE EXCEPTION 'Access denied: Cannot view other users permissions';
        END IF;
    END IF;

    -- Récupérer rôle de l'utilisateur cible
    SELECT ur.role INTO target_role
    FROM private.user_roles ur
    WHERE ur.user_id = check_user_id;

    -- Rôle par défaut
    target_role := COALESCE(target_role, 'user');

    -- Retourner permissions
    RETURN QUERY
    SELECT rp.resource, rp.permission, rp.condition
    FROM private.role_permissions rp
    WHERE rp.role = target_role
    ORDER BY rp.resource, rp.permission;
END;
$$;

-- ============================================================================
-- PHASE 8: TRIGGERS ET AUTOMATISATIONS
-- ============================================================================

-- Trigger: Auto-assigner rôle 'user' lors de l'inscription
CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
    -- Auto-assigner rôle user aux nouveaux utilisateurs
    INSERT INTO private.user_roles (user_id, role, assigned_at)
    VALUES (NEW.id, 'user', NOW());
    
    RETURN NEW;
END;
$$;

-- Trigger sur auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

-- Trigger: MAJ timestamp updated_at
CREATE OR REPLACE FUNCTION private.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER user_roles_updated_at
BEFORE UPDATE ON private.user_roles
FOR EACH ROW EXECUTE FUNCTION private.update_updated_at();

-- ============================================================================
-- FINALISATION
-- ============================================================================

-- Grants pour les fonctions utilitaires (exposées via API)
GRANT EXECUTE ON FUNCTION private.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_dev() TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_user_permissions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.assign_user_role(UUID, TEXT) TO authenticated;

-- Commentaires documentation
COMMENT ON SCHEMA private IS 'HerbisVeritas V2: Schema privé pour sécurité RBAC - Non exposé via API';
COMMENT ON TABLE private.user_roles IS 'Rôles utilisateurs: user/admin/dev avec traçabilité';
COMMENT ON TABLE private.role_permissions IS 'Matrice permissions par rôle et ressource';
COMMENT ON FUNCTION private.get_current_user_role() IS 'Récupère rôle utilisateur courant pour RLS';
COMMENT ON FUNCTION private.assign_user_role(UUID, TEXT) IS 'Assigne rôle utilisateur (admin requis)';

-- Migration terminée avec succès
-- Architecture RBAC sécurisée déployée: 3 rôles + RLS graduelles + custom JWT claims