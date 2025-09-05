import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
  searchParams: { order_id?: string };
}

export default function CheckoutCancelPage({ searchParams }: Props) {
  const orderId = searchParams.order_id;

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      {/* Header annulation */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg 
            className="w-8 h-8 text-orange-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-orange-600 mb-2">
          Paiement annulé
        </h1>
        
        <p className="text-gray-600">
          Votre paiement a été annulé
        </p>
      </div>

      {/* Message informatif */}
      <div className="bg-orange-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-orange-800 mb-2">Que s&apos;est-il passé ?</h3>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Vous avez annulé le processus de paiement</li>
          <li>• Aucun montant n&apos;a été débité</li>
          <li>• Votre panier est toujours disponible</li>
          {orderId && (
            <li>• Commande temporaire créée : <code className="text-xs">{orderId}</code></li>
          )}
        </ul>
      </div>

      {/* Prochaines étapes */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Que souhaitez-vous faire ?</h3>
        
        <div className="space-y-3">
          <Link href="/cart" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Retourner au panier
            </Button>
          </Link>
          
          <Link href="/products" className="block">
            <Button variant="outline" className="w-full">
              Continuer mes achats
            </Button>
          </Link>
          
          <Link href="/contact" className="block">
            <Button variant="ghost" className="w-full text-sm">
              Une question ? Contactez-nous
            </Button>
          </Link>
        </div>
      </div>

      {/* Aide */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Besoin d&apos;aide ? Nos conseillers sont disponibles pour vous accompagner dans votre commande.
        </p>
      </div>
    </div>
  );
}