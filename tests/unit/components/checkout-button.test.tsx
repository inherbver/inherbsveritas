import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { CheckoutButton } from '@/components/checkout/checkout-button';
import type { OrderDataForStripe } from '@/types/stripe';

// Mock du module toast
jest.mock('@/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock de fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock de window.location.href
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

const mockToast = require('@/lib/toast').toast;

describe('CheckoutButton', () => {
  const mockOrderData: OrderDataForStripe = {
    userId: 'user-123',
    items: [
      {
        productId: 'prod-1',
        productName: 'Crème Bio Test',
        productImage: 'https://example.com/image.jpg',
        price: 29.99,
        quantity: 2,
        herbisLabel: 'ORGANIC',
      },
      {
        productId: 'prod-2',
        productName: 'Sérum Test',
        productImage: 'https://example.com/serum.jpg',
        price: 15.50,
        quantity: 1,
        herbisLabel: 'NATURAL',
      },
    ],
    shippingAddressId: 'addr-ship-123',
    billingAddressId: 'addr-bill-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    window.location.href = '';
  });

  it('should render checkout button with correct total', () => {
    render(<CheckoutButton orderData={mockOrderData} />);

    const button = screen.getByTestId('checkout-button');
    expect(button).toBeInTheDocument();
    
    // Total: (29.99 * 2) + (15.50 * 1) + 4.90 (frais port) = 80.38€
    expect(button).toHaveTextContent('Payer 80.38€');
  });

  it('should disable button when no items in order', () => {
    const emptyOrderData = { ...mockOrderData, items: [] };
    render(<CheckoutButton orderData={emptyOrderData} />);

    const button = screen.getByTestId('checkout-button');
    expect(button).toBeDisabled();
  });

  it('should disable button when disabled prop is true', () => {
    render(<CheckoutButton orderData={mockOrderData} disabled={true} />);

    const button = screen.getByTestId('checkout-button');
    expect(button).toBeDisabled();
  });

  it('should show loading state when processing', async () => {
    // Mock successful API response with delay
    mockFetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({
            sessionId: 'cs_test_123',
            checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_123',
            orderId: 'order-123',
          }),
        }), 100)
      )
    );

    render(<CheckoutButton orderData={mockOrderData} />);

    const button = screen.getByTestId('checkout-button');
    fireEvent.click(button);

    // Vérifier l'état de chargement
    expect(button).toHaveTextContent('Redirection...');
    expect(button).toBeDisabled();

    // Attendre la fin du processus
    await waitFor(() => {
      expect(window.location.href).toBe('https://checkout.stripe.com/pay/cs_test_123');
    }, { timeout: 2000 });
  });

  it('should handle successful checkout and redirect to Stripe', async () => {
    const mockResponse = {
      sessionId: 'cs_test_123',
      checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_123',
      orderId: 'order-123',
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<CheckoutButton orderData={mockOrderData} />);

    const button = screen.getByTestId('checkout-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData: mockOrderData }),
      });
    });

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Redirection vers le paiement...');
      expect(window.location.href).toBe('https://checkout.stripe.com/pay/cs_test_123');
    });
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Erreur serveur' }),
    });

    render(<CheckoutButton orderData={mockOrderData} />);

    const button = screen.getByTestId('checkout-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Erreur serveur');
    });

    // Vérifier que le bouton n'est plus en état de chargement
    await waitFor(() => {
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Payer 80.38€');
    });

    // Vérifier qu'il n'y a pas eu de redirection
    expect(window.location.href).toBe('');
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<CheckoutButton orderData={mockOrderData} />);

    const button = screen.getByTestId('checkout-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Network error');
    });
  });

  it('should handle missing checkout URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        sessionId: 'cs_test_123',
        checkoutUrl: null, // URL manquante
        orderId: 'order-123',
      }),
    });

    render(<CheckoutButton orderData={mockOrderData} />);

    const button = screen.getByTestId('checkout-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('URL de checkout manquante');
    });

    expect(window.location.href).toBe('');
  });

  it('should apply custom className', () => {
    const customClass = 'custom-checkout-class';
    render(<CheckoutButton orderData={mockOrderData} className={customClass} />);

    const button = screen.getByTestId('checkout-button');
    expect(button).toHaveClass(customClass);
  });

  it('should prevent multiple clicks when loading', async () => {
    mockFetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({
            sessionId: 'cs_test_123',
            checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_123',
            orderId: 'order-123',
          }),
        }), 100)
      )
    );

    render(<CheckoutButton orderData={mockOrderData} />);

    const button = screen.getByTestId('checkout-button');
    
    // Premier clic
    fireEvent.click(button);
    expect(button).toHaveTextContent('Redirection...');
    
    // Deuxième clic pendant le chargement
    fireEvent.click(button);
    
    // Ne devrait être appelé qu'une seule fois
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});