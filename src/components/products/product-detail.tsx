'use client'

/**
 * ProductDetail - Composant temporaire pour page produit
 * TODO: Implémenter version complète avec ContentCard
 */

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart } from "lucide-react"

import type { Product } from '@/types/product'
import { ProductTabs } from './product-tabs'

interface ProductDetailProps {
  product: Product
  onAddToCart?: (product: Product, quantity: number) => Promise<void>
}

export function ProductDetail({ product, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = React.useState(1)
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)

  const handleAddToCart = async () => {
    if (!onAddToCart) return
    
    setIsAddingToCart(true)
    try {
      await onAddToCart(product, quantity)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <main className="space-y-8">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <figure className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">Image produit</p>
        </figure>

        {/* Informations produit */}
        <header className="space-y-6">
          <section>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-lg text-muted-foreground">{product.description_short}</p>
          </section>

          {/* Labels */}
          {product.labels && product.labels.length > 0 && (
            <section className="flex flex-wrap gap-2" aria-label="Certifications et labels">
              {product.labels.map((label: string) => (
                <Badge key={label} variant="secondary">
                  {label}
                </Badge>
              ))}
            </section>
          )}

          {/* Prix */}
          <section className="text-2xl font-bold" aria-label="Prix du produit">
            {product.price}€ <span className="text-sm font-normal">/ {product.unit}</span>
          </section>

          {/* Actions */}
          <section className="flex items-center gap-4" aria-label="Actions produit">
            <fieldset className="flex items-center border rounded">
              <legend className="sr-only">Quantité</legend>
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-muted"
                aria-label="Diminuer la quantité"
              >
                -
              </button>
              <span className="px-4 py-2 min-w-[50px] text-center" aria-label={`Quantité: ${quantity}`}>
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-muted"
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </fieldset>
            
            <Button 
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock === 0}
              className="flex-1"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAddingToCart ? 'Ajout...' : 'Ajouter au panier'}
            </Button>
            
            <Button variant="outline" size="icon" aria-label="Ajouter aux favoris">
              <Heart className="w-4 h-4" />
            </Button>
          </section>
        </header>
      </section>

      <ProductTabs product={product} />
    </main>
  )
}