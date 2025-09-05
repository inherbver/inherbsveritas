/**
 * Script temporaire pour appliquer la migration 004 orders workflow
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = 'https://mntndpelpvcskirnyqvx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udG5kcGVscHZjc2tpcm55cXZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM5MDA0NSwiZXhwIjoyMDcxOTY2MDQ1fQ.WjuxkxS8K9N7bFBYCSia4SWDUR9b50tccyhikthlTS4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, '../supabase/migrations/004_orders_workflow.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Applying migration 004_orders_workflow.sql...');
    
    // Diviser le SQL en statements individuels (très simpliste)
    const statements = migrationSQL
      .split('$$;')
      .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--') && !stmt.trim().startsWith('/*'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim() + (i < statements.length - 1 ? '$$;' : '');
      
      if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }

      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement
      });

      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error);
        throw error;
      }
    }

    console.log('✅ Migration 004_orders_workflow.sql applied successfully!');
    
    // Tester que les fonctions sont bien créées
    console.log('🧪 Testing RPC functions...');
    
    const { data: testData, error: testError } = await supabase.rpc('get_user_orders', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_limit: 1,
      p_offset: 0
    });

    if (testError) {
      console.log('⚠️ RPC function test failed (expected for non-existent user):', testError.message);
    } else {
      console.log('✅ RPC function test successful');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();