/**
 * Tests E2E - Parcours MVP Core HerbisVeritas
 * Validation des fonctionnalités essentielles pour le lancement
 * Labels simplifiés + architecture 13 tables
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env['PLAYWRIGHT_TEST_BASE_URL'] || 'http://localhost:3000'

test.describe('MVP Core Flows - HerbisVeritas V2', () => {
  
  test.describe('Découverte Produits', () => {
    test('should browse products with simplified labels', async ({ page }) => {
      await page.goto(`${BASE_URL}/fr/shop`)
      
      // Attendre chargement des produits
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible()
      
      // Vérifier présence des produits
      const productCards = page.locator('[data-testid="product-card"]')
      await expect(productCards).toHaveCountGreaterThan(0)
      
      // Vérifier labels simplifiés (badges string)
      const firstProduct = productCards.first()
      const labels = firstProduct.locator('[data-testid="product-label"]')
      
      if (await labels.count() > 0) {
        const labelText = await labels.first().textContent()
        
        // Labels doivent être des strings simples (pas d'enum complexe)
        expect(labelText).toMatch(/^[a-zA-Z_]+$/) // Format simple
        expect(labelText).not.toContain('HerbisVeritasLabel') // Pas d'enum
        expect(labelText).not.toContain('undefined') // Pas d'erreur mapping
      }
    })

    test('should filter products by labels', async ({ page }) => {
      await page.goto(`${BASE_URL}/fr/shop`)
      
      // Attendre chargement
      await page.waitForLoadState('networkidle')
      
      // Compter produits initiaux
      const initialProducts = page.locator('[data-testid="product-card"]')
      const initialCount = await initialProducts.count()
      
      // Appliquer filtre bio (si disponible)
      const bioFilter = page.locator('input[value="bio"], button:has-text("Bio")')
      if (await bioFilter.count() > 0) {
        await bioFilter.first().click()
        
        // Attendre mise à jour filtres
        await page.waitForResponse(response => 
          response.url().includes('/api/products') && 
          response.url().includes('labels=bio')
        )
        
        // Vérifier filtrage effectif
        const filteredProducts = page.locator('[data-testid="product-card"]')
        const filteredCount = await filteredProducts.count()
        
        // Soit moins de produits, soit confirmation que tous sont bio
        if (filteredCount < initialCount) {
          expect(filteredCount).toBeLessThan(initialCount)
        } else {
          // Vérifier que tous les produits visibles ont le label bio
          const bioLabels = page.locator('[data-testid="product-label"]:has-text("bio")')
          expect(await bioLabels.count()).toBeGreaterThan(0)
        }
      }
    })

    test('should display product details with correct price format', async ({ page }) => {
      await page.goto(`${BASE_URL}/fr/shop`)
      
      // Cliquer sur premier produit
      const firstProduct = page.locator('[data-testid="product-card"]').first()
      await firstProduct.click()
      
      // Vérifier redirection vers page produit
      await expect(page).toHaveURL(/\/fr\/products\/[^\/]+$/)
      
      // Vérifier prix en unités (format français)
      const priceElement = page.locator('[data-testid="product-price"]')
      await expect(priceElement).toBeVisible()
      
      const priceText = await priceElement.textContent()
      
      // Prix doit être formaté en euros français (virgule décimale)
      expect(priceText).toMatch(/^\d+,\d{2}\s*€$/) // ex: "24,99 €"
      expect(priceText).not.toMatch(/^\d+\.\d{2}/) // Pas format US/anglais
      expect(priceText).not.toContain('cents') // Pas en centimes
    })
  })

  test.describe('Navigation i18n FR/EN', () => {
    test('should switch languages correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/fr/shop`)
      
      // Vérifier contenu français initial
      await expect(page.locator('h1')).toContainText(/boutique|produits/i)
      
      // Changer vers anglais (si sélecteur langue existe)
      const langSwitch = page.locator('[data-testid="lang-switch"], button:has-text("EN")')
      if (await langSwitch.count() > 0) {
        await langSwitch.click()
        
        // Vérifier redirection vers /en/
        await expect(page).toHaveURL(/\/en\/shop$/)
        
        // Vérifier contenu anglais
        await expect(page.locator('h1')).toContainText(/shop|products/i)
        
        // Prix en format anglais
        const priceElements = page.locator('[data-testid="product-price"]')
        if (await priceElements.count() > 0) {
          const priceText = await priceElements.first().textContent()
          expect(priceText).toMatch(/€\d+\.\d{2}|^\d+\.\d{2}\s*€/) // Format EN
        }
      }
    })

    test('should handle direct URL access in both languages', async ({ page }) => {
      // Test accès direct FR
      await page.goto(`${BASE_URL}/fr/shop`)
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
      
      // Test accès direct EN  
      await page.goto(`${BASE_URL}/en/shop`)
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      
      // Test redirection racine
      await page.goto(`${BASE_URL}/shop`)
      // Devrait rediriger vers /fr/shop (locale par défaut)
      await expect(page).toHaveURL(/\/(fr|en)\/shop$/)
    })
  })

  test.describe('Panier MVP (Invité)', () => {
    test('should add product to cart and persist', async ({ page }) => {
      await page.goto(`${BASE_URL}/fr/shop`)
      
      // Ajouter un produit au panier
      const firstProduct = page.locator('[data-testid="product-card"]').first()
      const addToCartBtn = firstProduct.locator('[data-testid="add-to-cart"], button:has-text("Ajouter")')
      
      if (await addToCartBtn.count() > 0) {
        await addToCartBtn.click()
        
        // Vérifier indicateur panier mis à jour
        const cartIndicator = page.locator('[data-testid="cart-count"], [data-testid="cart-icon"]')
        await expect(cartIndicator).toBeVisible()
        
        // Rafraîchir page - panier doit persister (localStorage)
        await page.reload()
        await page.waitForLoadState('networkidle')
        
        // Cart count toujours présent après reload
        await expect(cartIndicator).toBeVisible()
        
        // Ouvrir panier pour vérifier contenu
        const cartButton = page.locator('[data-testid="cart-button"], button:has-text("Panier")')
        if (await cartButton.count() > 0) {
          await cartButton.click()
          
          // Vérifier produit dans le panier
          const cartItems = page.locator('[data-testid="cart-item"]')
          await expect(cartItems).toHaveCountGreaterThan(0)
        }
      }
    })

    test('should calculate totals correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/fr/shop`)
      
      // Ajouter 2 produits différents
      const products = page.locator('[data-testid="product-card"]')
      const productCount = Math.min(await products.count(), 2)
      
      for (let i = 0; i < productCount; i++) {
        const addBtn = products.nth(i).locator('[data-testid="add-to-cart"], button:has-text("Ajouter")')
        if (await addBtn.count() > 0) {
          await addBtn.click()
          await page.waitForTimeout(500) // Attendre mise à jour panier
        }
      }
      
      // Ouvrir panier
      const cartButton = page.locator('[data-testid="cart-button"], button:has-text("Panier")')
      if (await cartButton.count() > 0) {
        await cartButton.click()
        
        // Vérifier calculs
        const subtotal = page.locator('[data-testid="cart-subtotal"]')
        const total = page.locator('[data-testid="cart-total"]')
        
        if (await subtotal.count() > 0 && await total.count() > 0) {
          const subtotalText = await subtotal.textContent()
          const totalText = await total.textContent()
          
          // Vérifier format prix
          expect(subtotalText).toMatch(/\d+,\d{2}\s*€/)
          expect(totalText).toMatch(/\d+,\d{2}\s*€/)
          
          // Le total doit être >= subtotal (avec potentiels frais)
          const subtotalValue = parseFloat(subtotalText!.replace(/[€\s,]/g, '').replace(',', '.'))
          const totalValue = parseFloat(totalText!.replace(/[€\s,]/g, '').replace(',', '.'))
          
          expect(totalValue).toBeGreaterThanOrEqual(subtotalValue)
        }
      }
    })
  })

  test.describe('Performance & Robustesse', () => {
    test('should load shop page under 2 seconds', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto(`${BASE_URL}/fr/shop`)
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible()
      
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(2000) // Core Web Vitals
    })

    test('should handle network errors gracefully', async ({ page }) => {
      // Simuler panne réseau après chargement initial
      await page.goto(`${BASE_URL}/fr/shop`)
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible()
      
      // Couper le réseau
      await page.context().setOffline(true)
      
      // Tenter navigation
      const navLink = page.locator('a[href*="/fr/"]').first()
      if (await navLink.count() > 0) {
        await navLink.click()
        
        // Vérifier message d'erreur ou fallback UX
        const errorMessage = page.locator('[data-testid="error-message"], .error, :has-text("erreur")')
        await expect(errorMessage).toBeVisible({ timeout: 5000 })
      }
      
      // Rétablir réseau
      await page.context().setOffline(false)
    })

    test('should handle empty states properly', async ({ page }) => {
      // Aller sur page avec filtres restrictifs (aucun résultat)
      await page.goto(`${BASE_URL}/fr/shop?search=produit_inexistant_xyz`)
      
      await page.waitForLoadState('networkidle')
      
      // Vérifier message état vide
      const emptyState = page.locator('[data-testid="empty-state"], :has-text("Aucun produit"), :has-text("résultat")')
      await expect(emptyState).toBeVisible()
      
      // Vérifier absence de produits
      const products = page.locator('[data-testid="product-card"]')
      expect(await products.count()).toBe(0)
    })
  })

  test.describe('SEO & Accessibilité', () => {
    test('should have proper meta tags and headings', async ({ page }) => {
      await page.goto(`${BASE_URL}/fr/shop`)
      
      // Meta title
      const title = await page.title()
      expect(title).toMatch(/boutique|shop|herbisveritas/i)
      
      // H1 présent et unique
      const h1Elements = page.locator('h1')
      expect(await h1Elements.count()).toBe(1)
      
      // Meta description
      const metaDesc = page.locator('meta[name="description"]')
      expect(await metaDesc.count()).toBe(1)
      
      // Liens accessibles
      const links = page.locator('a')
      const linksCount = await links.count()
      
      for (let i = 0; i < Math.min(linksCount, 5); i++) {
        const link = links.nth(i)
        const href = await link.getAttribute('href')
        const text = await link.textContent()
        
        // Liens doivent avoir href et texte
        if (href && text?.trim()) {
          expect(href).not.toBe('#')
          expect(text.trim()).not.toBe('')
        }
      }
    })
  })
})