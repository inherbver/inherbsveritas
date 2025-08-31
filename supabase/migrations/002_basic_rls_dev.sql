-- Migration: 002_basic_rls_dev.sql
-- Basic RLS pour phase développement - sécurité minimale
-- Date: 2025-01-31

-- ============================================================================
-- 1. ACTIVER RLS SUR TABLE USERS
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. POLICIES BASIQUES PHASE DEV
-- ============================================================================

-- Users peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users peuvent mettre à jour leur propre profil  
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Insertion automatique via Supabase auth
CREATE POLICY "Enable insert for authenticated users only" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins et devs peuvent voir tous les profils (pour debug/admin)
CREATE POLICY "Admins can view all profiles" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'dev')
    )
  );

-- ============================================================================  
-- 3. ACTIVER RLS SUR ADDRESSES (Protection inter-utilisateurs)
-- ============================================================================

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Users peuvent voir leurs propres adresses
CREATE POLICY "Users can view own addresses" ON addresses
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users peuvent gérer leurs propres adresses
CREATE POLICY "Users can insert own addresses" ON addresses
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own addresses" ON addresses  
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own addresses" ON addresses
  FOR DELETE USING (auth.uid()::text = user_id);

-- Admins peuvent voir toutes les adresses (pour support client)
CREATE POLICY "Admins can view all addresses" ON addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'dev')
    )
  );

-- ============================================================================
-- 4. FUNCTION HELPER POUR ROLE CHECK (Réutilisable)
-- ============================================================================

CREATE OR REPLACE FUNCTION auth.user_role() 
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. TRIGGER POUR AUTO-UPDATE updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at 
  BEFORE UPDATE ON addresses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. VERIFICATION RLS ACTIF (Phase dev)
-- ============================================================================

DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'users') THEN
    RAISE EXCEPTION 'RLS not enabled on users table';
  END IF;
  
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'addresses') THEN
    RAISE EXCEPTION 'RLS not enabled on addresses table';
  END IF;
  
  RAISE NOTICE 'RLS successfully enabled on users and addresses tables';
END $$;