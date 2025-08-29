/**
 * HerbisVeritas V2 - Migration Status Checker
 * 
 * Script pour vérifier l'état des migrations et la santé de la base de données
 * Usage: npm run db:status
 * 
 * @author Claude Code  
 * @version 1.0.0
 * @since 2025-01-28
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuration
const EXPECTED_TABLES = [
  'users', 'addresses', 'categories', 'products', 
  'carts', 'cart_items', 'orders', 'order_items',
  'articles', 'partners', 'next_events', 
  'newsletter_subscribers', 'featured_items'
]

const EXPECTED_ENUMS = [
  'user_role', 'address_type', 'order_status', 
  'payment_status', 'product_label', 'featured_type'
]

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configuration Supabase manquante')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Vérifie le statut des tables
 */
async function checkTables() {
  console.log('📊 Vérification des tables...')
  
  const { data, error } = await supabase.rpc('exec', {
    sql: `
      SELECT 
        table_name,
        pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size,
        (SELECT count(*) FROM information_schema.columns 
         WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '%_migrations%'
      ORDER BY table_name;
    `
  })
  
  if (error) {
    console.error('❌ Erreur:', error)
    return
  }
  
  const existingTables = data.map(t => t.table_name)
  const missingTables = EXPECTED_TABLES.filter(t => !existingTables.includes(t))
  
  console.log(`✅ Tables trouvées: ${existingTables.length}/${EXPECTED_TABLES.length}`)
  
  if (existingTables.length > 0) {
    console.log('\n📋 Détail des tables:')
    data.forEach(table => {
      console.log(`   ${table.table_name.padEnd(25)} | ${table.column_count} cols | ${table.size}`)
    })
  }
  
  if (missingTables.length > 0) {
    console.log('\n❌ Tables manquantes:')
    missingTables.forEach(table => console.log(`   - ${table}`))
    return false
  }
  
  return true
}

/**
 * Vérifie les enums
 */
async function checkEnums() {
  console.log('\n🏷️  Vérification des enums...')
  
  const { data, error } = await supabase.rpc('exec', {
    sql: `
      SELECT 
        t.typname as enum_name,
        array_length(array_agg(e.enumlabel), 1) as value_count,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = ANY($1)
      GROUP BY t.typname
      ORDER BY t.typname;
    `,
    params: [EXPECTED_ENUMS]
  })
  
  if (error) {
    console.error('❌ Erreur enums:', error)
    return false
  }
  
  const existingEnums = data.map(e => e.enum_name)
  const missingEnums = EXPECTED_ENUMS.filter(e => !existingEnums.includes(e))
  
  console.log(`✅ Enums trouvés: ${existingEnums.length}/${EXPECTED_ENUMS.length}`)
  
  if (data.length > 0) {
    data.forEach(enumData => {
      console.log(`   ${enumData.enum_name.padEnd(20)} | ${enumData.value_count} valeurs | [${enumData.values.join(', ')}]`)
    })
  }
  
  if (missingEnums.length > 0) {
    console.log('\n❌ Enums manquants:')
    missingEnums.forEach(enumName => console.log(`   - ${enumName}`))
    return false
  }
  
  return true
}

/**
 * Vérifie RLS
 */
async function checkRLS() {
  console.log('\n🔐 Vérification Row Level Security...')
  
  const { data, error } = await supabase.rpc('exec', {
    sql: `
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled,
        (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
      FROM pg_tables t
      WHERE schemaname = 'public'
        AND tablename = ANY($1)
      ORDER BY tablename;
    `,
    params: [EXPECTED_TABLES]
  })
  
  if (error) {
    console.error('❌ Erreur RLS:', error)
    return false
  }
  
  const rlsEnabled = data.filter(t => t.rls_enabled).length
  const withPolicies = data.filter(t => t.policy_count > 0).length
  
  console.log(`✅ Tables avec RLS: ${rlsEnabled}/${data.length}`)
  console.log(`✅ Tables avec policies: ${withPolicies}/${data.length}`)
  
  const problematicTables = data.filter(t => !t.rls_enabled || t.policy_count === 0)
  if (problematicTables.length > 0) {
    console.log('\n⚠️  Tables nécessitant attention:')
    problematicTables.forEach(table => {
      const issues = []
      if (!table.rls_enabled) issues.push('RLS désactivé')
      if (table.policy_count === 0) issues.push('Aucune policy')
      console.log(`   ${table.tablename.padEnd(25)} | ${issues.join(', ')}`)
    })
  }
  
  return problematicTables.length === 0
}

