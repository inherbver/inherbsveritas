-- HerbisVeritas V2 - Cart System Optimizations
-- Migration: 003_cart_optimized.sql
-- Phase 1 Foundation: Vue optimisée + fonctions atomiques

-- ============================================================================
-- 1. VUE OPTIMISÉE CART
-- ============================================================================

-- Vue optimisée pour React Query avec jointures HerbisVeritas
CREATE VIEW user_cart_view AS
SELECT 
  c.id,
  c.user_id,
  c.guest_id,
  c.updated_at,
  c.status,
  COALESCE(
    json_agg(
      json_build_object(
        'id', ci.id,
        'productId', ci.product_id,
        'name', p.i18n->'fr'->>'name',
        'price', p.price,
        'quantity', ci.quantity,
        'labels', p.labels,              -- HerbisVeritas labels
        'unit', 'pièce',                 -- Default unit (TODO: add to products if needed)
        'inci_list', p.inci_list,       -- Cosmétique INCI
        'image', p.featured_image,
        'slug', p.sku,                   -- Using SKU as slug for now
        'stock_quantity', p.stock_quantity,
        'low_stock_threshold', p.low_stock_threshold
      ) ORDER BY ci.created_at
    ) FILTER (WHERE ci.id IS NOT NULL),
    '[]'::json
  ) as items,
  COALESCE(SUM(ci.quantity), 0) as total_items,
  COALESCE(SUM(ci.quantity * p.price), 0) as subtotal
FROM carts c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
LEFT JOIN products p ON ci.product_id = p.id AND p.is_active = true
WHERE c.status = 'active'
GROUP BY c.id, c.user_id, c.guest_id, c.updated_at, c.status;

