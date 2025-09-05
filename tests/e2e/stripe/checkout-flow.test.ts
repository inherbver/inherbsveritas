import { test, expect } from '@playwright/test';

// Ce test nécessite un environnement de test avec Stripe Test Mode activé
test.describe('Stripe Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers une page de test avec des produits dans le panier
    await page.goto('/test/checkout-demo');
  });

  test('should display checkout button and redirect to Stripe', async ({ page }) => {
    // Vérifier que le bouton checkout est présent
    const checkoutButton = page.getByTestId('checkout-button');
    await expect(checkoutButton).toBeVisible();
    
    // Vérifier le texte du bouton (doit inclure le montant)
    await expect(checkoutButton).toContainText('Payer');
    await expect(checkoutButton).toContainText('€');

    // Cliquer sur le bouton checkout
    await checkoutButton.click();

    // Attendre la redirection vers Stripe (en mode test)
    await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 10000 });
    
    // Vérifier que nous sommes sur la page de paiement Stripe
    await expect(page.locator('text=Secure payment')).toBeVisible({ timeout: 5000 });
  });

  test('should handle checkout session creation error gracefully', async ({ page }) => {
    // Simuler une erreur API en interceptant la requête
    await page.route('/api/stripe/checkout', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Erreur serveur simulée' }),
      });
    });

    const checkoutButton = page.getByTestId('checkout-button');
    await checkoutButton.click();

    // Vérifier que l'utilisateur reste sur la page (pas de redirection)
    await expect(page).toHaveURL(/\/test\/checkout-demo/);
    
    // Vérifier que le bouton n'est plus en état de chargement
    await expect(checkoutButton).not.toContainText('Redirection...');
  });

  test('should show loading state during checkout', async ({ page }) => {
    // Intercepter la requête pour la ralentir
    await page.route('/api/stripe/checkout', async (route) => {
      // Attendre 2 secondes avant de répondre
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    const checkoutButton = page.getByTestId('checkout-button');
    
    // Cliquer et vérifier immédiatement l'état de chargement
    await checkoutButton.click();
    await expect(checkoutButton).toContainText('Redirection...');
    await expect(checkoutButton).toBeDisabled();
  });

  test('should disable checkout button when no items', async ({ page }) => {
    // Naviguer vers une page avec panier vide
    await page.goto('/test/checkout-empty');
    
    const checkoutButton = page.getByTestId('checkout-button');
    await expect(checkoutButton).toBeDisabled();
  });

  // Test avec des cartes de test Stripe (nécessite un vrai environnement de test)
  test.skip('should complete full payment flow with test card', async ({ page }) => {
    // Note: Ce test nécessite une configuration spéciale avec webhooks de test
    
    const checkoutButton = page.getByTestId('checkout-button');
    await checkoutButton.click();

    // Attendre la redirection vers Stripe
    await expect(page).toHaveURL(/checkout\.stripe\.com/);

    // Remplir les informations de paiement avec une carte de test
    await page.fill('[data-testid="cardNumber"]', '4242424242424242');
    await page.fill('[data-testid="cardExpiry"]', '12/34');
    await page.fill('[data-testid="cardCvc"]', '123');
    await page.fill('[data-testid="billingName"]', 'Test User');

    // Soumettre le paiement
    await page.click('button[type="submit"]');

    // Vérifier la redirection vers la page de succès
    await expect(page).toHaveURL(/\/checkout\/success/, { timeout: 15000 });
    await expect(page.locator('text=Paiement confirmé')).toBeVisible();
  });
});

test.describe('Checkout Success Page', () => {
  test('should display success message with valid session', async ({ page }) => {
    // Simuler une session valide (nécessiterait un mock du serveur)
    const mockSessionId = 'cs_test_mock_session_123';
    await page.goto(`/checkout/success?session_id=${mockSessionId}`);

    // Pour ce test, nous devons mocker la réponse API Stripe côté serveur
    // En pratique, cela nécessiterait une configuration de test plus complexe
    
    // Vérifier les éléments de base de la page
    await expect(page.locator('h1')).toContainText('Paiement confirmé');
    await expect(page.locator('text=Merci pour votre commande')).toBeVisible();
  });

  test('should show error with invalid session', async ({ page }) => {
    await page.goto('/checkout/success');
    
    await expect(page.locator('text=Session invalide')).toBeVisible();
    await expect(page.locator('text=Aucune session de paiement trouvée')).toBeVisible();
  });
});

test.describe('Checkout Cancel Page', () => {
  test('should display cancel message and action buttons', async ({ page }) => {
    const mockOrderId = 'order_test_123';
    await page.goto(`/checkout/cancel?order_id=${mockOrderId}`);

    // Vérifier les éléments de la page d'annulation
    await expect(page.locator('h1')).toContainText('Paiement annulé');
    await expect(page.locator('text=Votre paiement a été annulé')).toBeVisible();
    
    // Vérifier les boutons d'action
    await expect(page.locator('text=Retourner au panier')).toBeVisible();
    await expect(page.locator('text=Continuer mes achats')).toBeVisible();
    
    // Vérifier que l'ordre ID est affiché si fourni
    if (mockOrderId) {
      await expect(page.locator(`text=${mockOrderId}`)).toBeVisible();
    }
  });

  test('should navigate back to cart when clicking cart button', async ({ page }) => {
    await page.goto('/checkout/cancel');
    
    await page.click('text=Retourner au panier');
    await expect(page).toHaveURL(/\/cart/);
  });
});