/**
 * Vérifie les performances
 */
async function checkPerformance() {
  console.log('\n⚡ Vérification des performances...')
  
  const { data, error } = await supabase.rpc('exec', {
    sql: `
      SELECT 
        schemaname,
        tablename,
        n_live_tup as row_count,
        pg_size_pretty(pg_total_relation_size(quote_ident(schemaname)||'.'||quote_ident(tablename))) as table_size,
        (SELECT count(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count
      FROM pg_stat_user_tables t
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC;
    `
  })
  
  if (error) {
    console.error('❌ Erreur performance:', error)
    return false
  }
  
  if (data.length > 0) {
    console.log('📈 Statistiques des tables:')
    data.forEach(table => {
      console.log(`   ${table.tablename.padEnd(25)} | ${table.row_count.toString().padStart(8)} rows | ${table.table_size.padEnd(8)} | ${table.index_count} idx`)
    })
  }
  
  return true
}

/**
 * Rapport complet du statut
 */
async function checkMigrationStatus() {
  console.log('🔍 HerbisVeritas V2 - Vérification du Statut des Migrations')
  console.log('=' .repeat(70))
  console.log(`📡 Base de données: ${supabaseUrl}`)
  console.log(`📅 Vérification: ${new Date().toLocaleString('fr-FR')}`)
  
  try {
    // Tests de connectivité
    console.log('\n🔌 Test de connectivité...')
    const { data: connectionTest, error: connError } = await supabase.rpc('exec', {
      sql: 'SELECT current_database(), current_user, version();'
    })
    
    if (connError) {
      console.error('❌ Impossible de se connecter à la base de données')
      console.error(connError)
      return
    }
    
    console.log('✅ Connexion réussie')
    if (connectionTest && connectionTest[0]) {
      console.log(`   Database: ${connectionTest[0].current_database}`)
      console.log(`   User: ${connectionTest[0].current_user}`)
    }
    
    // Vérifications principales
    const tablesOk = await checkTables()
    const enumsOk = await checkEnums()
    const rlsOk = await checkRLS()
    const perfOk = await checkPerformance()
    
    // Résumé final
    console.log('\n' + '=' .repeat(70))
    console.log('📋 RÉSUMÉ DU STATUT')
    console.log('=' .repeat(70))
    
    const statuses = [
      { name: 'Tables', status: tablesOk },
      { name: 'Enums', status: enumsOk },
      { name: 'RLS', status: rlsOk },
      { name: 'Performance', status: perfOk }
    ]
    
    statuses.forEach(({ name, status }) => {
      const icon = status ? '✅' : '❌'
      const text = status ? 'OK' : 'PROBLÈME'
      console.log(`${icon} ${name.padEnd(12)} | ${text}`)
    })
    
    const allOk = statuses.every(s => s.status)
    
    if (allOk) {
      console.log('\n🎉 Migration MVP complètement fonctionnelle!')
      console.log('✅ Prêt pour le développement')
    } else {
      console.log('\n⚠️  Problèmes détectés - migration incomplète')
      console.log('💡 Exécuter: npm run db:migrate')
      console.log('📚 Documentation: supabase/docs/MIGRATION_GUIDE.md')
    }
    
  } catch (err) {
    console.error('❌ Erreur lors de la vérification:', err.message)
    process.exit(1)
  }
}

// Exécution
if (require.main === module) {
  checkMigrationStatus()
}

module.exports = { 
  checkMigrationStatus, 
  checkTables, 
  checkEnums, 
  checkRLS, 
  checkPerformance 
}