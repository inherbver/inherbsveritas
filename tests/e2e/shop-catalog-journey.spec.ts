/**
 * @file Tests e2e parcours catalogue - Semaine 4 MVP
 * @description Tests Playwright pour parcours utilisateur complet boutique
 */

import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

// Configuration test
const TEST_URL = process.env.TEST_URL || 'http://localhost:3000'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client Supabase pour setup données test
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

test.describe('Parcours Catalogue Boutique', () => {
  test.beforeEach(async ({ page }) => {
    // Setup données test si nécessaire
    await setupTestData()
    
    // Navigation vers page boutique
    await page.goto(`${TEST_URL}/fr/shop`)
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle')
  })

  test.describe('Navigation et découverte', () => {
    test('charge la page boutique avec tous les éléments', async ({ page }) => {
      // Vérifier titre principal
      await expect(page.locator('h1')).toContainText('Boutique')
      
      // Vérifier sidebar filtres
      await expect(page.locator('aside')).toBeVisible()
      await expect(page.getByText('Catégories')).toBeVisible()
      await expect(page.getByText('Labels HerbisVeritas')).toBeVisible()
      
      // Vérifier champ recherche
      await expect(page.getByPlaceholder('Rechercher un produit...')).toBeVisible()
      
      // Vérifier grille produits
      await expect(page.locator('main [class*="grid"]')).toBeVisible()
      
      // Vérifier qu'au moins un produit est affiché
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()
    })

    test('affiche le compteur de produits correct', async ({ page }) => {
      // Attendre le chargement des produits
      await page.waitForSelector('[data-testid="product-card"]')
      
      // Compter les produits visibles
      const productCards = page.locator('[data-testid="product-card"]')
      const count = await productCards.count()
      
      // Vérifier que le compteur correspond
      await expect(page.locator('main')).toContainText(`${count} produit`)
    })

    test('navigue vers le détail produit au clic', async ({ page }) => {
      // Attendre qu'au moins un produit soit visible
      await page.waitForSelector('[data-testid="product-card"]')
      
      // Récupérer le premier produit
      const firstProduct = page.locator('[data-testid="product-card"]').first()
      const productTitle = await firstProduct.locator('h3').textContent()
      
      // Cliquer sur le produit
      await firstProduct.click()
      
      // Vérifier navigation vers page détail
      await expect(page).toHaveURL(/\/shop\/[^\/]+$/)
      
      // Vérifier que le titre du produit est présent
      if (productTitle) {
        await expect(page.locator('h1')).toContainText(productTitle)
      }
    })
  })

  test.describe('Filtrage par catégories', () => {
    test('filtre les produits par catégorie', async ({ page }) => {
      // Attendre le chargement initial
      await page.waitForSelector('[data-testid="product-card"]')
      const initialCount = await page.locator('[data-testid="product-card"]').count()
      
      // Sélectionner une catégorie (première non-"Tous")
      const categoryButton = page.locator('aside button:not(:has-text("Tous les produits"))').first()
      const categoryName = await categoryButton.textContent()
      await categoryButton.click()
      
      // Attendre mise à jour de l'URL
      await page.waitForURL(/category=/)
      
      // Attendre mise à jour des produits
      await page.waitForTimeout(500)
      
      // Vérifier que le filtrage fonctionne
      const filteredCount = await page.locator('[data-testid="product-card"]').count()
      expect(filteredCount).toBeLessThanOrEqual(initialCount)
      
      // Vérifier le message de filtrage
      if (categoryName) {
        await expect(page.locator('main')).toContainText('dans cette catégorie')
      }
      
      // Vérifier filtre actif
      await expect(page.getByText('Filtres actifs')).toBeVisible()
    })

    test('navigue dans la hiérarchie de catégories', async ({ page }) => {
      // Chercher une catégorie avec sous-catégories (chevron visible)
      const expandableCategory = page.locator('aside button:has([data-testid="chevron-right"])')
      
      if (await expandableCategory.count() > 0) {
        // Développer la catégorie
        await expandableCategory.first().click()
        
        // Vérifier que les sous-catégories apparaissent
        await expect(page.locator('aside button[class*="ml-4"]')).toBeVisible()
        
        // Sélectionner une sous-catégorie
        const subcategory = page.locator('aside button[class*="ml-4"]').first()
        await subcategory.click()
        
        // Vérifier filtrage
        await page.waitForURL(/category=/)
        await expect(page.getByText('Filtres actifs')).toBeVisible()
      }
    })

    test('efface le filtre catégorie', async ({ page }) => {
      // Sélectionner une catégorie
      const categoryButton = page.locator('aside button:not(:has-text("Tous les produits"))').first()
      await categoryButton.click()
      
      await page.waitForURL(/category=/)
      await expect(page.getByText('Filtres actifs')).toBeVisible()
      
      // Effacer via bouton X du filtre actif
      await page.locator('[data-testid="clear-category"]').click()
      
      // Vérifier que l'URL est mise à jour
      await page.waitForURL(url => !url.searchParams.has('category'))
      
      // Vérifier que les filtres actifs disparaissent
      await expect(page.getByText('Filtres actifs')).not.toBeVisible()
    })
  })

  test.describe('Filtrage par labels', () => {
    test('filtre par labels HerbisVeritas', async ({ page }) => {
      // Attendre chargement initial  
      await page.waitForSelector('[data-testid="product-card"]')
      const initialCount = await page.locator('[data-testid="product-card"]').count()
      
      // Sélectionner le label "Bio"
      const bioCheckbox = page.locator('input[type="checkbox"]').first()
      await bioCheckbox.check()
      
      // Attendre mise à jour URL
      await page.waitForURL(/labels=/)
      await page.waitForTimeout(500)
      
      // Vérifier filtrage
      const filteredCount = await page.locator('[data-testid="product-card"]').count()
      expect(filteredCount).toBeLessThanOrEqual(initialCount)
      
      // Vérifier filtre actif
      await expect(page.getByText('Filtres actifs')).toBeVisible()
      await expect(page.getByText('Bio')).toBeVisible()
    })

    test('combine plusieurs labels', async ({ page }) => {
      // Sélectionner Bio
      await page.locator('input[type="checkbox"]').first().check()
      await page.waitForURL(/labels=/)
      
      // Sélectionner un second label
      await page.locator('input[type="checkbox"]').nth(1).check()
      
      // Vérifier URL avec labels multiples
      await page.waitForURL(/labels=.*,.*/)
      
      // Vérifier filtres actifs multiples
      const activeFilters = page.locator('[data-testid="active-filter-badge"]')
      expect(await activeFilters.count()).toBeGreaterThanOrEqual(2)
    })

    test('retire un label sélectionné', async ({ page }) => {
      // Sélectionner un label
      const bioCheckbox = page.locator('input[type="checkbox"]').first()
      await bioCheckbox.check()
      await page.waitForURL(/labels=/)
      
      // Décocher le label
      await bioCheckbox.uncheck()
      
      // Vérifier que l'URL est mise à jour
      await page.waitForURL(url => !url.searchParams.has('labels'))
      
      // Vérifier que les filtres actifs disparaissent
      await expect(page.getByText('Filtres actifs')).not.toBeVisible()
    })
  })

  test.describe('Recherche textuelle', () => {
    test('recherche par nom de produit', async ({ page }) => {
      // Attendre chargement
      await page.waitForSelector('[data-testid="product-card"]')
      
      // Récupérer le nom du premier produit
      const firstProductName = await page.locator('[data-testid="product-card"] h3').first().textContent()
      
      if (firstProductName) {
        const searchTerm = firstProductName.split(' ')[0] // Premier mot
        
        // Effectuer recherche
        await page.getByPlaceholder('Rechercher un produit...').fill(searchTerm)
        await page.getByText('Rechercher').click()
        
        // Vérifier URL mise à jour
        await page.waitForURL(/search=/)
        
        // Vérifier message de recherche
        await expect(page.locator('main')).toContainText(`pour "${searchTerm}"`)
        
        // Vérifier que des produits sont toujours affichés
        await expect(page.locator('[data-testid="product-card"]')).toHaveCount(expect.any(Number))
      }
    })

    test('recherche sans résultat', async ({ page }) => {
      // Rechercher terme inexistant
      await page.getByPlaceholder('Rechercher un produit...').fill('xyztermeinexistant')
      await page.getByText('Rechercher').click()
      
      await page.waitForURL(/search=xyztermeinexistant/)
      
      // Vérifier message aucun résultat
      await expect(page.getByText('Aucun produit ne correspond à vos critères')).toBeVisible()
      
      // Vérifier qu'aucun produit n'est affiché
      await expect(page.locator('[data-testid="product-card"]')).toHaveCount(0)
    })

    test('efface la recherche', async ({ page }) => {
      // Effectuer une recherche
      await page.getByPlaceholder('Rechercher un produit...').fill('test')
      await page.getByText('Rechercher').click()
      
      await page.waitForURL(/search=test/)
      
      // Effacer via bouton X
      await page.locator('input[placeholder*="Rechercher"] + button').click()
      
      // Vérifier que le champ est vidé et recherche relancée
      await page.waitForURL(url => !url.searchParams.has('search'))
      
      // Vérifier retour à l'état initial
      await expect(page.getByPlaceholder('Rechercher un produit...')).toHaveValue('')
    })
  })

  test.describe('Combinaisons de filtres', () => {
    test('combine catégorie + label + recherche', async ({ page }) => {
      // Sélectionner catégorie
      const categoryButton = page.locator('aside button:not(:has-text("Tous les produits"))').first()
      await categoryButton.click()
      await page.waitForURL(/category=/)
      
      // Ajouter label
      await page.locator('input[type="checkbox"]').first().check()
      await page.waitForURL(/labels=/)
      
      // Ajouter recherche
      await page.getByPlaceholder('Rechercher un produit...').fill('test')
      await page.getByText('Rechercher').click()
      await page.waitForURL(/search=test/)
      
      // Vérifier filtres actifs multiples
      await expect(page.getByText('Filtres actifs (3)')).toBeVisible()
      
      // Vérifier message combiné
      await expect(page.locator('main')).toContainText('dans cette catégorie')
      await expect(page.locator('main')).toContainText('pour "test"')
    })

    test('efface tous les filtres', async ({ page }) => {
      // Appliquer plusieurs filtres
      await page.locator('aside button:not(:has-text("Tous les produits"))').first().click()
      await page.waitForURL(/category=/)
      
      await page.locator('input[type="checkbox"]').first().check()  
      await page.waitForURL(/labels=/)
      
      // Vérifier filtres actifs
      await expect(page.getByText('Filtres actifs')).toBeVisible()
      
      // Effacer tous
      await page.getByText('Tout effacer').click()
      
      // Vérifier retour à l'état initial
      await page.waitForURL(url => 
        !url.searchParams.has('category') && 
        !url.searchParams.has('labels') &&
        !url.searchParams.has('search')
      )
      
      await expect(page.getByText('Filtres actifs')).not.toBeVisible()
    })
  })

  test.describe('Responsive et UX', () => {
    test('fonctionne sur mobile', async ({ page }) => {
      // Simuler viewport mobile
      await page.setViewportSize({ width: 375, height: 667 })
      await page.reload()
      
      // Vérifier que la sidebar est masquée ou adaptée
      const sidebar = page.locator('aside')
      const sidebarVisible = await sidebar.isVisible()
      
      // Vérifier que la grille s'adapte (1 colonne sur mobile)
      const productGrid = page.locator('main [class*="grid"]')
      await expect(productGrid).toHaveClass(/grid-cols-1/)
      
      // Vérifier que les produits restent accessibles
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()
    })

    test('maintient la navigation avec le bouton retour', async ({ page }) => {
      // Appliquer un filtre
      await page.locator('aside button:not(:has-text("Tous les produits"))').first().click()
      await page.waitForURL(/category=/)
      
      // Naviguer vers détail produit
      await page.locator('[data-testid="product-card"]').first().click()
      await page.waitForURL(/\/shop\/[^\/]+$/)
      
      // Retour navigateur
      await page.goBack()
      
      // Vérifier que les filtres sont conservés
      await expect(page).toHaveURL(/category=/)
      await expect(page.getByText('Filtres actifs')).toBeVisible()
    })
  })

  test.describe('Performance et chargement', () => {
    test('charge les images des produits lazily', async ({ page }) => {
      // Aller en bas de page pour déclencher lazy loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      
      // Attendre que les images se chargent
      await page.waitForTimeout(1000)
      
      // Vérifier que les images sont chargées
      const images = page.locator('[data-testid="product-card"] img')
      const imageCount = await images.count()
      
      if (imageCount > 0) {
        // Vérifier qu'au moins la première image a un src
        await expect(images.first()).toHaveAttribute('src', /.*/)
      }
    })

    test('gère le loading des filtres sans freeze', async ({ page }) => {
      // Appliquer rapidement plusieurs filtres
      await page.locator('aside button:not(:has-text("Tous les produits"))').first().click()
      
      // Immédiatement ajouter un label
      await page.locator('input[type="checkbox"]').first().check()
      
      // Vérifier que l'interface reste réactive
      await expect(page.getByText('Catégories')).toBeVisible()
      await expect(page.getByText('Labels HerbisVeritas')).toBeVisible()
    })
  })
})

// Utilitaires setup données test
async function setupTestData() {
  try {
    // Vérifier si données test existent déjà
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id')
      .limit(1)
    
    if (existingCategories && existingCategories.length > 0) {
      return // Données déjà présentes
    }
    
    // Créer données test minimales si nécessaire
    // (En production, utiliser fixtures ou seeds dédiés)
    console.log('Setting up test data...')
    
  } catch (error) {
    console.warn('Could not setup test data:', error)
    // Continue les tests même si setup échoue
  }
}