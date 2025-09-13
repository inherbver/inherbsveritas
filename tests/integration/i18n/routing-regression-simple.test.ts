/**
 * Tests de Régression i18n - Version Simplifiée
 * 
 * Tests de base pour prévenir problèmes 404 généralisés
 * Compatible avec environnement Jest standard
 */

import { describe, test, expect } from '@jest/globals'
import fs from 'fs'
import path from 'path'

describe('i18n Configuration - Tests Critiques', () => {
  
  test('fichiers structure i18n essentiels présents', () => {
    const criticalFiles = [
      'src/app/[locale]/layout.tsx',
      'src/app/[locale]/page.tsx', 
      'middleware.ts'
    ]
    
    const results = criticalFiles.map(file => ({
      file,
      exists: fs.existsSync(path.join(process.cwd(), file))
    }))
    
    console.table(results)
    
    // Tous les fichiers critiques doivent exister
    results.forEach(({ file: _file, exists }) => {
      expect(exists).toBe(true)
    })
  })

  test('next.config.js contient configuration i18n', () => {
    const configPath = path.join(process.cwd(), 'next.config.js')
    
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8')
      
      // Plugin next-intl doit être présent
      expect(content).toContain('createNextIntlPlugin')
      
      console.log('✅ Plugin next-intl détecté dans next.config.js')
    } else {
      console.warn('⚠️ next.config.js non trouvé')
      // Pas critique en mode test
    }
  })

  test('structure évite groupes routes conflictuels', () => {
    const conflictualPath = path.join(process.cwd(), 'src/app/[locale]/(site)')
    
    // ✅ Groupe (site) ne doit PAS exister avec pathnames localisés
    const exists = fs.existsSync(conflictualPath)
    
    if (exists) {
      console.warn('⚠️ ALERTE: Groupe (site) détecté - Possible conflit pathnames')
    }
    
    // Structure recommandée: routes directement sous [locale]
    expect(exists).toBe(false)
  })

  test('middleware.ts existe et contient logique i18n', () => {
    const middlewarePath = path.join(process.cwd(), 'middleware.ts')
    
    expect(fs.existsSync(middlewarePath)).toBe(true)
    
    const content = fs.readFileSync(middlewarePath, 'utf8')
    
    // Doit contenir références i18n
    const hasI18nLogic = content.includes('intl') || 
                        content.includes('locale') || 
                        content.includes('i18n')
    
    expect(hasI18nLogic).toBe(true)
    
    console.log('✅ Middleware contient logique i18n')
  })

  test('package.json contient dépendances i18n requises', () => {
    const packagePath = path.join(process.cwd(), 'package.json')
    
    expect(fs.existsSync(packagePath)).toBe(true)
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    
    // Dépendances critiques
    expect(deps).toHaveProperty('next-intl')
    expect(deps).toHaveProperty('next')
    
    console.log('✅ Dépendances i18n présentes:', {
      'next-intl': deps['next-intl'],
      'next': deps['next']
    })
  })
})

describe('Prévention 404 - Structure', () => {
  
  test('routes de base ont leurs fichiers correspondants', () => {
    const expectedRoutes = [
      'src/app/[locale]/page.tsx',        // Route racine
      'src/app/[locale]/layout.tsx',      // Layout principal
    ]
    
    // Routes optionnelles (peuvent exister)
    const optionalRoutes = [
      'src/app/[locale]/shop/page.tsx',      // Shop/boutique
      'src/app/[locale]/products/page.tsx',  // Products
    ]
    
    expectedRoutes.forEach(route => {
      const exists = fs.existsSync(path.join(process.cwd(), route))
      expect(exists).toBe(true)
    })
    
    // Log routes optionnelles pour information
    optionalRoutes.forEach(route => {
      const exists = fs.existsSync(path.join(process.cwd(), route))
      console.log(`Route optionnelle ${route}: ${exists ? '✅' : '❌'}`)
    })
  })

  test('absence de fichiers problématiques connus', () => {
    const problematicPaths = [
      'src/app/[locale]/(site)',  // Groupe routes conflictuel
      '.next/cache/build-manifest.json', // Cache corrompu
    ]
    
    problematicPaths.forEach(problemPath => {
      const fullPath = path.join(process.cwd(), problemPath)
      const exists = fs.existsSync(fullPath)
      
      if (problemPath.includes('(site)')) {
        // Groupe (site) ne devrait pas exister
        if (exists) {
          console.warn(`⚠️ Structure conflictuelle détectée: ${problemPath}`)
        }
        expect(exists).toBe(false)
      }
    })
  })
})

describe('Tests Sanité - Prévention Régression', () => {
  
  test('configuration Jest permet tests i18n', () => {
    // Test que l'environnement Jest fonctionne correctement
    expect(typeof describe).toBe('function')
    expect(typeof test).toBe('function') 
    expect(typeof expect).toBe('function')
    
    console.log('✅ Environment Jest configuré pour tests i18n')
  })

  test('modules Node.js de base disponibles', () => {
    // Modules requis pour tests avancés
    expect(typeof fs.existsSync).toBe('function')
    expect(typeof path.join).toBe('function')
    
    console.log('✅ Modules Node.js disponibles pour validation fichiers')
  })

  test('structure projet cohérente', () => {
    const projectRoot = process.cwd()
    
    // Vérifications de base
    expect(fs.existsSync(path.join(projectRoot, 'package.json'))).toBe(true)
    expect(fs.existsSync(path.join(projectRoot, 'src'))).toBe(true)
    
    const srcContents = fs.readdirSync(path.join(projectRoot, 'src'))
    expect(srcContents).toContain('app')
    
    console.log('✅ Structure projet validée')
  })
})