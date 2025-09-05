/**
 * Script pour vérifier que les fonctions RPC ont bien été créées
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration avec service role key pour voir toutes les fonctions
const supabase = createClient(
  'https://mntndpelpvcskirnyqvx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udG5kcGVscHZjc2tpcm55cXZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM5MDA0NSwiZXhwIjoyMDcxOTY2MDQ1fQ.WjuxkxS8K9N7bFBYCSia4SWDUR9b50tccyhikthlTS4'
);

async function verifyFunctions() {
  console.log('🔍 Checking if RPC functions exist...');

  // Tester chaque fonction RPC une par une
  const functions = [
    'create_order_from_cart',
    'update_order_status', 
    'get_user_orders',
    'get_order_details'
  ];

  for (const funcName of functions) {
    try {
      console.log(`\n📋 Testing ${funcName}...`);
      
      // Test avec paramètres invalides pour voir si la fonction existe
      let testParams = {};
      
      switch (funcName) {
        case 'create_order_from_cart':
          testParams = {
            p_user_id: '00000000-0000-0000-0000-000000000000',
            p_shipping_address_id: '00000000-0000-0000-0000-000000000000',
            p_billing_address_id: '00000000-0000-0000-0000-000000000000',
            p_payment_method: 'stripe'
          };
          break;
        case 'update_order_status':
          testParams = {
            p_order_id: '00000000-0000-0000-0000-000000000000',
            p_new_status: 'processing'
          };
          break;
        case 'get_user_orders':
          testParams = {
            p_user_id: '00000000-0000-0000-0000-000000000000',
            p_limit: 1,
            p_offset: 0
          };
          break;
        case 'get_order_details':
          testParams = {
            p_order_id: '00000000-0000-0000-0000-000000000000',
            p_user_id: '00000000-0000-0000-0000-000000000000'
          };
          break;
      }

      const { data, error } = await supabase.rpc(funcName, testParams);

      if (error) {
        if (error.code === 'PGRST202') {
          console.log(`❌ Function ${funcName} NOT FOUND`);
        } else {
          console.log(`✅ Function ${funcName} EXISTS (error: ${error.message})`);
        }
      } else {
        console.log(`✅ Function ${funcName} EXISTS and returned data`);
      }
      
    } catch (err) {
      console.log(`❌ Error testing ${funcName}:`, err.message);
    }
  }

  console.log('\n📝 If functions are not found, try:');
  console.log('1. Go to Supabase Dashboard SQL Editor');
  console.log('2. Check which schema the functions are in:');
  console.log(`   SELECT schemaname, proname FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE proname LIKE '%order%';`);
  console.log('3. If they are in another schema, either:');
  console.log('   - Move them to public schema, OR');
  console.log('   - Set search_path to include that schema');
}

verifyFunctions();