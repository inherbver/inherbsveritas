import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import type { OrderDataForStripe } from '@/types/stripe';

// Mock Stripe
jest.mock('@/lib/stripe/config', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
  config: {
    publishableKey: 'pk_test_mock',
    webhookSecret: 'whsec_mock',
    appUrl: 'http://localhost:3000',
  },
}));

const mockStripe = require('@/lib/stripe/config').stripe;

describe('Stripe Checkout', () => {
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
        price: 45.50,
        quantity: 1,
        herbisLabel: 'NATURAL',
      },
    ],
    shippingAddressId: 'addr-ship-123',
    billingAddressId: 'addr-bill-123',
  };

  const mockOrderId = 'order-123';
  const mockOrderNumber = 'ORD-2025-001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session with correct line items', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const result = await createCheckoutSession(mockOrderData, mockOrderId, mockOrderNumber);

      expect(result).toEqual({
        sessionId: 'cs_test_123',
        checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_123',
        orderId: 'order-123',
      });

      // Vérifier l'appel à Stripe
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: expect.arrayContaining([
            // Premier produit
            expect.objectContaining({
              price_data: expect.objectContaining({
                currency: 'eur',
                product_data: expect.objectContaining({
                  name: 'Crème Bio Test',
                  metadata: {
                    product_id: 'prod-1',
                    herbis_label: 'ORGANIC',
                  },
                }),
                unit_amount: 2999, // 29.99€ en centimes
              }),
              quantity: 2,
            }),
            // Deuxième produit
            expect.objectContaining({
              price_data: expect.objectContaining({
                currency: 'eur',
                product_data: expect.objectContaining({
                  name: 'Sérum Test',
                }),
                unit_amount: 4550, // 45.50€ en centimes
              }),
              quantity: 1,
            }),
            // Frais de port
            expect.objectContaining({
              price_data: expect.objectContaining({
                currency: 'eur',
                product_data: expect.objectContaining({
                  name: 'Frais de port',
                }),
                unit_amount: 490, // 4.90€ en centimes
              }),
              quantity: 1,
            }),
          ]),
          metadata: {
            order_id: 'order-123',
            order_number: 'ORD-2025-001',
            user_id: 'user-123',
          },
          success_url: 'http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: 'http://localhost:3000/checkout/cancel?order_id=order-123',
        })
      );
    });

    it('should include shipping fees in line items', async () => {
      const mockSession = { id: 'cs_test_123', url: 'https://checkout.stripe.com/pay/cs_test_123' };
      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      await createCheckoutSession(mockOrderData, mockOrderId, mockOrderNumber);

      const callArgs = mockStripe.checkout.sessions.create.mock.calls[0][0];
      const lineItems = callArgs.line_items;

      // Vérifier que les frais de port sont inclus
      const shippingItem = lineItems.find((item: any) => 
        item.price_data.product_data.name === 'Frais de port'
      );

      expect(shippingItem).toBeDefined();
      expect(shippingItem.price_data.unit_amount).toBe(490); // 4.90€
      expect(shippingItem.quantity).toBe(1);
    });

    it('should handle Stripe API errors', async () => {
      const mockError = new Error('Stripe API Error');
      mockStripe.checkout.sessions.create.mockRejectedValue(mockError);

      await expect(
        createCheckoutSession(mockOrderData, mockOrderId, mockOrderNumber)
      ).rejects.toThrow('Impossible de créer la session de paiement');
    });

    it('should calculate correct line items count', async () => {
      const mockSession = { id: 'cs_test_123', url: 'https://checkout.stripe.com/pay/cs_test_123' };
      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      await createCheckoutSession(mockOrderData, mockOrderId, mockOrderNumber);

      const callArgs = mockStripe.checkout.sessions.create.mock.calls[0][0];
      const lineItems = callArgs.line_items;

      // 2 produits + 1 frais de port = 3 line items
      expect(lineItems).toHaveLength(3);
    });
  });
});