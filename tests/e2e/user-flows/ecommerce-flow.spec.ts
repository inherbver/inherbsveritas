import { test, expect } from '@playwright/test'

test.describe('E-commerce User Flow', () => {
  test('should complete full shopping journey as guest', async ({ page }) => {
    // Navigate to products
    await page.goto('/')
    await page.getByRole('link', { name: /produits/i }).click()
    
    // Browse products
    await expect(page).toHaveURL('/products')
    await expect(page.getByTestId('product-grid')).toBeVisible()
    
    // Add product to cart
    const firstProduct = page.getByTestId('product-card').first()
    await firstProduct.getByRole('button', { name: /ajouter au panier/i }).click()
    
    // Verify toast notification
    await expect(page.getByText(/produit ajouté au panier/i)).toBeVisible()
    
    // Open cart
    await page.getByRole('button', { name: /panier/i }).click()
    await expect(page.getByTestId('cart-sheet')).toBeVisible()
    
    // Proceed to checkout
    await page.getByRole('button', { name: /commander/i }).click()
    await expect(page).toHaveURL('/checkout')
    
    // Fill shipping form
    await page.getByLabel(/prénom/i).fill('Jean')
    await page.getByLabel(/nom/i).fill('Dupont')
    await page.getByLabel(/adresse/i).fill('123 Rue Test')
    await page.getByLabel(/ville/i).fill('Paris')
    await page.getByLabel(/code postal/i).fill('75001')
    
    // Complete order (mock payment)
    await page.getByRole('button', { name: /finaliser la commande/i }).click()
    
    // Verify order confirmation
    await expect(page).toHaveURL(/\/orders\/[0-9a-f-]+/)
    await expect(page.getByText(/commande confirmée/i)).toBeVisible()
  })

  test('should handle cart operations correctly', async ({ page }) => {
    await page.goto('/products')
    
    // Add multiple products
    const products = page.getByTestId('product-card')
    await products.nth(0).getByRole('button', { name: /ajouter/i }).click()
    await products.nth(1).getByRole('button', { name: /ajouter/i }).click()
    
    // Open cart
    await page.getByRole('button', { name: /panier/i }).click()
    const cart = page.getByTestId('cart-sheet')
    
    // Verify cart items
    await expect(cart.getByTestId('cart-item')).toHaveCount(2)
    
    // Update quantity
    await cart.getByTestId('quantity-input').first().fill('2')
    await expect(cart.getByTestId('cart-total')).toContainText('€')
    
    // Remove item
    await cart.getByRole('button', { name: /supprimer/i }).first().click()
    await expect(cart.getByTestId('cart-item')).toHaveCount(1)
  })

  test('should filter and search products', async ({ page }) => {
    await page.goto('/products')
    
    // Use search
    await page.getByPlaceholder(/rechercher/i).fill('bio')
    await page.keyboard.press('Enter')
    
    // Verify search results
    await expect(page.getByTestId('product-card')).toHaveCountGreaterThan(0)
    await expect(page.locator('h1')).toContainText('Résultats pour "bio"')
    
    // Use category filter
    await page.getByRole('button', { name: /visage/i }).click()
    await expect(page).toHaveURL(/category=visage/)
    
    // Clear filters
    await page.getByRole('button', { name: /effacer filtres/i }).click()
    await expect(page).toHaveURL('/products')
  })
})