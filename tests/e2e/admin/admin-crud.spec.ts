import { test, expect } from '@playwright/test'

test.describe('Admin CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@herbisveritas.fr')
    await page.getByLabel(/mot de passe/i).fill('AdminPass123!')
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    await expect(page).toHaveURL('/admin')
  })

  test('should create new product', async ({ page }) => {
    // Navigate to products admin
    await page.getByRole('link', { name: /produits/i }).click()
    await expect(page).toHaveURL('/admin/products')
    
    // Create new product
    await page.getByRole('button', { name: /nouveau produit/i }).click()
    
    // Fill product form
    await page.getByLabel(/nom français/i).fill('Nouveau Produit Test')
    await page.getByLabel(/nom anglais/i).fill('New Test Product')
    await page.getByLabel(/prix/i).fill('29.99')
    await page.getByLabel(/description française/i).fill('Description test')
    await page.getByLabel(/quantité stock/i).fill('10')
    
    // Select category
    await page.getByRole('combobox', { name: /catégorie/i }).click()
    await page.getByRole('option', { name: /visage/i }).click()
    
    // Select labels
    await page.getByRole('checkbox', { name: /bio certifié/i }).check()
    await page.getByRole('checkbox', { name: /vegan/i }).check()
    
    // Save product
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Verify success
    await expect(page.getByText(/produit créé avec succès/i)).toBeVisible()
    await expect(page.getByText('Nouveau Produit Test')).toBeVisible()
  })

  test('should edit existing product', async ({ page }) => {
    await page.goto('/admin/products')
    
    // Find and edit first product
    const productRow = page.getByTestId('product-row').first()
    await productRow.getByRole('button', { name: /modifier/i }).click()
    
    // Update product
    await page.getByLabel(/prix/i).clear()
    await page.getByLabel(/prix/i).fill('34.99')
    
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Verify update
    await expect(page.getByText(/produit mis à jour/i)).toBeVisible()
    await expect(page.getByText('34.99')).toBeVisible()
  })

  test('should delete product with confirmation', async ({ page }) => {
    await page.goto('/admin/products')
    
    const productRow = page.getByTestId('product-row').first()
    const productName = await productRow.getByTestId('product-name').textContent()
    
    // Delete product
    await productRow.getByRole('button', { name: /supprimer/i }).click()
    
    // Confirm deletion in modal
    await expect(page.getByText(/supprimer définitivement/i)).toBeVisible()
    await page.getByRole('button', { name: /confirmer/i }).click()
    
    // Verify deletion
    await expect(page.getByText(/produit supprimé/i)).toBeVisible()
    await expect(page.getByText(productName!)).not.toBeVisible()
  })

  test('should bulk update product status', async ({ page }) => {
    await page.goto('/admin/products')
    
    // Select multiple products
    await page.getByRole('checkbox', { name: /sélectionner produit/i }).nth(0).check()
    await page.getByRole('checkbox', { name: /sélectionner produit/i }).nth(1).check()
    
    // Bulk action
    await page.getByRole('combobox', { name: /actions en lot/i }).click()
    await page.getByRole('option', { name: /désactiver/i }).click()
    await page.getByRole('button', { name: /appliquer/i }).click()
    
    // Verify bulk update
    await expect(page.getByText(/2 produits mis à jour/i)).toBeVisible()
  })

  test('should manage categories', async ({ page }) => {
    await page.goto('/admin/categories')
    
    // Create new category
    await page.getByRole('button', { name: /nouvelle catégorie/i }).click()
    await page.getByLabel(/nom français/i).fill('Test Category')
    await page.getByLabel(/nom anglais/i).fill('Test Category EN')
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Verify creation
    await expect(page.getByText(/catégorie créée/i)).toBeVisible()
    await expect(page.getByText('Test Category')).toBeVisible()
  })
})