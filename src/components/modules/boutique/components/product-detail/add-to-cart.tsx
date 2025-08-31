/**
 * Add to Cart Section
 * 
 * Quantity selector and cart functionality
 */

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Product } from "@/types/product"
import { Minus, Plus } from "lucide-react"

interface AddToCartProps {
  product: Product
  quantity: number
  isAddingToCart: boolean
  onQuantityChange: (delta: number) => void
  onQuantitySet: (quantity: number) => void
  onAddToCart: () => void
}

export function AddToCart({
  product,
  quantity,
  isAddingToCart,
  onQuantityChange,
  onQuantitySet,
  onAddToCart
}: AddToCartProps) {
  return (
    <Card className="p-6 shadow-lg border-2 border-primary/10" role="form" aria-label="Ajouter au panier">
      <CardContent className="p-0 space-y-4">
        
        {/* Sélecteur quantité */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Quantité :</legend>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
              aria-label="Diminuer la quantité"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) => {
                const value = Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                onQuantitySet(value)
              }}
              className="w-20 text-center"
              aria-label="Quantité"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(1)}
              disabled={quantity >= 10}
              aria-label="Augmenter la quantité"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </fieldset>

        {/* Indicateur stock */}
        {product.stock > 0 && product.stock <= 5 && (
          <aside className="text-sm text-amber-600" role="status" aria-live="polite">
            ⚠️ Plus que {product.stock} en stock
          </aside>
        )}

        {/* Bouton ajout panier large */}
        <Button
          onClick={onAddToCart}
          disabled={product.stock === 0 || isAddingToCart}
          className="w-full h-12 text-lg"
          size="lg"
        >
          {isAddingToCart && <Spinner size="sm" className="mr-2" />}
          {isAddingToCart 
            ? 'Ajout en cours...' 
            : product.stock === 0 
              ? 'Produit en rupture' 
              : `Ajouter ${quantity} au panier`
          }
        </Button>
      </CardContent>
    </Card>
  )
}