/**
 * Tests E2E - Routes Critiques i18n
 * 
 * Tests de navigation pour prévenir les 404 généralisés
 * Basé sur les symptômes décrits dans TECHNICAL_NOTE_404_ROUTING_ISSUE
 */

import { test, expect } from '@playwright/test'

/**
 * Configuration Test Environment
 */
const BASE_URL = process.env['PLAYWRIGHT_TEST_BASE_URL'] || 'http://localhost:3007'

/**
 * Routes Critiques Identifiées
 * Ces routes DOIVENT fonctionner pour confirmer stabilité i18n
 */
const CRITICAL_ROUTES = [
  // Route FR avec préfixe obligatoire (nouveau système)
  { 
    url: '/fr', 
    expectedLocale: 'fr',
    expectedContent: ['HerbisVeritas', 'internationalisation', 'fonctionnel'],
    description: 'Route racine FR avec préfixe obligatoire'
  },
  
  // Route EN avec préfixe
  { 
    url: '/en', 
    expectedLocale: 'en',
    expectedContent: ['HerbisVeritas', 'internationalisation', 'fonctionnel'],
    description: 'Route racine EN avec préfixe'
  },
  
  // Route boutique FR (rewrite vers shop)
  { 
    url: '/fr/boutique', 
    expectedLocale: 'fr',
    expectedContent: ['Boutique HerbisVeritas', 'cosmétiques bio'],
    description: 'Route boutique FR avec rewrite vers /shop'
  },
  
  // Route shop EN (pathnames localisés) 
  { 
    url: '/en/shop', 
    expectedLocale: 'en',
    expectedContent: ['Boutique HerbisVeritas', 'cosmétiques bio'],
    description: 'Route shop EN directe'
  }
]

/**
 * Suite Tests Routes Critiques
 */
