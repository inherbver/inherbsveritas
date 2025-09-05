'use client'

/**
 * === 🛒 CartDisplay Component ===
 * Affichage cart intégré avec ContentGrid pour cohérence UI
 * Optimistic updates + debounced server sync
 */

import React from 'react';
import { ContentGrid } from '@/components/ui/content-grid';
import { ContentCard } from '@/components/ui/content-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Minus, Plus, Trash2, Package } from 'lucide-react';
import { useCartQuery, useUpdateQuantityMutation, useRemoveFromCartMutation, useCartOptimistic, useDebouncedSync } from '@/hooks/cart';
import { formatPrice } from '@/lib/utils';
import type { HerbisCartItem } from '@/types/herbis-veritas';

// ============================================================================
// TYPES
// ============================================================================

interface CartDisplayProps {
  className?: string;
  showTitle?: boolean;
  maxItems?: number;
  compact?: boolean;
}

interface CartItemCardProps {
  item: HerbisCartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  isUpdating?: boolean;
  isRemoving?: boolean;
  compact?: boolean;
}

// ============================================================================
// CART ITEM CARD COMPONENT
// ============================================================================

function CartItemCard({ 
  item, 
  onUpdateQuantity, 
  onRemoveItem, 
  isUpdating = false, 
  isRemoving = false,
  compact = false 
}: CartItemCardProps) {
  const [localQuantity, setLocalQuantity] = React.useState(item.quantity.toString());

  // Sync local quantity with item quantity
  React.useEffect(() => {
    setLocalQuantity(item.quantity.toString());
  }, [item.quantity]);

  const handleQuantityInputChange = (value: string) => {
    setLocalQuantity(value);
    
    // Valider et sync si nombre valide
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      if (numValue === 0) {
        onRemoveItem(item.productId);
      } else {
        onUpdateQuantity(item.productId, numValue);
      }
    }
  };

  const handleIncrement = () => {
    const newQuantity = item.quantity + 1;
    const stockLimit = item.stock_quantity;
    
    if (!stockLimit || newQuantity <= stockLimit) {
      onUpdateQuantity(item.productId, newQuantity);
    }
  };

  const handleDecrement = () => {
    if (item.quantity <= 1) {
      onRemoveItem(item.productId);
    } else {
      onUpdateQuantity(item.productId, item.quantity - 1);
    }
  };

  // Stock alerts
  const isLowStock = item.stock_quantity !== undefined && 
                     item.low_stock_threshold !== undefined && 
                     item.stock_quantity <= item.low_stock_threshold;
  
  const isOutOfStock = item.stock_quantity !== undefined && item.stock_quantity === 0;

  // Actions pour ContentCard
  const cardActions = compact ? [] : [
    {
      label: 'Supprimer',
      onClick: () => onRemoveItem(item.productId),
      variant: 'ghost' as const,
      icon: Trash2,
      loading: isRemoving,
      destructive: true,
    }
  ];

  // Badges pour ContentCard
  const cardBadges = [
    { label: `${formatPrice(item.price)}`, variant: 'essence' as const },
    { label: item.unit || 'pièce', variant: 'category' as const },
    ...(isOutOfStock ? [{ label: 'Rupture', variant: 'rupture' as const }] : []),
    ...(isLowStock && !isOutOfStock ? [{ label: 'Stock faible', variant: 'status' as const }] : []),
    ...item.labels?.slice(0, 2).map(label => ({ 
      label: label.toString(), 
      variant: 'bio' as const 
    })) || []
  ];

  // Custom content avec controls quantité
  const quantityControls = (
    <div className="space-y-3">
      {/* Total prix */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total :</span>
        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
      </div>

      {/* Contrôles quantité */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={isUpdating}
          className="h-8 w-8 p-0"
        >
          {item.quantity <= 1 ? (
            <Trash2 className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
        </Button>

        <Input
          type="number"
          min="0"
          max={item.stock_quantity}
          value={localQuantity}
          onChange={(e) => handleQuantityInputChange(e.target.value)}
          disabled={isUpdating}
          className="h-8 w-16 text-center text-sm"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          disabled={isUpdating || (item.stock_quantity !== undefined && item.quantity >= item.stock_quantity)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Stock info */}
      {item.stock_quantity !== undefined && (
        <div className="text-xs text-muted-foreground">
          Stock restant : {item.stock_quantity}
        </div>
      )}
    </div>
  );

  return (
    <ContentCard
      title={item.name}
      {...(item.inci_list && { description: `INCI: ${item.inci_list.slice(0, 3).join(', ')}${item.inci_list.length > 3 ? '...' : ''}` })}
      {...(item.image_url && { imageUrl: item.image_url })}
      badges={cardBadges}
      actions={cardActions}
      isLoading={isUpdating || isRemoving}
      customContent={quantityControls}
      {...(compact && { className: "min-h-0" })}
    />
  );
}

// ============================================================================
// CART DISPLAY COMPONENT
// ============================================================================

export function CartDisplay({ 
  className, 
  showTitle = true, 
  maxItems,
  compact = false 
}: CartDisplayProps) {
  const { data: serverCart, isLoading, error } = useCartQuery();
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
    labelsDistribution,
    averageItemPrice,
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

  // Items à afficher (avec limitation si maxItems)
  const displayItems = maxItems ? optimisticItems.slice(0, maxItems) : optimisticItems;
  const hasMore = maxItems && optimisticItems.length > maxItems;

  if (isLoading) {
    return (
      <div className={className}>
        {showTitle && (
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Votre panier</h2>
          </div>
        )}
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Chargement du panier...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {showTitle && (
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Votre panier</h2>
          </div>
        )}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Erreur lors du chargement du panier</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={className}>
        {showTitle && (
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Votre panier</h2>
          </div>
        )}
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Votre panier est vide</p>
          <p className="text-sm text-muted-foreground mt-1">
            Découvrez nos produits artisanaux
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header avec stats */}
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              Votre panier ({itemCount} article{itemCount !== 1 ? 's' : ''})
            </h2>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatPrice(subtotal)}</p>
            {!compact && (
              <p className="text-xs text-muted-foreground">
                Prix moyen : {formatPrice(averageItemPrice)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Analytics HerbisVeritas (si pas compact) */}
      {!compact && Object.keys(labelsDistribution).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          <span className="text-sm text-muted-foreground mr-2">Labels :</span>
          {Object.entries(labelsDistribution).map(([label, count]) => (
            <Badge key={label} variant="secondary" className="text-xs">
              {label} ({count})
            </Badge>
          ))}
        </div>
      )}

      {/* Grid items avec ContentCard */}
      <ContentGrid 
        items={displayItems.map(item => ({
          ...item,
          id: item.id || item.productId, // Ensure id exists for ContentGrid
        }))}
        renderItem={(item) => (
          <CartItemCard
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            isUpdating={updateQuantityMutation.isPending}
            isRemoving={removeItemMutation.isPending}
            compact={compact}
          />
        )}
        {...(compact && { columns: { default: 1 } })}
        gap={compact ? 'sm' : 'md'}
      />

      {/* Show more si limitation */}
      {hasMore && (
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Et {optimisticItems.length - maxItems!} article{optimisticItems.length - maxItems! > 1 ? 's' : ''} de plus
          </p>
        </div>
      )}
    </div>
  );
}