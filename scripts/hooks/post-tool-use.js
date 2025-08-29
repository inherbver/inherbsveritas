/**
 * HerbisVeritas V2 - Hook PostToolUse
 * 
 * Hook exécuté après chaque utilisation d'outil
 * Valide les résultats et maintient la traçabilité MVP
 * 
 * @version 1.0.0
 * @since 2025-01-28
 */

const fs = require('fs')
const path = require('path')

module.exports = {
  name: "MVP Post-Tool Auditor",
  description: "Audit post-action et traçabilité MVP",
  
  async execute(context) {
    try {
      const { tool, parameters, result } = context
      
      // Audit par type d'outil
      const auditResult = await auditToolResult(tool, parameters, result, context)
      
      // Mettre à jour le log de traçabilité
      await updateTraceabilityLog(tool, parameters, auditResult, context)
      
      // Vérifier la cohérence globale si modification architecturale
      if (auditResult.requiresArchitectureCheck) {
        await checkArchitecturalConsistency(context)
      }
      
      console.log(`✅ PostToolUse audité: ${tool} - ${auditResult.status}`)
      
      return { shouldContinue: true }
      
    } catch (error) {
      console.error('❌ Erreur Hook PostToolUse:', error)
      return { shouldContinue: true }
    }
  }
}

/**
 * Audit du résultat par type d'outil
 */
async function auditToolResult(tool, params, result, context) {
  const auditors = {
    'Write': auditFileWrite,
    'Edit': auditFileEdit,
    'MultiEdit': auditFileEdit,
    'Bash': auditBashExecution,
    'TodoWrite': auditTodoUpdate
  }
  
  const auditor = auditors[tool]
  if (auditor) {
    return await auditor(params, result, context)
  }
  
  return { status: 'no_audit_required' }
}

/**
 * Audit des créations de fichiers
 */
function auditFileWrite(params, result, context) {
  const { file_path, content } = params
  
  let auditResult = {
    status: 'success',
    requiresArchitectureCheck: false,
    notes: []
  }
  
  // Audit fichiers critiques
  if (file_path) {
    // Schéma base de données
    if (file_path.includes('migration') || file_path.includes('database')) {
      auditResult.requiresArchitectureCheck = true
      auditResult.notes.push('🏗️ Modification architecturale détectée')
      
      // Compter les tables dans le nouveau schéma
      if (content && content.includes('CREATE TABLE')) {
        const tableCount = (content.match(/CREATE TABLE/g) || []).length
        if (tableCount !== 13) {
          auditResult.status = 'warning'
          auditResult.notes.push(`⚠️ Nombre de tables non-MVP: ${tableCount} (attendu: 13)`)
        }
      }
    }
    
    // Configuration i18n
    if (file_path.includes('i18n') || file_path.includes('routing')) {
      const locales = extractLocalesFromContent(content)
      const allowedLocales = ['fr', 'en']
      const invalidLocales = locales.filter(l => !allowedLocales.includes(l))
      
      if (invalidLocales.length > 0) {
        auditResult.status = 'violation'
        auditResult.notes.push(`🚫 Locales non-MVP: ${invalidLocales.join(', ')}`)
      }
    }
    
    // Types TypeScript
    if (file_path.includes('types/database.ts')) {
      auditResult.requiresArchitectureCheck = true
      auditResult.notes.push('📝 Types de base de données modifiés')
    }
  }
  
  return auditResult
}

/**
 * Audit des éditions de fichiers
 */
function auditFileEdit(params, result, context) {
  // Similaire à auditFileWrite mais pour les modifications
  return auditFileWrite(params, result, context)
}

/**
 * Audit des exécutions Bash
 */
