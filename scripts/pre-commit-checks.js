#!/usr/bin/env node

/**
 * @file Script validation pré-commit - Conformité CLAUDE.md
 * @description Vérifications automatiques avant chaque commit
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Couleurs pour affichage console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',  
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset)
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function warning(message) {
  log(`⚠️ ${message}`, 'yellow')
}

function info(message) {
  log(`ℹ️ ${message}`, 'blue')
}

// Vérification 1: Tailles de fichiers selon CLAUDE.md
function checkFileSizes() {
  info('Vérification des tailles de fichiers...')
  
  const limits = {
    components: { path: 'src/components/**/*.tsx', limit: 150 },
    features: { path: 'src/features/**/*.tsx', limit: 200 },
    services: { path: 'src/lib/**/*.ts', limit: 300 },
    pages: { path: 'src/app/**/page.tsx', limit: 100 }
  }
  
  let violations = []
  
  for (const [type, config] of Object.entries(limits)) {
    try {
      const files = execSync(`find src -name "*.tsx" -o -name "*.ts" | grep -E "(${config.path.replace('**/', '').replace('*', '')})"`, 
        { encoding: 'utf8' }).trim().split('\n').filter(f => f)
      
      for (const file of files) {
        if (fs.existsSync(file)) {
          const lines = fs.readFileSync(file, 'utf8').split('\n').length
          if (lines > config.limit) {
            violations.push(`${file}: ${lines} lignes (limite: ${config.limit})`)
          }
        }
      }
    } catch (e) {
      // Ignore grep errors si aucun fichier trouvé
    }
  }
  
  if (violations.length > 0) {
    error('Violations des limites de taille de fichiers:')
    violations.forEach(v => console.log(`  ${v}`))
    return false
  }
  
  success('Tailles de fichiers conformes')
  return true
}

// Vérification 2: Conventions de nommage kebab-case
function checkNamingConventions() {
  info('Vérification des conventions de nommage...')
  
  try {
    const files = execSync('find src -name "*.tsx" -o -name "*.ts" | grep -v node_modules', 
      { encoding: 'utf8' }).trim().split('\n').filter(f => f)
    
    const violations = files.filter(file => {
      const basename = path.basename(file)
      const nameWithoutExt = basename.replace(/\.(tsx?|jsx?)$/, '')
      
      // Ignore certains cas spéciaux
      if (basename.includes('.config.') || basename.includes('.test.') || basename.includes('.spec.')) {
        return false
      }
      
      // Vérifie kebab-case : doit contenir uniquement lettres minuscules, chiffres et tirets
      return !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(nameWithoutExt)
    })
    
    if (violations.length > 0) {
      error('Fichiers non conformes kebab-case:')
      violations.forEach(v => console.log(`  ${v}`))
      return false
    }
    
    success('Conventions de nommage respectées')
    return true
  } catch (e) {
    warning('Impossible de vérifier les conventions de nommage')
    return true // Ne pas bloquer sur cette erreur
  }
}

// Vérification 3: TypeScript
function checkTypeScript() {
  info('Vérification TypeScript...')
  
  try {
    execSync('npm run typecheck', { encoding: 'utf8', stdio: 'pipe' })
    success('Types TypeScript valides')
    return true
  } catch (e) {
    error('Erreurs TypeScript détectées')
    console.log(e.stdout || e.message)
    return false
  }
}

// Vérification 4: ESLint
function checkLinting() {
  info('Vérification ESLint...')
  
  try {
    execSync('npm run lint', { encoding: 'utf8', stdio: 'pipe' })
    success('Code conforme ESLint')
    return true
  } catch (e) {
    error('Erreurs ESLint détectées')
    console.log(e.stdout || e.message)
    return false
  }
}

// Vérification 5: Tests (optionnelle en mode rapide)
function checkTests(skipTests = false) {
  if (skipTests) {
    warning('Tests ignorés (mode rapide)')
    return true
  }
  
  info('Exécution des tests...')
  
  try {
    execSync('npm run test:unit', { encoding: 'utf8', stdio: 'pipe' })
    success('Tests unitaires réussis')
    return true
  } catch (e) {
    error('Tests unitaires échoués')
    console.log(e.stdout || e.message)
    return false
  }
}

// Fonction principale
function main() {
  log('🔍 Validation pré-commit - Conformité CLAUDE.md\n', 'blue')
  
  const skipTests = process.argv.includes('--skip-tests')
  
  const checks = [
    checkFileSizes,
    checkNamingConventions,
    checkTypeScript,
    checkLinting,
    () => checkTests(skipTests)
  ]
  
  let allPassed = true
  
  for (const check of checks) {
    if (!check()) {
      allPassed = false
      break // Arrêt à la première erreur critique
    }
    console.log('') // Espacement
  }
  
  if (allPassed) {
    success('✨ Toutes les vérifications sont passées - Commit autorisé')
    process.exit(0)
  } else {
    error('💥 Validation échouée - Commit bloqué')
    log('\nConsultez CLAUDE.md pour les règles de conformité', 'yellow')
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { checkFileSizes, checkNamingConventions, checkTypeScript, checkLinting, checkTests }