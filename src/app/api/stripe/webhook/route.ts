import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, config } from '@/lib/stripe/config';
import { handleCheckoutSessionCompleted, handlePaymentIntentSucceeded, handlePaymentIntentFailed } from '@/lib/stripe/webhooks';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('Webhook signature manquante');
    return NextResponse.json(
      { error: 'Signature webhook manquante' }, 
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Vérification critique de la signature webhook
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      config.webhookSecret
    );

    console.log(`Webhook reçu: ${event.type} [${event.id}]`);
    
  } catch (error) {
    console.error('Erreur vérification signature webhook:', error);
    return NextResponse.json(
      { error: 'Signature webhook invalide' },
      { status: 400 }
    );
  }

  try {
    // Traitement selon le type d'événement
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        console.log(`✅ Checkout session completed traité: ${event.id}`);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        console.log(`✅ Payment intent succeeded traité: ${event.id}`);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        console.log(`⚠️ Payment intent failed traité: ${event.id}`);
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    // CRITIQUE: Réponse 200 rapide pour Stripe
    return NextResponse.json({ received: true, eventId: event.id });
    
  } catch (error) {
    console.error(`Erreur traitement webhook ${event.type}:`, error);
    
    // Retourner 500 pour que Stripe réessaie
    return NextResponse.json(
      { error: 'Erreur traitement webhook', eventId: event.id },
      { status: 500 }
    );
  }
}

// Seul POST est autorisé pour les webhooks
export async function GET() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 });
}