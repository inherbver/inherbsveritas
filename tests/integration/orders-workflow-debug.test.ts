/**
 * Tests Debug avec délai pour identifier problème timing
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Setup test database avec même configuration que le test original
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe('Orders Workflow Debug - Timing Test', () => {
  beforeAll(async () => {
    console.log('🧪 Waiting for Supabase to be ready...');
    // Attendre 5 secondes pour que Supabase soit prêt
    await new Promise(resolve => setTimeout(resolve, 5000));
  });

  it('should find get_user_orders function after delay', async () => {
    const { data, error } = await supabase.rpc('get_user_orders', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_limit: 1,
      p_offset: 0
    });

    console.log('Function call result:', { data, error });

    expect(error).toBeNull();
    expect(data).toHaveProperty('orders');
    expect(data).toHaveProperty('total_count');
  });

  it('should find create_order_from_cart function after delay', async () => {
    const { data, error } = await supabase.rpc('create_order_from_cart', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_shipping_address_id: '00000000-0000-0000-0000-000000000000', 
      p_billing_address_id: '00000000-0000-0000-0000-000000000000',
      p_payment_method: 'stripe'
    });

    console.log('Function call result:', { data, error });

    // Même si erreur business logic, fonction doit être trouvée
    expect(error?.code).not.toBe('PGRST202');
  });
});