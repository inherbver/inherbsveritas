/**
 * Debug configuration différence entre tests direct et Jest
 */

// Charger dotenv comme Jest
require('dotenv').config({ path: '.env.test' });

const { createClient } = require('@supabase/supabase-js');

async function debugConfiguration() {
  console.log('🔍 Debug Test Configuration...\n');
  
  console.log('Environment Variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  
  // Configuration exactement comme les tests Jest
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing environment variables!');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  console.log('\n🧪 Testing with exact Jest configuration...');
  
  try {
    const { data, error } = await supabase.rpc('get_user_orders', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_limit: 1,
      p_offset: 0
    });
    
    if (error) {
      console.log('❌ Error:', error.code, error.message);
    } else {
      console.log('✅ Success:', data);
    }
  } catch (err) {
    console.log('💥 Exception:', err.message);
  }

  console.log('\n📋 Testing create_order_from_cart...');
  
  try {
    const { data, error } = await supabase.rpc('create_order_from_cart', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_shipping_address_id: '00000000-0000-0000-0000-000000000000',
      p_billing_address_id: '00000000-0000-0000-0000-000000000000',
      p_payment_method: 'stripe'
    });
    
    if (error) {
      console.log('❌ Error:', error.code, error.message);
    } else {
      console.log('✅ Success:', data);
    }
  } catch (err) {
    console.log('💥 Exception:', err.message);
  }
}

debugConfiguration();