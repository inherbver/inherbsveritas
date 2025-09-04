-- ============================================================================
-- Migration 002: Modern Cart Functions & Optimized Views
-- Fonctions atomiques pour architecture cart moderne React 19 + TanStack Query
-- ============================================================================

-- Supprimer vue existante si elle existe
DROP VIEW IF EXISTS user_cart_view;

-- =============================================================================
-- Vue Optimisée User Cart - Performance & Simplicité
-- =============================================================================

CREATE VIEW user_cart_view AS
SELECT 
  c.id,
  c.user_id,
  c.updated_at,
  c.created_at,
  -- Items JSON agregés
  COALESCE(
    json_agg(
      json_build_object(
        'id', ci.id,
        'product_id', ci.product_id,
        'quantity', ci.quantity,
        'price', ci.price,
        'product', json_build_object(
          'id', p.id,
          'name', p.i18n->'fr'->>'name',
          'slug', p.slug,
          'price', p.price,
          'image_url', p.image_url,
          'stock', p.stock,
          'is_active', p.is_active,
          'herbis_veritas_label', p.herbis_veritas_label
        )
      ) ORDER BY ci.created_at
    ) FILTER (WHERE ci.id IS NOT NULL),
    '[]'::json
  ) as items,
  -- Totaux calculés
  COALESCE(SUM(ci.quantity), 0) as total_items,
  COALESCE(SUM(ci.quantity * ci.price), 0) as subtotal
FROM carts c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
LEFT JOIN products p ON ci.product_id = p.id AND p.is_active = true
WHERE c.status = 'active'
GROUP BY c.id, c.user_id, c.updated_at, c.created_at;

