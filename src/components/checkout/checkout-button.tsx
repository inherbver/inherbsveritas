'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import type { OrderDataForStripe, CheckoutSessionResponse } from '@/types/stripe';

interface CheckoutButtonProps {
  orderData: OrderDataForStripe;
  disabled?: boolean;
  className?: string;
}

export function CheckoutButton({ orderData, disabled = false, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (disabled || loading) return;

    setLoading(true);

    try {
      console.log('Démarrage processus checkout:', {
        userId: orderData.userId,
        itemsCount: orderData.items.length,
        totalItems: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
      });

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur création session');
      }

      const result: CheckoutSessionResponse = await response.json();
      
      if (!result.checkoutUrl) {
        throw new Error('URL de checkout manquante');
      }

      console.log('Session créée:', {
        sessionId: result.sessionId,
        orderId: result.orderId,
      });

      toast.success('Redirection vers le paiement...');
      
      // Redirection vers Stripe Checkout
      window.location.href = result.checkoutUrl;
      
    } catch (error) {
      console.error('Erreur checkout:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Impossible de procéder au paiement';
        
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 4.90;

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || loading || orderData.items.length === 0}
      className={`w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      data-testid="checkout-button"
    >
      {loading 
        ? 'Redirection...' 
        : `Payer ${totalAmount.toFixed(2)}€`
      }
    </Button>
  );
}