const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function applyRLSFix() {
  try {
    console.log('🔧 Application de la politique RLS pour les produits...')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Supprimer les politiques existantes
    const dropPolicies = `
      DROP POLICY IF EXISTS "Products are publicly readable" ON products;
      DROP POLICY IF EXISTS "Public products read access" ON products;
      DROP POLICY IF EXISTS "Public can view active products" ON products;
    `
    
    await supabase.rpc('exec_sql', { sql: dropPolicies })
    console.log('🗑️ Anciennes politiques supprimées')
    
    // Créer la nouvelle politique sécurisée
    const createPolicy = `
      CREATE POLICY "Public can read active products" 
      ON products 
      FOR SELECT 
      TO public
      USING (is_active = true AND status = 'active');
    `
    
    await supabase.rpc('exec_sql', { sql: createPolicy })
    console.log('✅ Nouvelle politique RLS créée')
    
    // Tester l'accès public
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(1)
    
    if (error) {
      console.error('❌ Test accès public échoué:', error)
    } else {
      console.log('✅ Test accès public réussi:', data?.length || 0, 'produit(s)')
    }
    
  } catch (err) {
    console.error('❌ Erreur:', err)
  }
}

applyRLSFix()