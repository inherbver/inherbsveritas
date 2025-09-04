/**
 * Product Card Actions Section
 * 
 * Add to cart and favorite buttons
 */

import { Button } from "@/components/ui/button"
import { Product } from "@/types/product"

interface ProductActionsProps {
  product: Product
  variant?: 'default' | 'compact'
  isAddingToCart: boolean
  onAddToCart: () => void
  onToggleFavorite?: ((product: Product) => void) | undefined
}

export function ProductActions({ 
  product, 
  variant = 'default', 
  isAddingToCart, 
  onAddToCart, 
  onToggleFavorite 
}: ProductActionsProps) {
  return (
    <div className="flex w-full gap-2">
      <Button
        onClick={onAddToCart}
        disabled={product.stock === 0 || isAddingToCart}
        className="flex-1"
        size={variant === 'compact' ? 'sm' : 'default'}
      >
        {isAddingToCart 
          ? 'Ajout...' 
          : product.stock === 0 
            ? 'Rupture' 
            : 'Ajouter au panier'
        }
      </Button>

      {onToggleFavorite && (
        <Button
          variant="outline"
          size={variant === 'compact' ? 'sm' : 'icon'}
          onClick={() => onToggleFavorite(product)}
          aria-label="Ajouter aux favoris"
        >
          ♡
        </Button>
      )}
    </div>
  )
}