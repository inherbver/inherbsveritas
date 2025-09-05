import type Stripe from 'stripe';

export interface OrderDataForStripe {
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    herbisLabel: string;
  }>;
  shippingAddressId: string;
  billingAddressId: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string | null;
  orderId: string;
}

export type StripeWebhookEvent = Stripe.Event & {
  data: {
    object: Stripe.Checkout.Session | Stripe.PaymentIntent;
  };
};

export type StripeEventType = 
  | 'checkout.session.completed'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed';