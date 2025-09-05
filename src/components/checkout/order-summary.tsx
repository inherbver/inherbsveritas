'use client';

import type { OrderDataForStripe } from '@/types/stripe';

interface OrderSummaryProps {
  orderData: OrderDataForStripe;
}

export function OrderSummary({ orderData }: OrderSummaryProps) {
  const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 4.90; // Frais de port fixe MVP
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-50 p-4 rounded-lg" data-testid="order-summary">
      <h3 className="text-lg font-semibold mb-4">Récapitulatif commande</h3>
      
      {/* Items */}
      <div className="space-y-3 mb-4">
        {orderData.items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex-1">
              <p className="font-medium text-sm">{item.productName}</p>
              <p className="text-xs text-gray-500">
                Label: {item.herbisLabel} • Qté: {item.quantity}
              </p>
            </div>
            <p className="font-medium">
              {(item.price * item.quantity).toFixed(2)}€
            </p>
          </div>
        ))}
      </div>

      {/* Calculs */}
      <div className="border-t pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Sous-total</span>
          <span>{subtotal.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Frais de port</span>
          <span>{shipping.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between text-lg font-semibold border-t pt-2">
          <span>Total</span>
          <span>{total.toFixed(2)}€</span>
        </div>
      </div>

      {/* Info paiement */}
      <div className="mt-4 p-3 bg-green-50 rounded text-sm">
        <p className="text-green-800">
          🔒 Paiement sécurisé par Stripe
        </p>
        <p className="text-green-600 text-xs mt-1">
          Vos données bancaires sont protégées et ne transitent pas par nos serveurs
        </p>
      </div>
    </div>
  );
}