import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { POST } from '@/app/api/stripe/webhook/route';
import type Stripe from 'stripe';

// Mock NextRequest
const createMockRequest = (body: string) => ({
  text: jest.fn().mockResolvedValue(body),
}) as any;

// Mock des modules
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('@/lib/stripe/config', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
  config: {
    webhookSecret: 'whsec_test_123',
  },
}));

jest.mock('@/lib/stripe/webhooks', () => ({
  handleCheckoutSessionCompleted: jest.fn(),
  handlePaymentIntentSucceeded: jest.fn(),
  handlePaymentIntentFailed: jest.fn(),
}));

const mockHeaders = require('next/headers').headers;
const mockStripe = require('@/lib/stripe/config').stripe;
const mockWebhookHandlers = require('@/lib/stripe/webhooks');

describe('Stripe Webhook API Route', () => {
  const mockSignature = 'test-signature';
  const mockBody = 'webhook-body';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock headers par défaut
    mockHeaders.mockReturnValue(new Map([
      ['stripe-signature', mockSignature],
    ]));
  });


  describe('Validation de signature', () => {
    it('should reject request without signature', async () => {
      mockHeaders.mockReturnValue(new Map()); // Pas de signature

      const request = createMockRequest(mockBody);
      const response = await POST(request);

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe('Signature webhook manquante');
    });

    it('should reject request with invalid signature', async () => {
      const mockError = new Error('Invalid signature');
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw mockError;
      });

      const request = createMockRequest(mockBody);
      const response = await POST(request);

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe('Signature webhook invalide');
    });
  });

  describe('Event handling', () => {
    const mockCheckoutEvent: Stripe.Event = {
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: {
            order_id: 'order-123',
            order_number: 'ORD-2025-001',
          },
          payment_intent: 'pi_test_123',
        } as Stripe.Checkout.Session,
      },
      created: Date.now(),
      livemode: false,
      pending_webhooks: 1,
      request: { id: 'req_test_123', idempotency_key: null },
      api_version: '2024-12-18',
      object: 'event',
    };

    it('should handle checkout.session.completed event', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValue(mockCheckoutEvent);

      const request = createMockRequest(mockBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockWebhookHandlers.handleCheckoutSessionCompleted).toHaveBeenCalledWith(
        mockCheckoutEvent.data.object
      );

      const responseData = await response.json();
      expect(responseData).toEqual({
        received: true,
        eventId: 'evt_test_123',
      });
    });

    it('should handle payment_intent.succeeded event', async () => {
      const paymentSuccessEvent: Stripe.Event = {
        ...mockCheckoutEvent,
        id: 'evt_payment_success',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            metadata: {
              order_id: 'order-123',
            },
            amount_received: 7489, // 74.89€ en centimes
          } as Stripe.PaymentIntent,
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(paymentSuccessEvent);

      const request = createMockRequest(mockBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockWebhookHandlers.handlePaymentIntentSucceeded).toHaveBeenCalledWith(
        paymentSuccessEvent.data.object
      );
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const paymentFailedEvent: Stripe.Event = {
        ...mockCheckoutEvent,
        id: 'evt_payment_failed',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
            metadata: {
              order_id: 'order-123',
            },
            last_payment_error: {
              message: 'Your card was declined.',
            },
          } as Stripe.PaymentIntent,
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(paymentFailedEvent);

      const request = createMockRequest(mockBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockWebhookHandlers.handlePaymentIntentFailed).toHaveBeenCalledWith(
        paymentFailedEvent.data.object
      );
    });

    it('should handle unknown event types gracefully', async () => {
      const unknownEvent: Stripe.Event = {
        ...mockCheckoutEvent,
        type: 'invoice.payment_succeeded' as any,
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(unknownEvent);

      const request = createMockRequest(mockBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockWebhookHandlers.handleCheckoutSessionCompleted).not.toHaveBeenCalled();
      expect(mockWebhookHandlers.handlePaymentIntentSucceeded).not.toHaveBeenCalled();
      expect(mockWebhookHandlers.handlePaymentIntentFailed).not.toHaveBeenCalled();
    });

    it('should return 500 on handler errors', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValue(mockCheckoutEvent);
      mockWebhookHandlers.handleCheckoutSessionCompleted.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = createMockRequest(mockBody);
      const response = await POST(request);

      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData.error).toBe('Erreur traitement webhook');
      expect(responseData.eventId).toBe('evt_test_123');
    });
  });
});