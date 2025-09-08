-- Migration: Correction sécurisée de l'accès public aux produits
-- Date: 2025-01-28
-- Objectif: Permettre la lecture publique des produits sans exposer la service key

-- Supprimer les politiques existantes problématiques
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
DROP POLICY IF EXISTS "Public products read access" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;

-- Créer une politique simple et sécurisée pour lecture publique
CREATE POLICY "Public can read active products" 
ON products 
FOR SELECT 
TO public
USING (is_active = true AND status = 'active');