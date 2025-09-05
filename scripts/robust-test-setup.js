/**
 * Setup de test robuste basé sur Supawright patterns
 * Gère les problèmes de cache et timing
 */

const { createClient } = require('@supabase/supabase-js');

// Fonction pour attendre que les fonctions RPC soient disponibles
async function waitForRPCFunctions(supabase, maxAttempts = 10, delayMs = 1000) {
  console.log('⏳ Waiting for RPC functions to be available...');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Test simple function
      const { error } = await supabase.rpc('get_user_orders', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_limit: 1,
        p_offset: 0
      });
      
      if (!error || (error && !error.message.includes('Could not find the function'))) {
        console.log(`✅ RPC functions available after ${attempt} attempts`);
        return true;
      }
      
      console.log(`⏳ Attempt ${attempt}/${maxAttempts} - Functions not ready yet...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
    } catch (err) {
      console.log(`⏳ Attempt ${attempt}/${maxAttempts} - Error: ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw new Error('RPC functions not available after maximum attempts');
}

// Pattern setup inspiré de Supawright
async function robustTestSetup() {
  const supabase = createClient(
    'https://mntndpelpvcskirnyqvx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udG5kcGVscHZjc2tpcm55cXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTAwNDUsImV4cCI6MjA3MTk2NjA0NX0.UsKKOod2EDZuRbMEMAh-NCQKpOug2hchd4TQCd80bm8'
  );
  
  // Attendre que les RPC functions soient disponibles
  await waitForRPCFunctions(supabase);
  
  return supabase;
}

module.exports = { waitForRPCFunctions, robustTestSetup };