-- Index pour performance vue
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carts_user_status ON carts(user_id, status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_cart_product ON cart_items(cart_id, product_id);

-- =============================================================================
-- Fonction: cart_add_item - Ajout/Mise à jour atomique
-- =============================================================================

CREATE OR REPLACE FUNCTION cart_add_item(
  p_product_id UUID,
  p_quantity INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_cart_id UUID;
  v_user_id TEXT;
  v_product products%ROWTYPE;
  v_existing_quantity INTEGER := 0;
  v_new_quantity INTEGER;
  v_result JSON;
BEGIN
  -- 1. Auth check
  v_user_id := auth.uid()::TEXT;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- 2. Validation quantité
  IF p_quantity <= 0 OR p_quantity > 99 THEN
    RAISE EXCEPTION 'Invalid quantity: must be between 1 and 99' USING ERRCODE = 'check_violation';
  END IF;

  -- 3. Vérification produit
  SELECT * INTO v_product FROM products 
  WHERE id = p_product_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or inactive' USING ERRCODE = 'foreign_key_violation';
  END IF;

  -- 4. Transaction atomique
  BEGIN
    -- Trouver ou créer cart actif
    SELECT id INTO v_cart_id
    FROM carts 
    WHERE user_id = v_user_id AND status = 'active'
    LIMIT 1;
    
    IF v_cart_id IS NULL THEN
      INSERT INTO carts (user_id, status) 
      VALUES (v_user_id, 'active')
      RETURNING id INTO v_cart_id;
    END IF;

    -- Vérifier item existant
    SELECT quantity INTO v_existing_quantity
    FROM cart_items
    WHERE cart_id = v_cart_id AND product_id = p_product_id;
    
    v_new_quantity := COALESCE(v_existing_quantity, 0) + p_quantity;

    -- Vérification stock
    IF v_product.stock IS NOT NULL AND v_product.stock < v_new_quantity THEN
      RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', 
        v_product.stock, v_new_quantity USING ERRCODE = 'check_violation';
    END IF;

    -- Ajouter ou mettre à jour item
    INSERT INTO cart_items (cart_id, product_id, quantity, price)
    VALUES (v_cart_id, p_product_id, p_quantity, v_product.price)
    ON CONFLICT (cart_id, product_id)
    DO UPDATE SET 
      quantity = cart_items.quantity + EXCLUDED.quantity,
      price = EXCLUDED.price,  -- Mise à jour prix au cas où changé
      updated_at = NOW();
    
    -- Mettre à jour timestamp cart
    UPDATE carts 
    SET updated_at = NOW() 
    WHERE id = v_cart_id;
    
    -- Retourner cart complet via vue
    SELECT row_to_json(cart.*) INTO v_result
    FROM user_cart_view cart
    WHERE cart.user_id = v_user_id;
    
    RETURN COALESCE(v_result, '{}'::json);

  EXCEPTION
    WHEN OTHERS THEN
      -- Log l'erreur et re-raise
      RAISE NOTICE 'cart_add_item error for user % product %: %', v_user_id, p_product_id, SQLERRM;
      RAISE;
  END;
END;
$$;

-- =============================================================================
-- Fonction: cart_update_item - Mise à jour quantité
-- =============================================================================

CREATE OR REPLACE FUNCTION cart_update_item(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_cart_id UUID;
  v_user_id TEXT;
  v_product products%ROWTYPE;
  v_result JSON;
BEGIN
  -- 1. Auth check
  v_user_id := auth.uid()::TEXT;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- 2. Validation quantité
  IF p_quantity < 0 OR p_quantity > 99 THEN
    RAISE EXCEPTION 'Invalid quantity: must be between 0 and 99' USING ERRCODE = 'check_violation';
  END IF;

  -- 3. Si quantité = 0, supprimer
  IF p_quantity = 0 THEN
    RETURN cart_remove_item(p_product_id);
  END IF;

  -- 4. Vérification produit et stock
  SELECT * INTO v_product FROM products 
  WHERE id = p_product_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or inactive' USING ERRCODE = 'foreign_key_violation';
  END IF;

  IF v_product.stock IS NOT NULL AND v_product.stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', 
      v_product.stock, p_quantity USING ERRCODE = 'check_violation';
  END IF;

  -- 5. Trouver cart
  SELECT id INTO v_cart_id
  FROM carts 
  WHERE user_id = v_user_id AND status = 'active'
  LIMIT 1;
  
  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'No active cart found' USING ERRCODE = 'no_data_found';
  END IF;

  -- 6. Mettre à jour item
  UPDATE cart_items 
  SET 
    quantity = p_quantity,
    price = v_product.price,  -- Prix à jour
    updated_at = NOW()
  WHERE cart_id = v_cart_id AND product_id = p_product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cart item not found' USING ERRCODE = 'no_data_found';
  END IF;

  -- 7. Mettre à jour timestamp cart
  UPDATE carts 
  SET updated_at = NOW() 
  WHERE id = v_cart_id;

  -- 8. Retourner cart mis à jour
  SELECT row_to_json(cart.*) INTO v_result
  FROM user_cart_view cart
  WHERE cart.user_id = v_user_id;
  
  RETURN COALESCE(v_result, '{}'::json);
END;
$$;

-- =============================================================================
-- Fonction: cart_remove_item - Suppression item
-- =============================================================================

CREATE OR REPLACE FUNCTION cart_remove_item(
  p_product_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_cart_id UUID;
  v_user_id TEXT;
  v_result JSON;
BEGIN
  -- 1. Auth check
  v_user_id := auth.uid()::TEXT;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- 2. Trouver cart
  SELECT id INTO v_cart_id
  FROM carts 
  WHERE user_id = v_user_id AND status = 'active'
  LIMIT 1;
  
  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'No active cart found' USING ERRCODE = 'no_data_found';
  END IF;

  -- 3. Supprimer item
  DELETE FROM cart_items 
  WHERE cart_id = v_cart_id AND product_id = p_product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cart item not found' USING ERRCODE = 'no_data_found';
  END IF;

  -- 4. Mettre à jour timestamp cart
  UPDATE carts 
  SET updated_at = NOW() 
  WHERE id = v_cart_id;

  -- 5. Retourner cart mis à jour
  SELECT row_to_json(cart.*) INTO v_result
  FROM user_cart_view cart
  WHERE cart.user_id = v_user_id;
  
  RETURN COALESCE(v_result, '{}'::json);
END;
$$;

-- =============================================================================
-- Fonction: cart_clear - Vider cart complet
-- =============================================================================

CREATE OR REPLACE FUNCTION cart_clear()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_cart_id UUID;
  v_user_id TEXT;
  v_result JSON;
BEGIN
  -- 1. Auth check
  v_user_id := auth.uid()::TEXT;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- 2. Trouver cart
  SELECT id INTO v_cart_id
  FROM carts 
  WHERE user_id = v_user_id AND status = 'active'
  LIMIT 1;
  
  IF v_cart_id IS NULL THEN
    -- Pas de cart = déjà vide
    RETURN '{"id": null, "items": [], "total_items": 0, "subtotal": 0}'::json;
  END IF;

  -- 3. Supprimer tous les items
  DELETE FROM cart_items 
  WHERE cart_id = v_cart_id;

  -- 4. Marquer cart comme completed ou le supprimer
  UPDATE carts 
  SET status = 'completed', updated_at = NOW() 
  WHERE id = v_cart_id;

  -- 5. Retourner cart vide
  RETURN '{"id": null, "items": [], "total_items": 0, "subtotal": 0}'::json;
END;
$$;

-- =============================================================================
-- Fonction: cart_merge_guest - Fusion cart invité
-- =============================================================================

CREATE OR REPLACE FUNCTION cart_merge_guest(
  p_guest_items JSON
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_cart_id UUID;
  v_user_id TEXT;
  v_guest_item JSON;
  v_product_id UUID;
  v_quantity INTEGER;
  v_product products%ROWTYPE;
  v_result JSON;
  v_merged_count INTEGER := 0;
BEGIN
  -- 1. Auth check
  v_user_id := auth.uid()::TEXT;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- 2. Créer ou récupérer cart user
  SELECT id INTO v_cart_id
  FROM carts 
  WHERE user_id = v_user_id AND status = 'active'
  LIMIT 1;
  
  IF v_cart_id IS NULL THEN
    INSERT INTO carts (user_id, status) 
    VALUES (v_user_id, 'active')
    RETURNING id INTO v_cart_id;
  END IF;

  -- 3. Parser et fusionner items invité
  FOR v_guest_item IN SELECT * FROM json_array_elements(p_guest_items)
  LOOP
    -- Extraire données item
    v_product_id := (v_guest_item->>'product_id')::UUID;
    v_quantity := (v_guest_item->>'quantity')::INTEGER;
    
    -- Validation basique
    IF v_product_id IS NULL OR v_quantity IS NULL OR v_quantity <= 0 THEN
      CONTINUE; -- Skip item invalide
    END IF;

    -- Vérifier produit existe et actif
    SELECT * INTO v_product FROM products 
    WHERE id = v_product_id AND is_active = true;
    
    IF NOT FOUND THEN
      CONTINUE; -- Skip produit introuvable
    END IF;

    -- Vérifier stock
    IF v_product.stock IS NOT NULL AND v_product.stock < v_quantity THEN
      CONTINUE; -- Skip si stock insuffisant
    END IF;

    -- Fusionner avec cart existant
    INSERT INTO cart_items (cart_id, product_id, quantity, price)
    VALUES (v_cart_id, v_product_id, v_quantity, v_product.price)
    ON CONFLICT (cart_id, product_id)
    DO UPDATE SET 
      quantity = cart_items.quantity + EXCLUDED.quantity,
      price = EXCLUDED.price,
      updated_at = NOW();
    
    v_merged_count := v_merged_count + 1;
  END LOOP;

  -- 4. Mettre à jour timestamp cart
  UPDATE carts 
  SET updated_at = NOW() 
  WHERE id = v_cart_id;

  -- 5. Retourner cart fusionné
  SELECT row_to_json(cart.*) INTO v_result
  FROM user_cart_view cart
  WHERE cart.user_id = v_user_id;
  
  -- Ajouter info fusion
  v_result := v_result || json_build_object('merged_items', v_merged_count);
  
  RETURN COALESCE(v_result, '{}'::json);
END;
$$;

-- =============================================================================
-- RLS Policies Optimisées
-- =============================================================================

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Users can manage their own cart" ON carts;
DROP POLICY IF EXISTS "Users can manage their cart items" ON cart_items;

-- Nouvelles policies optimisées
CREATE POLICY "cart_user_access" ON carts
  FOR ALL USING (auth.uid()::TEXT = user_id);

CREATE POLICY "cart_items_user_access" ON cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM carts 
      WHERE carts.id = cart_items.cart_id 
      AND carts.user_id = auth.uid()::TEXT
    )
  );

-- Policy pour la vue (lecture seule)
CREATE POLICY "user_cart_view_access" ON user_cart_view
  FOR SELECT USING (user_id = auth.uid()::TEXT);

-- =============================================================================
-- Grants & Sécurité
-- =============================================================================

-- Accès functions pour rôles appropriés
GRANT EXECUTE ON FUNCTION cart_add_item TO authenticated;
GRANT EXECUTE ON FUNCTION cart_update_item TO authenticated; 
GRANT EXECUTE ON FUNCTION cart_remove_item TO authenticated;
GRANT EXECUTE ON FUNCTION cart_clear TO authenticated;
GRANT EXECUTE ON FUNCTION cart_merge_guest TO authenticated;

-- Accès vue
GRANT SELECT ON user_cart_view TO authenticated;

-- =============================================================================
-- Comments Documentation
-- =============================================================================

COMMENT ON VIEW user_cart_view IS 
'Vue optimisée pour cart utilisateur avec items agrégés JSON et totaux calculés';

COMMENT ON FUNCTION cart_add_item IS 
'Ajoute produit au cart ou incrémente quantité existante. Atomique et sécurisé.';

COMMENT ON FUNCTION cart_update_item IS 
'Met à jour quantité item cart. Supprime si quantité = 0.';

COMMENT ON FUNCTION cart_remove_item IS 
'Supprime item du cart utilisateur.';

COMMENT ON FUNCTION cart_clear IS 
'Vide complètement le cart utilisateur.';

COMMENT ON FUNCTION cart_merge_guest IS 
'Fusionne items cart invité avec cart utilisateur lors connexion.';