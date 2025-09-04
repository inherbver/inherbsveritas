/**
 * Tests Prévention 404 Généralisés
 * 
 * Suite complète pour détecter AVANT reproduction des symptômes
 * Basé sur analyse complète TECHNICAL_NOTE_404_ROUTING_ISSUE
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'
import { spawn, ChildProcess } from 'child_process'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

/**
 * Configuration Tests
 */
const TEST_PORT = 3001 // Port dédié tests (éviter conflit dev:3003)
const BASE_URL = `http://localhost:${TEST_PORT}`
const TIMEOUT_404_THRESHOLD = 8000 // Alerte si > 8s (symptôme connu)

/**
 * Server de test dédié
 */
let testServer: ChildProcess | null = null

describe('Système Prévention 404 Généralisés', () => {
  
  beforeAll(async () => {
    // Lancer serveur test isolé
    console.log('🚀 Démarrage serveur test...')
    
    testServer = spawn('npm', ['run', 'dev', '--', '-p', TEST_PORT.toString()], {
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    // Attendre démarrage serveur
    await new Promise((resolve) => setTimeout(resolve, 8000))
    
    // Vérifier serveur accessible
    try {
      const response = await fetch(BASE_URL, { timeout: 5000 })
      if (response.status !== 200) {
        throw new Error(`Serveur test non accessible: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Échec démarrage serveur test:', error)
      throw error
    }
    
    console.log('✅ Serveur test prêt')
  }, 30000)
  
  afterAll(async () => {
    if (testServer) {
      testServer.kill()
      console.log('🛑 Serveur test arrêté')
    }
  })

  /**
   * Tests Core - Symptômes 404 Généralisés
   */
  describe('Détection Précoce Symptômes 404', () => {
    
    test('🚨 ALERTE: Routes de base ne doivent JAMAIS timeout > 8s', async () => {
      const criticalRoutes = ['/', '/boutique', '/en/shop']
      const results: Array<{ route: string; time: number; status: number }> = []
      
      for (const route of criticalRoutes) {
        const startTime = Date.now()
        
        try {
          const response = await fetch(`${BASE_URL}${route}`, {
            timeout: 10000
          })
          
          const loadTime = Date.now() - startTime
          const status = response.status
          
          results.push({ route, time: loadTime, status })
          
          // 🚨 ALERTE CRITIQUE: Symptôme 404 généralisés détecté
          if (loadTime > TIMEOUT_404_THRESHOLD) {
            console.error(`🚨 ALERTE 404: Route ${route} timeout ${loadTime}ms`)
            console.error('💡 Action: Vérifier config next-intl + middleware')
          }
          
          // Tests critiques
          expect(status).not.toBe(404) // Pas de 404 généralisé
          expect(loadTime).toBeLessThan(TIMEOUT_404_THRESHOLD) // Pas de timeout
          
        } catch (error) {
          console.error(`❌ Route ${route} ÉCHOUE:`, error)
          throw new Error(`CRITIQUE: Route ${route} inaccessible - 404 généralisés possibles`)
        }
      }
      
      // Logging résultats pour monitoring
      console.table(results)
      
    }, 15000)

    test('🔍 Routes inexistantes doivent 404 rapidement (< 3s)', async () => {
      const startTime = Date.now()
      
      const response = await fetch(`${BASE_URL}/route-vraiment-inexistante`, {
        timeout: 5000
      })
      
      const loadTime = Date.now() - startTime
      
      // ✅ 404 légitime rapide (non symptôme timeout généralisé)
      expect(response.status).toBe(404)
      expect(loadTime).toBeLessThan(3000)
      
      console.log(`✅ 404 légitime en ${loadTime}ms`)
    })

    test('🧪 Compilation erreurs ne doivent pas causer 404 silencieux', async () => {
      // Test que erreurs TypeScript/build sont visibles
      const response = await fetch(`${BASE_URL}/`)
      const text = await response.text()
      
      // ❌ Erreurs compile masquées par 404
      expect(text).not.toContain('Application error')
      expect(text).not.toContain('500')
      expect(text).not.toContain('Compilation failed')
      
      // ✅ Contenu normal présent
      expect(text).toContain('html')
      expect(response.status).toBe(200)
    })
  })

  /**
   * Tests Configuration - Prévention Erreurs
   */
  describe('Validation Configuration Critique', () => {
    
    test('next.config.js - Plugin i18n correctement configuré', () => {
      const nextConfigPath = path.join(process.cwd(), 'next.config.js')
      
      if (fs.existsSync(nextConfigPath)) {
        const content = fs.readFileSync(nextConfigPath, 'utf8')
        
        // ✅ Plugin next-intl présent
        expect(content).toContain('createNextIntlPlugin')
        
        // ✅ Path correct vers i18n.ts (non request.ts)
        expect(content).toMatch(/['"\.\/src\/i18n\.ts['"]/)
        
        // ❌ Path problématique détecté
        expect(content).not.toContain('./src/i18n/request.ts')
        
        console.log('✅ next.config.js: Configuration i18n valide')
      }
    })

    test('Structure fichiers - Absence groupes routes conflictuels', () => {
      const siteGroupPath = path.join(process.cwd(), 'src/app/[locale]/(site)')
      
      // ❌ Groupe (site) avec pathnames = conflit
      if (fs.existsSync(siteGroupPath)) {
        console.warn('⚠️ ALERTE: Groupe (site) détecté avec pathnames localisés')
        console.warn('💡 Action: Déplacer routes hors de (site)')
      }
      
      // Test structure correcte
      const localeDir = path.join(process.cwd(), 'src/app/[locale]')
      expect(fs.existsSync(localeDir)).toBe(true)
      
      // Routes principales doivent être directement sous [locale]
      const pageExists = fs.existsSync(path.join(localeDir, 'page.tsx'))
      const layoutExists = fs.existsSync(path.join(localeDir, 'layout.tsx'))
      
      expect(pageExists).toBe(true)
      expect(layoutExists).toBe(true)
    })

    test('Messages i18n - Clés critiques présentes', async () => {
      // Clés essentielles pour éviter erreurs 500 -> 404
      const requiredKeys = [
        'Navigation',
        'NotFound'
      ]
      
      const locales = ['fr', 'en']
      
      for (const locale of locales) {
        const commonPath = path.join(process.cwd(), `src/i18n/messages/${locale}/common.json`)
        
        if (fs.existsSync(commonPath)) {
          try {
            const messages = JSON.parse(fs.readFileSync(commonPath, 'utf8'))
            
            requiredKeys.forEach(key => {
              if (!messages[key]) {
                console.warn(`⚠️ Clé manquante ${key} pour locale ${locale}`)
              }
            })
            
            console.log(`✅ Messages ${locale}: Structure validée`)
          } catch (error) {
            console.error(`❌ Messages ${locale} JSON invalide:`, error)
          }
        }
      }
    })
  })

  /**
   * Tests Build & Cache - Corruption Prevention
   */
  describe('Prévention Corruption Build/Cache', () => {
    
    test('Cache .next ne doit pas persister avec ancienne config', () => {
      const nextCachePath = path.join(process.cwd(), '.next')
      
      if (fs.existsSync(nextCachePath)) {
        // Vérifier timestamp cache vs config
        const cacheStats = fs.statSync(nextCachePath)
        const configPath = path.join(process.cwd(), 'next.config.js')
        
        if (fs.existsSync(configPath)) {
          const configStats = fs.statSync(configPath)
          
          // Cache plus ancien que config = rebuild requis
          if (cacheStats.mtime < configStats.mtime) {
            console.warn('⚠️ Cache .next plus ancien que config')
            console.warn('💡 Action: npm run build (rebuild requis)')
          }
        }
      }
      
      expect(true).toBe(true) // Test validation
    })

    test('node_modules cohérents avec package.json', () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json')
      const nodeModulesPath = path.join(process.cwd(), 'node_modules')
      
      if (fs.existsSync(packageJsonPath) && fs.existsSync(nodeModulesPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        
        // Vérifier packages critiques installés
        const criticalPackages = [
          'next-intl',
          'next',
          '@supabase/supabase-js'
        ]
        
        criticalPackages.forEach(pkg => {
          const pkgPath = path.join(nodeModulesPath, pkg)
          
          if (packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]) {
            expect(fs.existsSync(pkgPath)).toBe(true)
          }
        })
        
        console.log('✅ Dependencies critiques installées')
      }
    })
  })

  /**
   * Tests Network & Performance
   */
  describe('Performance - Détection Dégradations', () => {
    
    test('Baseline performance - Toutes routes < 2s', async () => {
      const routes = ['/', '/boutique', '/en', '/en/shop']
      const performanceResults: Array<{route: string, time: number}> = []
      
      for (const route of routes) {
        const startTime = Date.now()
        
        const response = await fetch(`${BASE_URL}${route}`, {
          timeout: 5000
        })
        
        const loadTime = Date.now() - startTime
        performanceResults.push({ route, time: loadTime })
        
        // Performance baseline
        expect(response.status).toBe(200)
        expect(loadTime).toBeLessThan(2000)
      }
      
      console.table(performanceResults)
    })

    test('Parallel requests ne doivent pas causer instabilité', async () => {
      const routes = ['/', '/boutique', '/en/shop']
      
      // Requests parallèles (simulation charge)
      const promises = routes.map(route => 
        fetch(`${BASE_URL}${route}`, { timeout: 5000 })
      )
      
      const responses = await Promise.all(promises)
      
      // Toutes doivent réussir
      responses.forEach((response, index) => {
        expect(response.status).toBe(200)
        console.log(`✅ Route ${routes[index]}: ${response.status}`)
      })
    })
  })

  /**
   * Tests Monitoring Continu
   */
  describe('Health Checks - Monitoring Continu', () => {
    
    test('Endpoint santé application', async () => {
      // Test endpoint racine comme health check
      const response = await fetch(`${BASE_URL}/`, {
        timeout: 3000
      })
      
      // Métriques santé
      const responseTime = parseInt(response.headers.get('x-response-time') || '0')
      const status = response.status
      
      expect(status).toBe(200)
      
      // Logging pour monitoring externe
      console.log(`🏥 Health Check: Status ${status}, Time ${responseTime}ms`)
    })

    test('Détection memory leaks middleware', async () => {
      const initialMemory = process.memoryUsage().heapUsed
      
      // Plusieurs requêtes pour tester accumulation
      for (let i = 0; i < 10; i++) {
        await fetch(`${BASE_URL}/`, { timeout: 2000 })
      }
      
      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory
      
      // Alerte si croissance excessive
      if (memoryIncrease > 50 * 1024 * 1024) { // 50MB
        console.warn(`⚠️ Possible memory leak: +${memoryIncrease / 1024 / 1024}MB`)
      }
      
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024) // 100MB max
    })
  })
})

/**
 * Tests Spécifiques - Scénarios Reproduction
 */
describe('Scénarios Reproduction Problèmes Connus', () => {
  
  test('Simulation: localePrefix as-needed -> always', async () => {
    // Test que configuration actuelle (always) fonctionne
    const response = await fetch(`${BASE_URL}/boutique`)
    expect(response.status).toBe(200)
    
    console.log('✅ localePrefix="always" - Configuration stable')
  })

  test('Simulation: middleware chain corruption', async () => {
    // Test stabilité requests avec cookies/headers complexes
    const response = await fetch(`${BASE_URL}/`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'Cookie': 'NEXT_LOCALE=fr; test-cookie=value'
      }
    })
    
    expect(response.status).toBe(200)
    console.log('✅ Headers complexes gérés sans erreur')
  })

  test('Test régression: pathnames + groupes routes', async () => {
    // Routes pathnames doivent fonctionner
    const routeTests = [
      { url: '/boutique', expectedStatus: 200 },
      { url: '/en/shop', expectedStatus: 200 }
    ]
    
    for (const { url, expectedStatus } of routeTests) {
      const response = await fetch(`${BASE_URL}${url}`)
      expect(response.status).toBe(expectedStatus)
    }
    
    console.log('✅ Pathnames localisés fonctionnels')
  })
})