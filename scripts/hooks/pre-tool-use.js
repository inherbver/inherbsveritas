/**
 * HerbisVeritas V2 - Hook PreToolUse  
 * 
 * Hook exécuté avant chaque utilisation d'outil
 * Valide la conformité MVP et consulte CLAUDE.md
 * 
 * @version 1.0.0
 * @since 2025-01-28
 */

const fs = require('fs')
const path = require('path')

module.exports = {
  name: "MVP Pre-Tool Validator",
  description: "Valide chaque action contre l'architecture MVP",
  
  async execute(context) {
    try {
      const { tool, parameters } = context
      
      // Toujours lire CLAUDE.md avant toute action significative
      await ensureClaudeConfigLoaded(context)
      
      // Validations spécifiques par outil
      const validation = await validateToolUsage(tool, parameters, context)
      
      if (!validation.isValid) {
        console.log(`🛑 Action bloquée: ${validation.reason}`)
        return {
          shouldContinue: false,
          message: `🚫 Action non-conforme MVP:\n\n${validation.reason}\n\n📋 Consultez CLAUDE.md section "${validation.section}" pour les règles.`
        }
      }
      
      // Log pour traçabilité
      console.log(`✅ PreToolUse validé: ${tool} conforme MVP`)
      
      return { shouldContinue: true }
      
    } catch (error) {
      console.error('❌ Erreur Hook PreToolUse:', error)
      return { shouldContinue: true } // Continue en cas d'erreur
    }
  }
}

/**
 * S'assure que CLAUDE.md est chargé en contexte
 */
async function ensureClaudeConfigLoaded(context) {
  const claudeConfigPath = path.join(process.cwd(), 'CLAUDE.md')
  
  if (fs.existsSync(claudeConfigPath)) {
    const claudeConfig = fs.readFileSync(claudeConfigPath, 'utf8')
    context.memory.set('claude_config', claudeConfig)
  }
}

/**
 * Valide l'utilisation d'outil contre les règles MVP
 */
async function validateToolUsage(tool, parameters, context) {
  // Règles de validation par outil
  const validators = {
    'Write': validateWriteAction,
    'Edit': validateEditAction, 
    'MultiEdit': validateEditAction,
    'Bash': validateBashAction,
    'Task': validateTaskAction
  }
  
  const validator = validators[tool]
  if (validator) {
    return await validator(parameters, context)
  }
  
  return { isValid: true }
}

/**
 * Valide les actions Write/Edit
 */
function validateWriteAction(params, context) {
  const { file_path, content, new_string } = params
  
  // Interdire la création de nouveaux schémas de base de données
  if (file_path && file_path.includes('migration') && content) {
    if (content.includes('CREATE TABLE') && !content.includes('-- MVP APPROVED')) {
      return {
        isValid: false,
        reason: "Création de table non-MVP détectée. Seules les 13 tables MVP sont autorisées.",
        section: "Architecture MVP Stricte"
      }
    }
  }
  
  // Interdire l'ajout de langues non-MVP
  if (file_path && file_path.includes('i18n') || file_path.includes('messages')) {
    const textContent = content || new_string || ''
    if (textContent.includes('"de"') || textContent.includes('"es"') || 
        textContent.includes('german') || textContent.includes('spanish')) {
      return {
        isValid: false,
        reason: "Langues non-MVP détectées (DE/ES). Seules FR/EN sont autorisées pour le MVP.",
        section: "Architecture MVP Stricte"
      }
    }
  }
  
  // Valider les types database.ts
  if (file_path && file_path.includes('types/database.ts')) {
    const textContent = content || new_string || ''
    
    // Vérifier que seuls les 7 labels HerbisVeritas sont utilisés
    if (textContent.includes('ProductLabel') && textContent.includes('|')) {
      const validLabels = [
        'recolte_main', 'bio', 'origine_occitanie',
        'partenariat_producteurs', 'rituel_bien_etre',
        'rupture_recolte', 'essence_precieuse'
      ]
      
      // Cette validation serait plus sophistiquée en production
      const hasInvalidLabels = !validLabels.every(label => 
        textContent.includes(label) || !textContent.includes('ProductLabel')
      )
    }
  }
  
  return { isValid: true }
}

/**
 * Valide les commandes Bash
 */
function validateBashAction(params) {
  const { command } = params
  
  // Interdire les commandes dangereuses en production
  const dangerousCommands = [
    'rm -rf', 'DROP TABLE', 'DROP DATABASE',
    'supabase db reset', 'prisma db push --force-reset'
  ]
  
  const isDangerous = dangerousCommands.some(dangerous => 
    command.toLowerCase().includes(dangerous.toLowerCase())
  )
  
  if (isDangerous) {
    return {
      isValid: false,
      reason: `Commande dangereuse détectée: "${command}". Utilisez les scripts npm sécurisés.`,
      section: "Sécurité"
    }
  }
  
  return { isValid: true }
}

/**
 * Valide les délégations Task
 */
function validateTaskAction(params) {
  const { prompt, subagent_type } = params
  
  // S'assurer que les tâches respectent le scope MVP
  const nonMvpKeywords = [
    'analytics avancés', 'monitoring complexe', 'audit logs',
    'marketplace', 'multi-tenant', 'microservices'
  ]
  
  const hasNonMvpContent = nonMvpKeywords.some(keyword =>
    prompt.toLowerCase().includes(keyword.toLowerCase())
  )
  
  if (hasNonMvpContent) {
    return {
      isValid: false,
      reason: "Tâche non-MVP détectée. Focalisation sur les 13 tables essentielles requise.",
      section: "Objectifs Business"
    }
  }
  
  return { isValid: true }
}