function auditBashExecution(params, result, context) {
  const { command } = params
  
  let auditResult = {
    status: 'success',
    requiresArchitectureCheck: false,
    notes: []
  }
  
  // Audit commandes de base de données
  if (command.includes('db:migrate') || command.includes('supabase')) {
    auditResult.requiresArchitectureCheck = true
    auditResult.notes.push('💾 Migration de base de données exécutée')
    
    // Vérifier si la commande a réussi
    if (result && result.includes('error') || result.includes('failed')) {
      auditResult.status = 'error'
      auditResult.notes.push('❌ Échec de migration détecté')
    }
  }
  
  // Audit installations de packages
  if (command.includes('npm install') || command.includes('yarn add')) {
    auditResult.notes.push('📦 Nouvelle dépendance installée')
    
    // Vérifier si c'est une dépendance MVP-approved
    const nonMvpPackages = [
      'prisma', '@prisma/client', // Remplacé par Supabase
      'next-auth', // Remplacé par Supabase Auth
      '@next/mdx'   // Pas dans le scope MVP
    ]
    
    const hasNonMvpPackage = nonMvpPackages.some(pkg => 
      command.includes(pkg)
    )
    
    if (hasNonMvpPackage) {
      auditResult.status = 'warning'
      auditResult.notes.push('⚠️ Package potentiellement non-MVP installé')
    }
  }
  
  return auditResult
}

/**
 * Audit des mises à jour TodoWrite
 */
function auditTodoUpdate(params, result, context) {
  const { todos } = params
  
  const inProgressCount = todos.filter(t => t.status === 'in_progress').length
  const completedCount = todos.filter(t => t.status === 'completed').length
  
  return {
    status: 'success',
    requiresArchitectureCheck: false,
    notes: [
      `📋 Todo mis à jour: ${completedCount} terminées, ${inProgressCount} en cours`
    ]
  }
}

/**
 * Met à jour le log de traçabilité
 */
async function updateTraceabilityLog(tool, params, auditResult, context) {
  const logPath = path.join(process.cwd(), '.claude', 'traceability.log')
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    tool,
    file_path: params.file_path || 'N/A',
    status: auditResult.status,
    notes: auditResult.notes,
    architecture_impact: auditResult.requiresArchitectureCheck
  }
  
  const logLine = `${logEntry.timestamp} | ${tool} | ${auditResult.status} | ${logEntry.file_path} | ${auditResult.notes.join('; ')}\n`
  
  try {
    // Créer le dossier .claude s'il n'existe pas
    const claudeDir = path.dirname(logPath)
    if (!fs.existsSync(claudeDir)) {
      fs.mkdirSync(claudeDir, { recursive: true })
    }
    
    // Ajouter au log
    fs.appendFileSync(logPath, logLine, 'utf8')
  } catch (error) {
    console.warn('⚠️ Impossible d\'écrire le log de traçabilité:', error.message)
  }
}

/**
 * Vérifie la cohérence architecturale globale
 */
async function checkArchitecturalConsistency(context) {
  try {
    // Vérifier que les fichiers critiques sont cohérents
    const criticalFiles = [
      'src/types/database.ts',
      'supabase/migrations/001_mvp_schema.sql',
      '.env.local'
    ]
    
    let consistencyIssues = []
    
    criticalFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file)
      if (!fs.existsSync(filePath)) {
        consistencyIssues.push(`❌ Fichier critique manquant: ${file}`)
      }
    })
    
    if (consistencyIssues.length > 0) {
      console.log('🔍 Problèmes de cohérence architecturale détectés:')
      consistencyIssues.forEach(issue => console.log(`   ${issue}`))
    } else {
      console.log('✅ Cohérence architecturale maintenue')
    }
    
  } catch (error) {
    console.warn('⚠️ Impossible de vérifier la cohérence architecturale:', error.message)
  }
}

/**
 * Extrait les locales d'un contenu
 */
function extractLocalesFromContent(content) {
  if (!content) return []
  
  const localeMatches = content.match(/['"]([a-z]{2})['"]|locales:\s*\[(.*?)\]/gs)
  if (!localeMatches) return []
  
  const locales = []
  localeMatches.forEach(match => {
    const singleLocale = match.match(/['"]([a-z]{2})['"]/)?.[1]
    if (singleLocale) locales.push(singleLocale)
    
    const multipleLocales = match.match(/locales:\s*\[(.*?)\]/s)?.[1]
    if (multipleLocales) {
      const extracted = multipleLocales.match(/['"]([a-z]{2})['"]/g)
      if (extracted) {
        extracted.forEach(l => {
          const locale = l.replace(/['"]/g, '')
          locales.push(locale)
        })
      }
    }
  })
  
  return [...new Set(locales)] // Dédupliquer
}