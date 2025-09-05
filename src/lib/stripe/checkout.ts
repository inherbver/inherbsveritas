import "server-only";
import { stripe, config } from './config';
import type { OrderDataForStripe, CheckoutSessionResponse } from '@/types/stripe';

export async function createCheckoutSession(
  orderData: OrderDataForStripe,
  orderId: string,
  orderNumber: string
): Promise<CheckoutSessionResponse> {
  try {
    // Créer line items depuis les produits de la commande
    const lineItems = orderData.items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.productName,
          images: item.productImage ? [item.productImage] : [],
          metadata: {
            product_id: item.productId,
            herbis_label: item.herbisLabel,
          },
        },
        unit_amount: Math.round(item.price * 100), // Conversion en centimes
      },
      quantity: item.quantity,
    }));

    // Ajouter frais de port (4.90€ fixe MVP)
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Frais de port',
          images: [],
          metadata: {
            product_id: 'shipping',
            herbis_label: 'SHIPPING',
          },
        },
        unit_amount: 490, // 4.90€ en centimes
      },
      quantity: 1,
    });

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      
      // Métadonnées critiques pour webhooks
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        user_id: orderData.userId,
      },

      // URLs de redirection
      success_url: `${config.appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.appUrl}/checkout/cancel?order_id=${orderId}`,
      
      // Configuration paiement
      payment_intent_data: {
        metadata: {
          order_id: orderId,
          order_number: orderNumber,
        },
      },
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      orderId,
    };

  } catch (error) {
    console.error('Erreur création Checkout Session:', error);
    throw new Error('Impossible de créer la session de paiement');
  }
}