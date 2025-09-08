-- Migration: Correction des politiques RLS pour products
-- Date: 2025-01-28
-- Objectif: Permettre la lecture publique des produits actifs

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
DROP POLICY IF EXISTS "Public products read access" ON products;

-- Créer une politique simple pour lecture publique des produits actifs
CREATE POLICY "Public can view active products"
ON products
FOR SELECT
TO public
USING (is_active = true AND status = 'active');