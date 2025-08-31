import { test, expect } from '@playwright/test'

test.describe('Login Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should login with valid credentials', async ({ page }) => {
    // Arrange
    const email = 'user@herbisveritas.fr'
    const password = 'SecurePass123!'

    // Act
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/mot de passe/i).fill(password)
    await page.getByRole('button', { name: /se connecter/i }).click()

    // Assert
    await expect(page).toHaveURL('/profile')
    await expect(page.getByText(/connexion réussie/i)).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Act
    await page.getByLabel(/email/i).fill('invalid@test.com')
    await page.getByLabel(/mot de passe/i).fill('wrongpassword')
    await page.getByRole('button', { name: /se connecter/i }).click()

    // Assert
    await expect(page.getByText(/email ou mot de passe incorrect/i)).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('should validate email format', async ({ page }) => {
    // Act
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/email/i).blur()

    // Assert
    await expect(page.getByText(/email invalide/i)).toBeVisible()
  })

  test('should redirect admin to admin dashboard', async ({ page }) => {
    // Act
    await page.getByLabel(/email/i).fill('admin@herbisveritas.fr')
    await page.getByLabel(/mot de passe/i).fill('AdminPass123!')
    await page.getByRole('button', { name: /se connecter/i }).click()

    // Assert
    await expect(page).toHaveURL('/admin')
  })

  test('should show loading state during login', async ({ page }) => {
    // Act
    await page.getByLabel(/email/i).fill('user@herbisveritas.fr')
    await page.getByLabel(/mot de passe/i).fill('SecurePass123!')
    
    const loginButton = page.getByRole('button', { name: /se connecter/i })
    await loginButton.click()

    // Assert loading state
    await expect(loginButton).toBeDisabled()
    await expect(page.getByTestId('spinner')).toBeVisible()
  })
})