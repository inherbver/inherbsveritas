-- Fix get_user_orders GROUP BY issue
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

  -- Récupérer les orders avec pagination (FIXED: proper JSON aggregation)
  WITH ordered_results AS (
    SELECT 
      o.id,
      o.order_number,
      o.status,
      o.payment_status,
      o.total_amount,
      o.shipping_fee,
      o.payment_method,
      o.tracking_number,
      o.tracking_url,
      o.created_at,
      o.updated_at,
      o.user_id
    FROM orders o
    WHERE o.user_id = p_user_id
    ORDER BY o.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT json_agg(
    json_build_object(
      'id', id,
      'order_number', order_number,
      'status', status,
      'payment_status', payment_status,
      'total_amount', total_amount,
      'shipping_fee', shipping_fee,
      'payment_method', payment_method,
      'tracking_number', tracking_number,
      'tracking_url', tracking_url,
      'created_at', created_at,
      'updated_at', updated_at,
      'user_id', user_id
    )
  ) INTO v_orders
  FROM ordered_results;

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