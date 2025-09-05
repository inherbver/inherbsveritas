import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import type { OrderDataForStripe } from '@/types/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderData }: { orderData: OrderDataForStripe } = body;

    // Validation basique
    if (!orderData || !orderData.userId || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Données de commande invalides' },
        { status: 400 }
      );
    }

    // TODO: Créer commande via RPC existant quand disponible
    // Pour le moment, simuler création ordre
    const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockOrderNumber = `ORD-${Date.now()}`;

    console.log('Création session checkout pour:', {
      userId: orderData.userId,
      itemsCount: orderData.items.length,
      orderId: mockOrderId,
    });

    // Créer session Stripe Checkout
    const session = await createCheckoutSession(orderData, mockOrderId, mockOrderNumber);

    return NextResponse.json(session);

  } catch (error) {
    console.error('Erreur API checkout session:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}

// Méthodes non autorisées
export async function GET() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 });
}