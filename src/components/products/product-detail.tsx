'use client'

/**
 * ProductDetail - Composant temporaire pour page produit
 * TODO: Implémenter version complète avec ContentCard
 */

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Heart } from "lucide-react"

import type { Product } from '@/types/product'

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image */}
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Image produit</p>
      </div>

      {/* Informations produit */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-lg text-muted-foreground">{product.description_short}</p>
        </div>

        {/* Labels */}
        {product.labels && product.labels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.labels.map((label: string) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
          </div>
        )}

        {/* Prix */}
        <div className="text-2xl font-bold">
          {product.price}€ <span className="text-sm font-normal">/ {product.unit}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 hover:bg-muted"
            >
              -
            </button>
            <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 hover:bg-muted"
            >
              +
            </button>
          </div>
          
          <Button 
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock === 0}
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isAddingToCart ? 'Ajout...' : 'Ajouter au panier'}
          </Button>
          
          <Button variant="outline" size="icon">
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* Description longue */}
        {product.description_long && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{product.description_long}</p>
            </CardContent>
          </Card>
        )}

        {/* INCI */}
        {product.inci_list && product.inci_list.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Composition (INCI)</CardTitle>
            </CardHeader>
            <CardContent>
              {product.inci_list && product.inci_list.length > 0 ? (
                <section className="space-y-2">
                  <h4 className="font-semibold text-sm">Liste INCI :</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-muted-foreground">
                    {product.inci_list.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </section>
              ) : (
                <p className="text-muted-foreground italic text-sm">Aucune information INCI disponible</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Propriétés */}
        {product.properties && (
          <Card>
            <CardHeader>
              <CardTitle>Propriétés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {product.properties.split('\\n').map((property: string, index: number) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {property}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}