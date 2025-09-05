/**
 * Test direct des fonctions RPC pour diagnostiquer le problème
 */

const { createClient } = require('@supabase/supabase-js');

async function testFunctionsDirect() {
  console.log('🧪 Testing RPC functions directly...\n');
  
  // Test avec anon key (comme les tests)
  const supabaseAnon = createClient(
    'https://mntndpelpvcskirnyqvx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udG5kcGVscHZjc2tpcm55cXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTAwNDUsImV4cCI6MjA3MTk2NjA0NX0.UsKKOod2EDZuRbMEMAh-NCQKpOug2hchd4TQCd80bm8'
  );

  // Test avec service key
  const supabaseService = createClient(
    'https://mntndpelpvcskirnyqvx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udG5kcGVscHZjc2tpcm55cXZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM5MDA0NSwiZXhwIjoyMDcxOTY2MDQ1fQ.WjuxkxS8K9N7bFBYCSia4SWDUR9b50tccyhikthlTS4'
  );

  // Test 1: Anon key
  console.log('📋 Testing with ANON key...');
  try {
    const { data, error } = await supabaseAnon.rpc('get_user_orders', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_limit: 1,
      p_offset: 0
    });
    
    if (error) {
      console.log('❌ ANON Error:', error.code, error.message);
    } else {
      console.log('✅ ANON Success:', data);
    }
  } catch (err) {
    console.log('💥 ANON Exception:', err.message);
  }

  // Test 2: Service key  
  console.log('\n📋 Testing with SERVICE key...');
  try {
    const { data, error } = await supabaseService.rpc('get_user_orders', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_limit: 1,
      p_offset: 0
    });
    
    if (error) {
      console.log('❌ SERVICE Error:', error.code, error.message);
    } else {
      console.log('✅ SERVICE Success:', data);
    }
  } catch (err) {
    console.log('💥 SERVICE Exception:', err.message);
  }

  // Test 3: Lister toutes les fonctions disponibles via SQL
  console.log('\n📋 Checking available functions in database...');
  try {
    const { data, error } = await supabaseService.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname, 
          proname as function_name,
          pronargs as num_args
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE proname LIKE '%order%'
        ORDER BY proname;
      `
    });
    
    if (error) {
      console.log('❌ SQL Error:', error.message);
      
      // Alternative: Try to check via direct query
      console.log('\n🔍 Trying alternative function check...');
      const { data: funcData, error: funcError } = await supabaseService
        .from('information_schema.routines')
        .select('routine_name, routine_schema')
        .ilike('routine_name', '%order%')
        .eq('routine_schema', 'public');
        
      if (funcError) {
        console.log('❌ Alternative check failed:', funcError.message);
      } else {
        console.log('✅ Functions found:', funcData);
      }
    } else {
      console.log('✅ Functions in database:', data);
    }
  } catch (err) {
    console.log('💥 SQL Exception:', err.message);
  }

  console.log('\n💡 Possible solutions:');
  console.log('1. Wait 5-10 minutes for Supabase cache refresh');
  console.log('2. Try restarting Supabase services');
  console.log('3. Check function permissions are correct');
  console.log('4. Verify functions are in public schema');
}

testFunctionsDirect();