/**
 * Test simple d'une seule fonction pour voir si ça passe
 */

const { createClient } = require('@supabase/supabase-js');

// Utilisation de la même configuration que les tests
const supabaseUrl = 'https://mntndpelpvcskirnyqvx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udG5kcGVscHZjc2tpcm55cXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTAwNDUsImV4cCI6MjA3MTk2NjA0NX0.UsKKOod2EDZuRbMEMAh-NCQKpOug2hchd4TQCd80bm8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSingleFunction() {
  console.log('🧪 Testing get_user_orders with different parameter combinations...\n');
  
  const testUserId = '00000000-0000-0000-0000-000000000000';
  
  // Test 1: Order original (user_id, limit, offset)
  console.log('📋 Test 1: Original order (user_id, limit, offset)');
  try {
    const { data, error } = await supabase.rpc('get_user_orders', {
      p_user_id: testUserId,
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

  // Test 2: Order suggéré par erreur (limit, offset, user_id)
  console.log('\n📋 Test 2: Suggested order (limit, offset, user_id)');
  try {
    const { data, error } = await supabase.rpc('get_user_orders', {
      p_limit: 1,
      p_offset: 0,
      p_user_id: testUserId
    });
    
    if (error) {
      console.log('❌ Error:', error.code, error.message);
    } else {
      console.log('✅ Success:', data);
    }
  } catch (err) {
    console.log('💥 Exception:', err.message);
  }

  // Test 3: Juste avec user_id
  console.log('\n📋 Test 3: Just user_id (using defaults)');
  try {
    const { data, error } = await supabase.rpc('get_user_orders', {
      p_user_id: testUserId
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

testSingleFunction();