/**
 * === 🛒 Orders Workflow RPC Functions - FIXED VERSION ===
 * Correction pour correspondre au schéma MVP réel
 */

-- =======================================
-- RPC: create_order_from_cart (FIXED)
-- =======================================
CREATE OR REPLACE FUNCTION create_order_from_cart(
  p_user_id UUID,
  p_shipping_address_id UUID,
  p_billing_address_id UUID,
  p_payment_method TEXT DEFAULT 'stripe'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_cart_id UUID;
  v_cart_count INTEGER;
  v_subtotal DECIMAL(10,2) := 0;
  v_shipping_fee DECIMAL(10,2) := 4.90;
  v_total_amount DECIMAL(10,2);
  v_shipping_address addresses%ROWTYPE;
  v_billing_address addresses%ROWTYPE;
BEGIN
  -- Récupérer le cart_id de l'utilisateur
  SELECT id INTO v_cart_id 
  FROM carts 
  WHERE user_id = p_user_id;
  
  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'Cart not found for user';
  END IF;

  -- Vérifier que le cart n'est pas vide
  SELECT COUNT(*) INTO v_cart_count 
  FROM cart_items 
  WHERE cart_id = v_cart_id;
  
  IF v_cart_count = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- Vérifier que les adresses appartiennent à l'utilisateur
  SELECT * INTO v_shipping_address 
  FROM addresses 
  WHERE id = p_shipping_address_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Address not found or not owned';
  END IF;
  
  SELECT * INTO v_billing_address 
  FROM addresses 
  WHERE id = p_billing_address_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Address not found or not owned';
  END IF;

  -- Calculer le subtotal
  SELECT COALESCE(SUM(ci.quantity * p.price), 0) INTO v_subtotal
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
  WHERE ci.cart_id = v_cart_id;

  -- Calculer le total avec frais de port
  v_total_amount := v_subtotal + v_shipping_fee;

  -- Générer un numéro de commande unique
  v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(EXTRACT(EPOCH FROM NOW())::INTEGER % 100000, 5, '0');

  -- Créer la commande
  INSERT INTO orders (
    id,
    order_number,
    user_id,
    status,
    payment_status,
    total_amount,
    shipping_fee,
    payment_method,
    shipping_address_id,
    billing_address_id,
    shipping_address_snapshot,
    billing_address_snapshot
  ) VALUES (
    gen_random_uuid(),
    v_order_number,
    p_user_id,
    'pending_payment',
    'pending',
    v_total_amount,
    v_shipping_fee,
    p_payment_method,
    p_shipping_address_id,
    p_billing_address_id,
    row_to_json(v_shipping_address),
    row_to_json(v_billing_address)
  ) RETURNING id INTO v_order_id;

  -- Copier les items du cart vers order_items
  INSERT INTO order_items (
    order_id,
    product_id,
    quantity,
    price_at_purchase,
    product_name_at_purchase,
    product_image_at_purchase
  )
  SELECT 
    v_order_id,
    ci.product_id,
    ci.quantity,
    p.price,
    p.name,
    p.image_url
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
  WHERE ci.cart_id = v_cart_id;

  -- Vider le cart après création de la commande
  DELETE FROM cart_items WHERE cart_id = v_cart_id;

  -- Retourner les détails de la commande
  RETURN json_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total_amount', v_total_amount,
    'subtotal', v_subtotal,
    'shipping_fee', v_shipping_fee,
    'status', 'pending_payment'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- =======================================
-- RPC: update_order_status (UNCHANGED)
-- =======================================
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_new_status order_status,
  p_tracking_number TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status order_status;
  v_order orders%ROWTYPE;
  v_tracking_url TEXT;
BEGIN
  -- Récupérer la commande
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  v_current_status := v_order.status;

  -- Valider les transitions de status
  CASE v_current_status
    WHEN 'pending_payment' THEN
      IF p_new_status NOT IN ('processing', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status;
      END IF;
    WHEN 'processing' THEN
      IF p_new_status NOT IN ('shipped', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status;
      END IF;
    WHEN 'shipped' THEN
      IF p_new_status NOT IN ('delivered', 'returned') THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status;
      END IF;
    WHEN 'delivered' THEN
      IF p_new_status NOT IN ('returned') THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status;
      END IF;
    ELSE
      RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status;
  END CASE;

  -- Générer l'URL de tracking si numéro fourni
  IF p_tracking_number IS NOT NULL THEN
    v_tracking_url := 'https://www.colissimo.fr/portail_colissimo/suivreResultat.do?parcelnumber=' || p_tracking_number;
  END IF;

  -- Mettre à jour la commande
  UPDATE orders 
  SET 
    status = p_new_status,
    tracking_number = COALESCE(p_tracking_number, tracking_number),
    tracking_url = COALESCE(v_tracking_url, tracking_url),
    updated_at = NOW()
  WHERE id = p_order_id;

  -- Retourner le succès
  RETURN json_build_object(
    'success', true,
    'order_id', p_order_id,
    'new_status', p_new_status,
    'tracking_number', p_tracking_number,
    'tracking_url', v_tracking_url
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- =======================================
-- RPC: get_user_orders (FIXED)
-- =======================================
CREATE OR REPLACE FUNCTION get_user_orders(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_orders JSON;
  v_total_count INTEGER;
BEGIN
  -- Compter le total d'orders pour cet utilisateur
  SELECT COUNT(*) INTO v_total_count
  FROM orders
  WHERE user_id = p_user_id;

  -- Récupérer les orders avec pagination (FIXED: remove subtotal)
  SELECT json_agg(
    json_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'status', o.status,
      'payment_status', o.payment_status,
      'total_amount', o.total_amount,
      'shipping_fee', o.shipping_fee,
      'payment_method', o.payment_method,
      'tracking_number', o.tracking_number,
      'tracking_url', o.tracking_url,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'user_id', o.user_id
    ) ORDER BY o.created_at DESC
  ) INTO v_orders
  FROM orders o
  WHERE o.user_id = p_user_id
  ORDER BY o.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;

  -- Retourner les résultats
  RETURN json_build_object(
    'orders', COALESCE(v_orders, '[]'::json),
    'total_count', v_total_count,
    'limit', p_limit,
    'offset', p_offset
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- =======================================
-- RPC: get_order_details (UNCHANGED)
-- =======================================
CREATE OR REPLACE FUNCTION get_order_details(
  p_order_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_items JSON;
  v_shipping_address JSON;
  v_billing_address JSON;
BEGIN
  -- Vérifier que la commande appartient à l'utilisateur
  SELECT * INTO v_order 
  FROM orders 
  WHERE id = p_order_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or access denied';
  END IF;

  -- Récupérer les items de la commande
  SELECT json_agg(
    json_build_object(
      'id', oi.id,
      'product_id', oi.product_id,
      'quantity', oi.quantity,
      'price_at_purchase', oi.price_at_purchase,
      'product_name_at_purchase', oi.product_name_at_purchase,
      'product_image_at_purchase', oi.product_image_at_purchase,
      'product_slug', p.slug,
      'current_price', p.price,
      'current_stock', p.stock_quantity
    )
  ) INTO v_items
  FROM order_items oi
  LEFT JOIN products p ON p.id = oi.product_id
  WHERE oi.order_id = p_order_id;

  -- Récupérer les adresses depuis les snapshots
  v_shipping_address := v_order.shipping_address_snapshot;
  v_billing_address := v_order.billing_address_snapshot;

  -- Retourner tous les détails
  RETURN json_build_object(
    'order', json_build_object(
      'id', v_order.id,
      'order_number', v_order.order_number,
      'status', v_order.status,
      'payment_status', v_order.payment_status,
      'total_amount', v_order.total_amount,
      'shipping_fee', v_order.shipping_fee,
      'payment_method', v_order.payment_method,
      'tracking_number', v_order.tracking_number,
      'tracking_url', v_order.tracking_url,
      'payment_intent_id', v_order.payment_intent_id,
      'stripe_checkout_session_id', v_order.stripe_checkout_session_id,
      'created_at', v_order.created_at,
      'updated_at', v_order.updated_at
    ),
    'items', COALESCE(v_items, '[]'::json),
    'shipping_address', v_shipping_address,
    'billing_address', v_billing_address
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- =======================================
-- Permissions RPC Functions
-- =======================================

-- Accès public pour créer des commandes (utilisateurs connectés)
GRANT EXECUTE ON FUNCTION create_order_from_cart TO authenticated;

-- Accès restreint pour update status (admin seulement)
GRANT EXECUTE ON FUNCTION update_order_status TO service_role;

-- Accès public pour consulter ses commandes
GRANT EXECUTE ON FUNCTION get_user_orders TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_details TO authenticated;

-- =======================================
-- Comments Documentation
-- =======================================

COMMENT ON FUNCTION create_order_from_cart IS 'Crée une commande à partir du panier utilisateur (FIXED: utilise cart_id)';
COMMENT ON FUNCTION update_order_status IS 'Met à jour le status d une commande avec validation des transitions';
COMMENT ON FUNCTION get_user_orders IS 'Récupère les commandes d un utilisateur avec pagination (FIXED: pas de subtotal)';
COMMENT ON FUNCTION get_order_details IS 'Récupère les détails complets d une commande avec items et adresses';