'use client'

/**
 * ProductDetail - Composant temporaire pour page produit
 * TODO: Implémenter version complète avec ContentCard
 */

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, ImageIcon } from "lucide-react"

import type { Product } from '@/types/product'
import { ProductTabs } from './product-tabs'

interface ProductDetailProps {
  product: Product
  onAddToCart?: (product: Product, quantity: number) => Promise<void>
}

// Component image avec fallbacks Supabase
function ProductImage({ product }: { product: Product }) {
  const [imageError, setImageError] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  const supabaseBaseUrl = 'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products'
  
  // Fallbacks images par ordre de priorité
  const imageSources = React.useMemo(() => {
    const sources = []
    
    // 1. Image URL directe du produit si disponible
    if (product.image_url && !imageError) {
      sources.push(product.image_url)
    }
    
    // 2. Image basée sur l'ID du produit depuis Supabase Storage
    if (product.id) {
      sources.push(`${supabaseBaseUrl}/product_${product.id}.webp`)
      sources.push(`${supabaseBaseUrl}/product_${product.id}.jpg`)
      sources.push(`${supabaseBaseUrl}/product_${product.id}.png`)
    }
    
    // 3. Image basée sur le slug
    if (product.slug) {
      sources.push(`${supabaseBaseUrl}/${product.slug}.webp`)
      sources.push(`${supabaseBaseUrl}/${product.slug}.jpg`)
    }
    
    // 4. Images génériques par ordre de préférence
    sources.push(`${supabaseBaseUrl}/pdct_1.webp`)
    sources.push(`${supabaseBaseUrl}/default-product.webp`)
    
    return sources
  }, [product, imageError, supabaseBaseUrl])

  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const currentImageSrc = imageSources[currentImageIndex] || '/images/default-product.jpg'

  const handleImageError = () => {
    if (currentImageIndex < imageSources.length - 1) {
      setCurrentImageIndex(prev => prev + 1)
    } else {
      setImageError(true)
      setIsLoading(false)
    }
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  if (imageError && currentImageIndex >= imageSources.length - 1) {
    // Fallback final : placeholder avec icône
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{product.name}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <Image
        src={currentImageSrc}
        alt={product.name}
        fill
        className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  )
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
        {/* Image avec fallbacks Supabase */}
        <ProductImage product={product} />

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