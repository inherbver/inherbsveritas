/**
 * Création des fonctions RPC orders via appels SQL individuels
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://mntndpelpvcskirnyqvx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udG5kcGVscHZjc2tpcm55cXZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM5MDA0NSwiZXhwIjoyMDcxOTY2MDQ1fQ.WjuxkxS8K9N7bFBYCSia4SWDUR9b50tccyhikthlTS4';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function createRPCFunctions() {
  try {
    console.log('🔧 Creating RPC functions for orders workflow...');
    
    // Test de création d'une fonction simple
    const createSimpleFunction = `
      CREATE OR REPLACE FUNCTION test_connection()
      RETURNS TEXT
      LANGUAGE sql
      AS $$
        SELECT 'Connection successful'::text;
      $$;
    `;

    console.log('Testing SQL execution...');
    
    // Test direct SQL via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        query: createSimpleFunction
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ HTTP Error:', response.status, error);
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('✅ SQL execution result:', result);

  } catch (error) {
    console.error('💥 Error creating RPC functions:', error);
    
    console.log('📝 Manual steps required:');
    console.log('1. Go to https://supabase.com/dashboard/project/mntndpelpvcskirnyqvx/sql');
    console.log('2. Copy the content of supabase/migrations/004_orders_workflow.sql');
    console.log('3. Execute it in the SQL editor');
    console.log('4. Then run the tests again');
  }
}

createRPCFunctions();