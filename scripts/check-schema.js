/**
 * Script pour vérifier la structure réelle des tables
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mntndpelpvcskirnyqvx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udG5kcGVscHZjc2tpcm55cXZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM5MDA0NSwiZXhwIjoyMDcxOTY2MDQ1fQ.WjuxkxS8K9N7bFBYCSia4SWDUR9b50tccyhikthlTS4'
);

async function checkSchema() {
  console.log('🔍 Checking table structures...');

  const tables = ['cart_items', 'orders', 'order_items', 'addresses'];

  for (const table of tables) {
    try {
      console.log(`\n📋 Checking ${table} structure:`);
      
      // Récupérer structure de table via information_schema
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', table)
        .eq('table_schema', 'public')
        .order('ordinal_position');

      if (error) {
        console.log(`❌ Error: ${error.message}`);
      } else if (data && data.length > 0) {
        console.log('Columns:');
        data.forEach(col => {
          console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
      } else {
        console.log('❌ Table not found or no access');
      }
      
    } catch (err) {
      console.log(`❌ Error checking ${table}:`, err.message);
    }
  }

  // Aussi vérifier via une query directe simple
  console.log('\n🧪 Testing direct table access:');
  
  try {
    const { data: cartTest, error: cartError } = await supabase
      .from('cart_items')
      .select('*')
      .limit(1);
    
    if (cartError) {
      console.log(`❌ cart_items: ${cartError.message}`);
    } else {
      console.log(`✅ cart_items: accessible (${cartTest ? cartTest.length : 0} rows)`);
    }
    
  } catch (err) {
    console.log(`❌ cart_items direct access: ${err.message}`);
  }

  try {
    const { data: ordersTest, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (ordersError) {
      console.log(`❌ orders: ${ordersError.message}`);
    } else {
      console.log(`✅ orders: accessible (${ordersTest ? ordersTest.length : 0} rows)`);
    }
    
  } catch (err) {
    console.log(`❌ orders direct access: ${err.message}`);
  }
}

checkSchema();