import "server-only";
import type Stripe from 'stripe';

// Handlers pour les différents événements Stripe
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.['order_id'];
  
  if (!orderId) {
    console.error('Order ID manquant dans metadata checkout session');
    return;
  }

  try {
    // TODO: Importer updateOrderStatus depuis lib/orders/operations quand disponible
    console.log(`Commande ${orderId} confirmée - paiement accepté`);
    console.log(`Payment Intent ID: ${session.payment_intent}`);
    
    // Marquer commande comme "processing"
    // await updateOrderStatus({
    //   orderId,
    //   newStatus: 'processing',
    //   paymentIntentId: session.payment_intent as string,
    // });

    // TODO: Ajouter autres actions post-paiement:
    // - Envoyer email de confirmation
    // - Vider le panier utilisateur  
    // - Déclencher préparation commande
    
  } catch (error) {
    console.error(`Erreur traitement checkout session completed pour order ${orderId}:`, error);
    throw error;
  }
}

export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.['order_id'];
  
  if (!orderId) {
    console.error('Order ID manquant dans metadata payment intent');
    return;
  }

  console.log(`Paiement définitivement confirmé pour commande ${orderId}`);
  console.log(`Montant: ${paymentIntent.amount_received / 100}€`);
  
  // Confirmation finale - paiement encaissé
  // TODO: Ajouter logique de confirmation finale si nécessaire
}

export async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.['order_id'];
  
  if (!orderId) {
    console.error('Order ID manquant dans metadata payment intent failed');
    return;
  }

  console.log(`Paiement échoué pour commande ${orderId}`);
  console.log(`Raison: ${paymentIntent.last_payment_error?.message}`);
  
  // TODO: Marquer commande comme "payment_failed"
  // await updateOrderStatus({
  //   orderId,
  //   newStatus: 'payment_failed',
  //   errorMessage: paymentIntent.last_payment_error?.message,
  // });
}