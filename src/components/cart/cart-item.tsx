'use client'

/**
 * === 🛒 CartItem Component ===
 * Composant item de panier réutilisable
 * Avec quantity controls et optimistic updates
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { HerbisCartItem } from '@/types/herbis-veritas';

// ============================================================================
// TYPES
// ============================================================================

interface CartItemProps {
  item: HerbisCartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  isUpdating?: boolean;
  isRemoving?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

// ============================================================================
// CART ITEM COMPONENT
// ============================================================================

export function CartItem({ 
  item, 
  onUpdateQuantity, 
  onRemoveItem, 
  isUpdating = false, 
  isRemoving = false,
  variant = 'default',
  className = ''
}: CartItemProps) {
  const [localQuantity, setLocalQuantity] = React.useState(item.quantity.toString());

  // Sync local quantity with item quantity
  React.useEffect(() => {
    setLocalQuantity(item.quantity.toString());
  }, [item.quantity]);

  // Handlers
  const handleQuantityInputChange = (value: string) => {
    setLocalQuantity(value);
    
    // Valider et sync si nombre valide
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      if (numValue === 0) {
        onRemoveItem(item.productId);
      } else if (numValue <= (item.stock_quantity || 999)) {
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

  // Stock status
  const isLowStock = item.stock_quantity !== undefined && 
                     item.low_stock_threshold !== undefined && 
                     item.stock_quantity <= item.low_stock_threshold;
  
  const isOutOfStock = item.stock_quantity !== undefined && item.stock_quantity === 0;
  
  // Total price
  const totalPrice = item.price * item.quantity;

  // Render variants
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-3 p-3 border rounded-lg ${className}`}>
        {/* Image */}
        <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Name + Price */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatPrice(item.price)} × {item.quantity}
          </p>
        </div>

        {/* Total + Remove */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{formatPrice(totalPrice)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(item.productId)}
            disabled={isRemoving}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`border rounded-lg p-4 space-y-4 ${className}`}>
        <div className="flex space-x-4">
          {/* Image */}
          <div className="h-20 w-20 flex-shrink-0 rounded overflow-hidden border">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product details */}
          <div className="flex-1 space-y-2">
            <div>
              <h4 className="font-medium">{item.name}</h4>
              <p className="text-sm text-muted-foreground">
                {formatPrice(item.price)} • {item.unit}
              </p>
            </div>

            {/* Labels */}
            {item.labels && item.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            )}

            {/* INCI List */}
            {item.inci_list && item.inci_list.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">
                  INCI: {item.inci_list.slice(0, 5).join(', ')}
                  {item.inci_list.length > 5 && '...'}
                </p>
              </div>
            )}

            {/* Stock status */}
            {(isOutOfStock || isLowStock) && (
              <div className="flex gap-1">
                {isOutOfStock && (
                  <Badge variant="destructive" className="text-xs">Rupture de stock</Badge>
                )}
                {isLowStock && !isOutOfStock && (
                  <Badge variant="outline" className="text-xs">Stock faible</Badge>
                )}
              </div>
            )}
          </div>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(item.productId)}
            disabled={isRemoving}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Quantity controls + total */}
        <div className="flex items-center justify-between pt-2 border-t">
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

            {item.stock_quantity !== undefined && (
              <span className="text-xs text-muted-foreground ml-2">
                Stock: {item.stock_quantity}
              </span>
            )}
          </div>

          <div className="text-right">
            <p className="font-medium">{formatPrice(totalPrice)}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center space-x-4 py-4 ${className}`}>
      {/* Image */}
      <div className="h-16 w-16 flex-shrink-0 rounded overflow-hidden border">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
        <p className="text-sm text-muted-foreground">
          {formatPrice(item.price)} • {item.unit}
        </p>
        
        {/* Labels (limited) */}
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

      {/* Quantity controls */}
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

      {/* Total + Remove */}
      <div className="text-right min-w-0">
        <p className="text-sm font-medium">{formatPrice(totalPrice)}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveItem(item.productId)}
          disabled={isRemoving}
          className="text-muted-foreground hover:text-destructive p-1 h-auto mt-1"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// CART ITEM LIST COMPONENT
// ============================================================================

interface CartItemListProps {
  items: HerbisCartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  isUpdating?: boolean;
  isRemoving?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export function CartItemList({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  isUpdating, 
  isRemoving, 
  variant = 'default',
  className = ''
}: CartItemListProps) {
  if (items.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">Aucun article dans le panier</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <CartItem
          key={item.id || item.productId}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          {...(isUpdating !== undefined && { isUpdating })}
          {...(isRemoving !== undefined && { isRemoving })}
          variant={variant}
        />
      ))}
    </div>
  );
}