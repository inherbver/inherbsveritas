import { Suspense } from 'react';
import { stripe } from '@/lib/stripe/config';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
  searchParams: { session_id?: string };
}

async function SuccessContent({ sessionId }: { sessionId: string }) {
  try {
    // Récupérer session Stripe pour vérifier le paiement
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.['order_id'];
    const orderNumber = session.metadata?.['order_number'];
    const amountTotal = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';

    if (!orderId) {
      throw new Error('Commande introuvable');
    }

    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        {/* Header succès */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            Paiement confirmé !
          </h1>
          
          <p className="text-gray-600">
            Merci pour votre commande HerbisVeritas
          </p>
        </div>

        {/* Détails commande */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Commande :</span>
              <span className="font-semibold">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Montant :</span>
              <span className="font-semibold">{amountTotal}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Statut :</span>
              <span className="text-green-600 font-medium">Confirmé</span>
            </div>
          </div>
        </div>

        {/* Message de confirmation */}
        <div className="mb-6 text-center">
          <p className="text-gray-700 mb-2">
            Votre commande est en cours de préparation.
          </p>
          <p className="text-sm text-gray-500">
            Un email de confirmation va vous être envoyé avec tous les détails.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/products" className="block">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Continuer mes achats
            </Button>
          </Link>
          
          <Link href="/account/orders" className="block">
            <Button variant="outline" className="w-full">
              Voir mes commandes
            </Button>
          </Link>
        </div>
      </div>
    );

  } catch (error) {
    console.error('Erreur récupération session checkout:', error);
    
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg 
            className="w-8 h-8 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </div>
        
        <h1 className="text-xl font-bold text-red-600 mb-2">
          Erreur de vérification
        </h1>
        
        <p className="text-gray-600 mb-4">
          Impossible de vérifier le statut de votre paiement.
        </p>
        
        <Link href="/contact">
          <Button className="w-full">
            Contacter le support
          </Button>
        </Link>
      </div>
    );
  }
}

function LoadingState() {
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg text-center">
      <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-600">Vérification du paiement...</p>
    </div>
  );
}

export default function CheckoutSuccessPage({ searchParams }: Props) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-xl font-bold text-red-600 mb-2">Session invalide</h1>
        <p className="text-gray-600 mb-4">Aucune session de paiement trouvée.</p>
        <Link href="/">
          <Button>Retour à l&apos;accueil</Button>
        </Link>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <SuccessContent sessionId={sessionId} />
    </Suspense>
  );
}