-- Index pour optimiser les requêtes sur la vue
CREATE INDEX IF NOT EXISTS idx_carts_user_status ON carts(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_carts_guest_status ON carts(guest_id, status) WHERE status = 'active';

-- ============================================================================
-- 2. FONCTIONS ATOMIQUES CART
-- ============================================================================

-- Fonction atomique pour ajouter un item au panier
CREATE OR REPLACE FUNCTION cart_add_item(
  p_user_id UUID DEFAULT NULL,
  p_guest_id TEXT DEFAULT NULL,
  p_product_id UUID,
  p_quantity INTEGER DEFAULT 1
) RETURNS TABLE(cart_id UUID, item_id UUID, success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cart_id UUID;
  v_item_id UUID;
  v_existing_quantity INTEGER := 0;
  v_stock_quantity INTEGER;
  v_product_exists BOOLEAN;
BEGIN
  -- Validation: vérifier que le produit existe et est actif
  SELECT stock_quantity INTO v_stock_quantity
  FROM products 
  WHERE id = p_product_id AND is_active = true;
  
  GET DIAGNOSTICS v_product_exists = FOUND;
  
  IF NOT v_product_exists THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE, 'Produit non trouvé ou inactif';
    RETURN;
  END IF;
  
  -- Validation: vérifier stock disponible
  IF v_stock_quantity < p_quantity THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE, 'Stock insuffisant';
    RETURN;
  END IF;
  
  -- Trouver ou créer le panier
  SELECT id INTO v_cart_id
  FROM carts 
  WHERE (
    (p_user_id IS NOT NULL AND user_id = p_user_id) OR
    (p_user_id IS NULL AND guest_id = p_guest_id)
  ) AND status = 'active'
  LIMIT 1;
  
  -- Créer nouveau panier si nécessaire
  IF v_cart_id IS NULL THEN
    INSERT INTO carts (user_id, guest_id, status)
    VALUES (p_user_id, p_guest_id, 'active')
    RETURNING id INTO v_cart_id;
  END IF;
  
  -- Vérifier si l'item existe déjà
  SELECT quantity INTO v_existing_quantity
  FROM cart_items 
  WHERE cart_id = v_cart_id AND product_id = p_product_id;
  
  IF FOUND THEN
    -- Vérifier stock pour nouvelle quantité
    IF v_stock_quantity < (v_existing_quantity + p_quantity) THEN
      RETURN QUERY SELECT v_cart_id, NULL::UUID, FALSE, 'Stock insuffisant pour cette quantité';
      RETURN;
    END IF;
    
    -- Mettre à jour quantité existante
    UPDATE cart_items 
    SET quantity = v_existing_quantity + p_quantity,
        updated_at = NOW()
    WHERE cart_id = v_cart_id AND product_id = p_product_id
    RETURNING id INTO v_item_id;
  ELSE
    -- Créer nouvel item
    INSERT INTO cart_items (cart_id, product_id, quantity)
    VALUES (v_cart_id, p_product_id, p_quantity)
    RETURNING id INTO v_item_id;
  END IF;
  
  -- Mettre à jour timestamp du panier
  UPDATE carts SET updated_at = NOW() WHERE id = v_cart_id;
  
  RETURN QUERY SELECT v_cart_id, v_item_id, TRUE, 'Item ajouté avec succès';
END;
$$;

-- Fonction atomique pour supprimer un item
CREATE OR REPLACE FUNCTION cart_remove_item(
  p_user_id UUID DEFAULT NULL,
  p_guest_id TEXT DEFAULT NULL,
  p_product_id UUID
) RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cart_id UUID;
  v_deleted_count INTEGER;
BEGIN
  -- Trouver le panier
  SELECT id INTO v_cart_id
  FROM carts 
  WHERE (
    (p_user_id IS NOT NULL AND user_id = p_user_id) OR
    (p_user_id IS NULL AND guest_id = p_guest_id)
  ) AND status = 'active'
  LIMIT 1;
  
  IF v_cart_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Panier non trouvé';
    RETURN;
  END IF;
  
  -- Supprimer l'item
  DELETE FROM cart_items 
  WHERE cart_id = v_cart_id AND product_id = p_product_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  IF v_deleted_count = 0 THEN
    RETURN QUERY SELECT FALSE, 'Item non trouvé dans le panier';
    RETURN;
  END IF;
  
  -- Mettre à jour timestamp du panier
  UPDATE carts SET updated_at = NOW() WHERE id = v_cart_id;
  
  RETURN QUERY SELECT TRUE, 'Item supprimé avec succès';
END;
$$;

-- Fonction atomique pour mettre à jour quantité
CREATE OR REPLACE FUNCTION cart_update_quantity(
  p_user_id UUID DEFAULT NULL,
  p_guest_id TEXT DEFAULT NULL,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cart_id UUID;
  v_stock_quantity INTEGER;
  v_updated_count INTEGER;
BEGIN
  -- Si quantité 0, supprimer l'item
  IF p_quantity <= 0 THEN
    RETURN QUERY SELECT * FROM cart_remove_item(p_user_id, p_guest_id, p_product_id);
    RETURN;
  END IF;
  
  -- Vérifier stock disponible
  SELECT stock_quantity INTO v_stock_quantity
  FROM products 
  WHERE id = p_product_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Produit non trouvé ou inactif';
    RETURN;
  END IF;
  
  IF v_stock_quantity < p_quantity THEN
    RETURN QUERY SELECT FALSE, 'Stock insuffisant';
    RETURN;
  END IF;
  
  -- Trouver le panier
  SELECT id INTO v_cart_id
  FROM carts 
  WHERE (
    (p_user_id IS NOT NULL AND user_id = p_user_id) OR
    (p_user_id IS NULL AND guest_id = p_guest_id)
  ) AND status = 'active'
  LIMIT 1;
  
  IF v_cart_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Panier non trouvé';
    RETURN;
  END IF;
  
  -- Mettre à jour la quantité
  UPDATE cart_items 
  SET quantity = p_quantity,
      updated_at = NOW()
  WHERE cart_id = v_cart_id AND product_id = p_product_id;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  IF v_updated_count = 0 THEN
    RETURN QUERY SELECT FALSE, 'Item non trouvé dans le panier';
    RETURN;
  END IF;
  
  -- Mettre à jour timestamp du panier
  UPDATE carts SET updated_at = NOW() WHERE id = v_cart_id;
  
  RETURN QUERY SELECT TRUE, 'Quantité mise à jour avec succès';
END;
$$;

-- ============================================================================
-- 3. RLS POLICIES SPÉCIFIQUES CART
-- ============================================================================

-- Politique pour vue user_cart_view
CREATE POLICY "Users can view own cart data" ON carts FOR SELECT
USING (
  (auth.uid()::TEXT = user_id::TEXT) OR 
  (auth.uid() IS NULL AND guest_id IS NOT NULL)
);

-- Politique renforcée pour cart_items avec validation stock
DROP POLICY IF EXISTS "Users can manage cart items" ON cart_items;
CREATE POLICY "Users can manage own cart items" ON cart_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM carts 
    WHERE id = cart_items.cart_id 
    AND (
      (auth.uid()::TEXT = user_id::TEXT) OR 
      (auth.uid() IS NULL AND guest_id IS NOT NULL)
    )
  )
)
WITH CHECK (
  quantity > 0 AND 
  quantity <= (SELECT stock_quantity FROM products WHERE id = product_id) AND
  EXISTS (
    SELECT 1 FROM carts 
    WHERE id = cart_items.cart_id 
    AND (
      (auth.uid()::TEXT = user_id::TEXT) OR 
      (auth.uid() IS NULL AND guest_id IS NOT NULL)
    )
  )
);

-- ============================================================================
-- 4. INDEXES PERFORMANCE
-- ============================================================================

-- Index composé pour optimiser les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_product ON cart_items(cart_id, product_id);
CREATE INDEX IF NOT EXISTS idx_products_active_stock ON products(is_active, stock_quantity) WHERE is_active = true;

-- Index partiel pour carts actifs seulement
CREATE INDEX IF NOT EXISTS idx_carts_active_updated ON carts(updated_at DESC) WHERE status = 'active';

-- ============================================================================
-- 5. COMMENTAIRES DOCUMENTATION
-- ============================================================================

COMMENT ON VIEW user_cart_view IS 'Vue optimisée pour React Query avec données HerbisVeritas (labels, INCI, stock)';
COMMENT ON FUNCTION cart_add_item IS 'Fonction atomique pour ajouter un item au panier avec validation stock';
COMMENT ON FUNCTION cart_remove_item IS 'Fonction atomique pour supprimer un item du panier';
COMMENT ON FUNCTION cart_update_quantity IS 'Fonction atomique pour mettre à jour la quantité avec validation stock';

-- ============================================================================
-- 6. GRANTS PERMISSIONS
-- ============================================================================

-- Permissions pour la vue (accessible aux utilisateurs authentifiés et anonymes)
GRANT SELECT ON user_cart_view TO authenticated, anon;

-- Permissions pour les fonctions (accessibles aux utilisateurs authentifiés et anonymes)
GRANT EXECUTE ON FUNCTION cart_add_item TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cart_remove_item TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cart_update_quantity TO authenticated, anon;