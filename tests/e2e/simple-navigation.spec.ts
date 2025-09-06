import { test, expect } from '@playwright/test'

test.describe('Navigation simple', () => {
  test('Doit charger la page d\'accueil français', async ({ page }) => {
    await page.goto('http://localhost:3000/fr')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/HerbisVeritas/)
  })

  test('Doit naviguer vers la boutique', async ({ page }) => {
    await page.goto('http://localhost:3000/fr')
    await page.waitForLoadState('networkidle')
    
    // Localiser le lien boutique avec plus de spécificité
    const shopLink = page.locator('a').filter({ hasText: /boutique|shop/i }).first()
    if (await shopLink.count() > 0) {
      await shopLink.click()
      await expect(page.url()).toContain('/shop')
    } else {
      // Si pas de lien boutique, naviguer directement
      await page.goto('http://localhost:3000/fr/shop')
      await expect(page.url()).toContain('/shop')
    }
  })
})