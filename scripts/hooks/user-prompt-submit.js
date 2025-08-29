/**
 * HerbisVeritas V2 - Hook UserPromptSubmit
 * 
 * Hook exécuté à chaque nouvelle demande utilisateur
 * Charge automatiquement CLAUDE.md et valide la conformité MVP
 * 
 * @version 1.0.0
 * @since 2025-01-28
 */

const fs = require('fs')
const path = require('path')

module.exports = {
  name: "HerbisVeritas MVP Validator",
  description: "Charge CLAUDE.md et valide la conformité MVP",
  
  async execute(context) {
    try {
      // Chemin vers CLAUDE.md
      const claudeConfigPath = path.join(process.cwd(), 'CLAUDE.md')
      
      if (fs.existsSync(claudeConfigPath)) {
        const claudeConfig = fs.readFileSync(claudeConfigPath, 'utf8')
        
        // Ajouter CLAUDE.md au contexte
        context.memory.add('claude_config', claudeConfig)
        
        // Extraire les règles critiques
        const criticalRules = extractCriticalRules(claudeConfig)
        
        // Valider la demande utilisateur contre les règles MVP
        const validation = validateUserPrompt(context.prompt, criticalRules)
        
        if (!validation.isValid) {
          return {
            shouldContinue: false,
            message: `⚠️ Demande non-conforme au MVP:\n${validation.violations.join('\n')}\n\n💡 Consultez CLAUDE.md pour les règles.`
          }
        }
        
        // Ajouter le contexte MVP au prompt
        context.addSystemMessage(`
📋 CONTEXT MVP HERBISVERITAS V2:
- Architecture: 13 tables strictement
- Labels: 7 HerbisVeritas uniquement  
- i18n: FR/EN seulement
- Rôles: user/admin/dev uniquement
- Objectif: Launch 12 semaines, budget €125k

🔍 VALIDATION REQUISE pour chaque action:
${criticalRules.map(rule => `- ${rule}`).join('\n')}
        `)
        
        console.log('✅ Hook UserPromptSubmit: CLAUDE.md chargé et validé')
        
      } else {
        console.log('⚠️ CLAUDE.md non trouvé - patterns par défaut utilisés')
      }
      
      return { shouldContinue: true }
      
    } catch (error) {
      console.error('❌ Erreur Hook UserPromptSubmit:', error)
      return { shouldContinue: true } // Continue en cas d'erreur
    }
  }
}

/**
 * Extrait les règles critiques de CLAUDE.md
 */
function extractCriticalRules(claudeConfig) {
  const rules = []
  
  // Recherche des patterns interdits
  const forbiddenMatches = claudeConfig.match(/❌.*?$/gm)
  if (forbiddenMatches) {
    rules.push(...forbiddenMatches)
  }
  
  // Recherche des validations requises  
  const validationMatches = claudeConfig.match(/✅.*?$/gm)
  if (validationMatches) {
    rules.push(...validationMatches)
  }
  
  return rules
}

/**
 * Valide le prompt utilisateur contre les règles MVP
 */
function validateUserPrompt(prompt, rules) {
  const violations = []
  const promptLower = prompt.toLowerCase()
  
  // Vérifications spécifiques MVP
  const nonMvpKeywords = [
    'nouvelle table', 'add table', 'create table',
    'allemand', 'espagnol', 'german', 'spanish', 'de', 'es',
    'complexe', 'avancé', 'enterprise', 'scaling',
    'analytics', 'monitoring', 'audit_logs'
  ]
  
  nonMvpKeywords.forEach(keyword => {
    if (promptLower.includes(keyword)) {
      violations.push(`🚫 Mot-clé non-MVP détecté: "${keyword}"`)
    }
  })
  
  // Validation réussie si aucune violation
  return {
    isValid: violations.length === 0,
    violations
  }
}