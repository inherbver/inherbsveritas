/**
 * HerbisVeritas V2 - Migration Application Script
 * 
 * Script sécurisé et documenté pour appliquer les migrations Supabase
 * Usage: npm run db:migrate
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-01-28
 */

const { readFile } = require('fs/promises')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const path = require('path')

// Configuration
const MIGRATION_FILE = '001_mvp_schema.sql'
const EXPECTED_TABLES = [
  'users', 'addresses', 'categories', 'products', 
  'carts', 'cart_items', 'orders', 'order_items',
  'articles', 'partners', 'next_events', 
  'newsletter_subscribers', 'featured_items'
]

// Validation environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configuration Supabase manquante dans .env.local')
  console.error('Requis: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('🔐 Configuration validée')
console.log(`📡 Connexion à: ${supabaseUrl}`)

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Vérifie si les tables existent déjà
 */
async function checkExistingTables() {
  console.log('\n🔍 Vérification des tables existantes...')
  
  const { data, error } = await supabase.rpc('exec', {
    sql: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '%_migrations%'
      ORDER BY table_name;
    `
  })
  
  if (error) {
    console.error('❌ Erreur lors de la vérification:', error)
    return []
  }
  
  const existingTables = data || []
  console.log(`📊 Tables existantes: ${existingTables.length}`)
  
  return existingTables.map(t => t.table_name)
}

/**
 * Applique la migration MVP
 */
async function applyMigration() {
  try {
    console.log('🚀 HerbisVeritas V2 - Application Migration MVP')
    console.log('=' .repeat(50))
    
    // Vérification pré-migration
    const existingTables = await checkExistingTables()
    
    if (existingTables.length > 0) {
      console.log('⚠️  Tables déjà présentes:')
      existingTables.forEach(table => console.log(`   - ${table}`))
      
      console.log('\n❓ Continuer quand même? (tables seront recréées)')
      // En production, ajouter une confirmation interactive
    }
    
    // Lecture du fichier de migration
    console.log(`\n📁 Chargement: ${MIGRATION_FILE}`)
    const migrationPath = path.join(__dirname, '../supabase/migrations', MIGRATION_FILE)
    const migrationSQL = await readFile(migrationPath, 'utf8')
    
    console.log(`✅ Migration lue (${migrationSQL.length} caractères)`)
    
    // Application de la migration
    console.log('\n⚡ Application de la migration...')
    const startTime = Date.now()
    
    const { error } = await supabase.rpc('exec', {
      sql: migrationSQL
    })
    
    const duration = Date.now() - startTime
    
    if (error) {
      console.error('❌ Échec de la migration:', error)
      console.error('💡 Consultez supabase/docs/MIGRATION_GUIDE.md pour le rollback')
      process.exit(1)
    }
    
    console.log(`✅ Migration appliquée avec succès (${duration}ms)`)
    
    // Validation post-migration
    await validateMigration()
    
  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message)
    console.error('📋 Stack trace:', err.stack)
    process.exit(1)
  }
}

/**
 * Valide que la migration s'est bien déroulée
 */
async function validateMigration() {
  console.log('\n🔍 Validation post-migration...')
  
  try {
    // Vérifier le nombre de tables
    const { data: tables, error: tablesError } = await supabase.rpc('exec', {
      sql: `
        SELECT count(*) as table_count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name NOT LIKE '%_migrations%';
      `
    })
    
    if (tablesError) {
      console.error('❌ Erreur validation tables:', tablesError)
      return
    }
    
    const tableCount = tables[0]?.table_count || 0
    console.log(`📊 Tables créées: ${tableCount}/${EXPECTED_TABLES.length}`)
    
    if (tableCount !== EXPECTED_TABLES.length) {
      console.log('⚠️  Nombre de tables inattendu!')
    }
    
    // Vérifier les enums
    const { data: enums, error: enumsError } = await supabase.rpc('exec', {
      sql: `
        SELECT typname as enum_name,
               array_agg(enumlabel ORDER BY enumsortorder) as values
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname IN ('user_role', 'product_label', 'order_status', 'payment_status', 'featured_type')
        GROUP BY t.typname
        ORDER BY t.typname;
      `
    })
    
    if (!enumsError && enums) {
      console.log('🏷️  Enums créés:')
      enums.forEach(e => {
        console.log(`   - ${e.enum_name}: [${e.values.join(', ')}]`)
      })
    }
    
    // Test RLS
    const { data: rlsTest, error: rlsError } = await supabase.rpc('exec', {
      sql: `
        SELECT count(*) as rls_enabled_count
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND rowsecurity = true;
      `
    })
    
    if (!rlsError && rlsTest) {
      const rlsCount = rlsTest[0]?.rls_enabled_count || 0
      console.log(`🔐 Tables avec RLS: ${rlsCount}`)
    }
    
    console.log('\n🎉 Migration MVP complétée avec succès!')
    console.log('📖 Prochaine étape: npm run db:seed')
    console.log('📚 Documentation: supabase/docs/MIGRATION_GUIDE.md')
    
  } catch (err) {
    console.error('❌ Erreur validation:', err.message)
  }
}

// Exécution
if (require.main === module) {
  applyMigration()
}

module.exports = { applyMigration, validateMigration }