'use client'

/**
 * === 🛒 CartSheet Component ===
 * Sheet cart moderne avec optimistic updates React 19
 * Integration avec ContentGrid pour cohérence UI
 */

import React from 'react';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartQuery, useUpdateQuantityMutation, useRemoveFromCartMutation, useCartOptimistic, useDebouncedSync } from '@/features/cart';
import { formatPrice } from '@/lib/utils';
import { CartSummary } from './cart-summary';

// ============================================================================
// TYPES
// ============================================================================

interface CartSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

// ============================================================================
// CART ITEM COMPONENT
// ============================================================================

interface CartItemProps {
  item: import('@/types/herbis-veritas').HerbisCartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  isUpdating?: boolean;
  isRemoving?: boolean;
}

function CartItem({ item, onUpdateQuantity, onRemoveItem, isUpdating = false, isRemoving = false }: CartItemProps) {
  return (
    <div className="flex items-center space-x-4 py-4">
      {/* Image produit */}
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            width={64}
            height={64}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Détails produit */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground line-clamp-2">
          {item.name}
        </h4>
        <p className="text-sm text-muted-foreground">
          {formatPrice(item.price)} • {item.unit}
        </p>
        
        {/* Labels HerbisVeritas */}
        {item.labels && item.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.labels.slice(0, 2).map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
            {item.labels.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{item.labels.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Contrôles quantité */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
          disabled={isUpdating || item.quantity <= 1}
        >
          {item.quantity <= 1 ? (
            <Trash2 className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
        </Button>

        <span className="text-sm font-medium min-w-[2rem] text-center">
          {item.quantity}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
          disabled={isUpdating || (item.stock_quantity !== undefined && item.quantity >= item.stock_quantity)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Prix total + Remove */}
      <div className="text-right">
        <p className="text-sm font-medium">
          {formatPrice(item.price * item.quantity)}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveItem(item.productId)}
          disabled={isRemoving}
          className="text-muted-foreground hover:text-destructive p-1 h-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// CART SHEET COMPONENT
// ============================================================================

export function CartSheet({ open, onOpenChange, trigger }: CartSheetProps) {
  const { data: serverCart, isLoading } = useCartQuery();
  const updateQuantityMutation = useUpdateQuantityMutation();
  const removeItemMutation = useRemoveFromCartMutation();

  // Optimistic updates avec React 19
  const {
    optimisticItems,
    updateQuantityOptimistic,
    removeItemOptimistic,
    itemCount,
    subtotal,
    isEmpty,
  } = useCartOptimistic(serverCart?.items || []);

  // Debouncing pour sync serveur
  const { debouncedSync: debouncedUpdateQuantity } = useDebouncedSync(
    (productId: string, quantity: number) => {
      updateQuantityMutation.mutate({ productId, quantity });
    },
    300
  );

  const { debouncedSync: debouncedRemoveItem } = useDebouncedSync(
    (productId: string) => {
      removeItemMutation.mutate({ productId });
    },
    150
  );

  // Handlers avec optimistic updates
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    // 1. Update optimiste immédiat (0ms perceived latency)
    updateQuantityOptimistic(productId, quantity);
    
    // 2. Sync serveur debouncé
    debouncedUpdateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    // 1. Update optimiste immédiat
    removeItemOptimistic(productId);
    
    // 2. Sync serveur debouncé
    debouncedRemoveItem(productId);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="relative">
      <ShoppingCart className="h-4 w-4" />
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <Sheet {...(open !== undefined && { open })} {...(onOpenChange && { onOpenChange })}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Panier ({itemCount} article{itemCount !== 1 ? 's' : ''})
          </SheetTitle>
          <SheetDescription>
            {isEmpty ? 'Votre panier est vide' : `Total : ${formatPrice(subtotal)}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full pt-6">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Chargement du panier...</p>
              </div>
            </div>
          ) : isEmpty ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Votre panier est vide</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ajoutez des produits pour commencer
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Items du panier */}
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="divide-y">
                  {optimisticItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                      isUpdating={updateQuantityMutation.isPending}
                      isRemoving={removeItemMutation.isPending}
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* Footer avec détails et checkout */}
              <div className="border-t pt-4 space-y-4">
                <CartSummary showShippingMethods={false} />

                <Button className="w-full" size="lg">
                  Finaliser la commande
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Prix TTC, livraison incluse
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}