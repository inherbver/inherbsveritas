'use client'

/**
 * Product Card Component - HerbisVeritas V2 MVP
 * 
 * Main product card component composed of modular sections
 * Refactored from 291-line monolith for maintainability
 */

import * as React from "react"
import { CardContent, CardFooter } from "@/components/ui/card"
import { ProductCardProps } from "@/types/product"
import { InciListCompact } from "@/components/ui/inci-list"
import { CardWrapper } from './card-wrapper'
import { ProductImage } from './product-image'
import { ProductBadges } from './product-badges'
import { ProductInfo } from './product-info'
import { ProductActions } from './product-actions'
import { ProductCardSkeleton } from './product-skeleton'

export function ProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  variant = 'default',
  className,
  isLoading = false,
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)

  const handleAddToCart = async () => {
    if (!onAddToCart || isAddingToCart) return
    
    setIsAddingToCart(true)
    try {
      await onAddToCart(product)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  if (isLoading) {
    return <ProductCardSkeleton />
  }

  return (
    <article itemScope itemType="https://schema.org/Product">
      <CardWrapper productSlug={product.slug} variant={variant} className={className}>
        {/* Product Image avec badges overlay */}
        <div className="relative">
          <ProductImage 
            imageUrl={product.image_url}
            productName={product.name}
            productSlug={product.slug}
            variant={variant}
          />
          <ProductBadges product={product} />
        </div>

        <CardContent className="p-4">
          <ProductInfo 
            product={product}
            variant={variant}
            formatPrice={formatPrice}
          />

          {/* INCI List pour cosmétiques */}
          {product.inci_list && product.inci_list.length > 0 && variant !== 'compact' && (
            <section className="mt-2" role="complementary" aria-label="Composition INCI">
              <InciListCompact 
                inciList={product.inci_list} 
                className="border-t pt-2 mt-2"
              />
            </section>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <ProductActions
            product={product}
            variant={variant}
            isAddingToCart={isAddingToCart}
            onAddToCart={handleAddToCart}
            onToggleFavorite={onToggleFavorite}
          />
        </CardFooter>
      </CardWrapper>
    </article>
  )
}

export { ProductCardSkeleton }