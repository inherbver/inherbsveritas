'use client'

/**
 * Lazy Cart Drawer - Dynamic Import Optimization
 * Heavy cart component loaded only on user interaction
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

// Placeholder pour cart drawer (component non créé encore)
// const CartDrawer = dynamic(
//   () => import('@/components/cart/cart-drawer'),
//   {
//     ssr: false, // Client-only
//     loading: () => <CartDrawerSkeleton />
//   }
// );

// Hook léger pour le count seulement
function useCartCount() {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    // Lecture légère du localStorage pour le count
    try {
      const cartData = localStorage.getItem('herbisveritas-cart');
      if (cartData) {
        const cart = JSON.parse(cartData);
        setCount(cart.items?.length || 0);
      }
    } catch (error) {
      console.warn('Cart count read error:', error);
    }
  }, []);

  return count;
}

interface LazyCartTriggerProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function LazyCartTrigger({ className, variant = 'ghost' }: LazyCartTriggerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const count = useCartCount();

  const handleClick = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        onClick={handleClick}
        className={className}
        aria-label={`Cart with ${count} items`}
      >
        <div className="relative">
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {count > 99 ? '99+' : count}
            </Badge>
          )}
        </div>
      </Button>
      
      {/* Cart drawer chargé seulement si ouvert */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/50">
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-background p-4">
            <p>Cart Drawer - Coming Soon</p>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </>
  );
}

// function CartDrawerSkeleton() {
//   return (
//     <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
//       <div className="fixed right-0 top-0 h-full w-full max-w-sm border-l bg-background p-6 shadow-lg">
//         <div className="flex items-center justify-between mb-6">
//           <Skeleton className="h-6 w-24" />
//           <Skeleton className="h-6 w-6 rounded" />
//         </div>
//         
//         <div className="space-y-4">
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="flex items-center gap-3 p-4 border rounded">
//               <Skeleton className="h-12 w-12 rounded" />
//               <div className="flex-1">
//                 <Skeleton className="h-4 w-24 mb-2" />
//                 <Skeleton className="h-3 w-16" />
//               </div>
//               <Skeleton className="h-8 w-16" />
//             </div>
//           ))}
//         </div>
//         
//         <div className="absolute bottom-6 left-6 right-6 space-y-4">
//           <div className="flex justify-between items-center">
//             <Skeleton className="h-5 w-16" />
//             <Skeleton className="h-6 w-20" />
//           </div>
//           <Skeleton className="h-10 w-full" />
//           <Skeleton className="h-10 w-full" />
//         </div>
//       </div>
//     </div>
//   );
// }

// Export types pour compatibilité
export type { LazyCartTriggerProps };