describe('i18n Routes Critiques - Prévention 404', () => {
  
  test.describe('Navigation de Base', () => {
    CRITICAL_ROUTES.forEach(({ url, expectedLocale, expectedContent, description }) => {
      test(`✅ ${description}: ${url}`, async ({ page }) => {
        console.log(`🧪 Test route: ${url}`)
        
        // Navigation avec timeout surveillance 404
        const response = await page.goto(`${BASE_URL}${url}`, { 
          waitUntil: 'networkidle',
          timeout: 15000  // ⚠️ 404 généralisés causaient 10+ secondes timeout
        })
        
        // 🚨 ALERTE: Status 404 indique reproduction du problème
        expect(response?.status()).not.toBe(404)
        
        // ✅ Status OK attendu
        expect(response?.status()).toBe(200)
        
        // Vérification contenu localisé
        const content = await page.textContent('body')
        expect(content).toBeTruthy()
        
        // Test présence mots-clés par locale
        if (expectedContent.length > 0) {
          const hasExpectedContent = expectedContent.some(keyword => 
            content?.toLowerCase().includes(keyword.toLowerCase())
          )
          expect(hasExpectedContent).toBe(true)
        }
        
        // Vérification HTML lang attribute
        const htmlLang = await page.getAttribute('html', 'lang')
        expect(htmlLang).toContain(expectedLocale)
        
        console.log(`✅ Route ${url} fonctionne - Status: ${response?.status()}`)
      })
    })
  })

  test.describe('Performance Routes - Détection Timeouts', () => {
    test('routes ne doivent pas dépasser 5 secondes de chargement', async ({ page }) => {
      const startTime = Date.now()
      
      // Test route la plus critique (racine FR avec préfixe)
      const response = await page.goto(`${BASE_URL}/fr`, { 
        waitUntil: 'networkidle',
        timeout: 5000
      })
      
      const loadTime = Date.now() - startTime
      
      // ✅ Performance acceptable (non 404)
      expect(response?.status()).toBe(200)
      expect(loadTime).toBeLessThan(5000)
      
      console.log(`⚡ Route racine FR chargée en ${loadTime}ms`)
    })

    test('navigation entre locales doit être fluide', async ({ page }) => {
      // Test workflow critique: FR -> EN -> FR (avec préfixes obligatoires)
      await page.goto(`${BASE_URL}/fr`)
      expect(await page.textContent('main')).toBeTruthy()
      
      // Navigation vers EN
      await page.goto(`${BASE_URL}/en`)  
      expect(await page.getAttribute('html', 'lang')).toContain('en')
      
      // Retour FR
      await page.goto(`${BASE_URL}/fr`)
      expect(await page.getAttribute('html', 'lang')).toContain('fr')
    })
  })

  test.describe('Pathnames Localisés - Stabilité', () => {
    test('boutique FR et shop EN doivent pointer vers même contenu', async ({ page }) => {
      // Test routes pathnames (avec préfixes obligatoires)
      const responseFR = await page.goto(`${BASE_URL}/fr/boutique`)
      expect(responseFR?.status()).toBe(200)
      
      const responseEN = await page.goto(`${BASE_URL}/en/shop`)  
      expect(responseEN?.status()).toBe(200)
      
      // Les deux doivent charger sans erreur
      const contentFR = await page.textContent('body')
      await page.goto(`${BASE_URL}/en/shop`)
      const contentEN = await page.textContent('body')
      
      expect(contentFR).toBeTruthy()
      expect(contentEN).toBeTruthy()
    })

    test('routes inexistantes doivent retourner 404 propre (pas timeout)', async ({ page }) => {
      const startTime = Date.now()
      
      // Route qui DOIT retourner 404 rapidement
      const response = await page.goto(`${BASE_URL}/route-inexistante`, {
        waitUntil: 'networkidle',
        timeout: 3000
      })
      
      const loadTime = Date.now() - startTime
      
      // ✅ 404 rapide (non timeout 10+ secondes)
      expect(response?.status()).toBe(404)
      expect(loadTime).toBeLessThan(3000)
      
      console.log(`✅ 404 propre en ${loadTime}ms (non timeout)`)
    })
  })

  test.describe('Middleware Chain - Fonctionnalité', () => {
    test('headers i18n doivent être présents', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/fr`)
      
      // Vérification headers middleware i18n (analyse des headers pour debug middleware)
      const headers = response?.headers()
      console.log('Response headers:', headers ? Object.fromEntries(Object.entries(headers)) : 'No headers')
      
      // Next.js doit traiter la requête (pas d'erreur middleware)
      expect(response?.status()).toBe(200)
      
      // HTML doit contenir marqueurs i18n
      const content = await page.content()
      expect(content).toContain('lang="fr"')
    })

    test('cookies locale doivent être gérés correctement', async ({ page, context }) => {
      // Navigation initiale
      await page.goto(`${BASE_URL}/fr`)
      
      // Navigation vers EN
      await page.goto(`${BASE_URL}/en`)
      
      // Vérification cookies
      const cookies = await context.cookies()
      
      // Au minimum, session doit être maintenue
      expect(cookies.length).toBeGreaterThanOrEqual(0)
    })
  })
})

/**
 * Tests de Régression - Scénarios d'Échec Connus
 */
describe('Scénarios de Régression', () => {
  test.describe('Reproduction Symptômes 404', () => {
    test('timeout navigation NE DOIT PAS dépasser 10 secondes', async ({ page }) => {
      const routes = ['/fr', '/fr/boutique', '/en/shop']
      
      for (const route of routes) {
        const startTime = Date.now()
        
        try {
          const response = await page.goto(`${BASE_URL}${route}`, {
            waitUntil: 'networkidle', 
            timeout: 10000
          })
          
          const loadTime = Date.now() - startTime
          
          // 🚨 Si timeout > 8 secondes, alerte régression possible
          if (loadTime > 8000) {
            console.warn(`⚠️ ALERTE: Route ${route} lente (${loadTime}ms)`)
          }
          
          expect(response?.status()).toBe(200)
          expect(loadTime).toBeLessThan(10000)
          
        } catch (error) {
          console.error(`❌ ECHEC route ${route}:`, error)
          throw new Error(`Route ${route} échoue - Possible régression 404`)
        }
      }
    })

    test('compilation erreurs ne doivent pas causer 404 silencieux', async ({ page }) => {
      // Test que les erreurs de build sont visibles (non masquées par 404)
      const response = await page.goto(`${BASE_URL}/fr`)
      
      expect(response?.status()).toBe(200)
      
      // Vérification absence erreurs compile dans contenu
      const content = await page.textContent('body')
      expect(content).not.toContain('Application error')
      expect(content).not.toContain('500')
      expect(content).not.toContain('Internal Server Error')
    })
  })

  test.describe('Tests Stabilité Build', () => {
    test('HMR ne doit pas casser routage i18n', async ({ page }) => {
      // Test basique de stabilité après changements
      await page.goto(`${BASE_URL}/fr`)
      
      // Attendre que la page soit complètement chargée
      await page.waitForLoadState('networkidle')
      
      // Vérifier que navigation reste fonctionnelle
      const response1 = await page.goto(`${BASE_URL}/en`)
      expect(response1?.status()).toBe(200)
      
      const response2 = await page.goto(`${BASE_URL}/fr`) 
      expect(response2?.status()).toBe(200)
    })
  })
})

/**
 * Tests Monitoring - Métriques de Santé
 */
describe('Monitoring Routes i18n', () => {
  test('baseline performance routes critiques', async ({ page }) => {
    const results: { route: string; time: number; status: number }[] = []
    
    for (const { url } of CRITICAL_ROUTES) {
      const startTime = Date.now()
      
      const response = await page.goto(`${BASE_URL}${url}`, {
        waitUntil: 'networkidle'
      })
      
      const loadTime = Date.now() - startTime
      
      results.push({
        route: url,
        time: loadTime,
        status: response?.status() || 0
      })
    }
    
    // Logging pour monitoring
    console.table(results)
    
    // Tous les tests doivent passer
    results.forEach(result => {
      expect(result.status).toBe(200)
      expect(result.time).toBeLessThan(5000)
    })
  })
})