/**
 * ROOT: UI CONTRACT — ProductCard
 * Props: ProductViewModel (jamais un DBRow direct)
 * AUCUN fetch ici; affichage pur + micro-interactions
 * Prix: formatPrice(price, 'EUR', locale) - price déjà en unités
 * Images: image_url || getDefaultProductImage()
 * Labels: LABEL_DISPLAY[label] pour texte; LABEL_BADGE_VARIANTS[label] pour styling
 */

'use client'

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ProductCardSchema } from "./product-card-schema"
import { ProductCardImage } from "./product-card-image"
import { ProductCardContent } from "./product-card-content"
import { ProductCardActions } from "./product-card-actions"
import { createHerbisVeritasBadges } from "@/components/shop/product-badges"
import { useCartActions, useIsInCart } from "@/features/cart"
import { ProductCardProps } from "@/types/product"
import { cn } from "@/lib/utils"

export function EnhancedProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  className,
  isLoading = false,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = React.useState(false)
  const { addToCart, isAdding } = useCartActions()
  const { isInCart, quantity } = useIsInCart(product.id)

  const isOutOfStock = product.stock === 0
  const isNew = product.is_new || false
  const isOnPromotion = product.is_on_promotion || false

  // États du bouton panier
  const cartButtonState = React.useMemo(() => {
    if (isOutOfStock) return { label: 'Rupture de stock', disabled: true, variant: 'secondary' as const }
    if (isAdding) return { label: 'Ajout en cours...', disabled: true, variant: 'default' as const }
    if (isInCart) return { label: `Dans le panier (${quantity})`, disabled: false, variant: 'secondary' as const }
    return { label: 'Ajouter au panier', disabled: false, variant: 'default' as const }
  }, [isOutOfStock, isAdding, isInCart, quantity])

  // Handler ajout panier
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isOutOfStock || isAdding) return
    
    try {
      await addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        labels: (product.labels || []) as any,
        slug: product.slug,
        ...(product.image_url && { image_url: product.image_url })
      })
      
      // Backward compatibility
      if (onAddToCart) {
        await onAddToCart(product)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  // Handler favoris
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!onToggleFavorite) return
    setIsFavorite(!isFavorite)
    onToggleFavorite(product)
  }

  // Génération badges
  const badges = React.useMemo(() => 
    createHerbisVeritasBadges(product.labels, isNew, isOnPromotion),
    [product.labels, isNew, isOnPromotion]
  )

  // Skeleton pendant chargement
  if (isLoading) {
    return (
      <Card className={cn("group relative overflow-hidden", className)}>
        <CardHeader className="p-0">
          <div className="aspect-square bg-muted animate-pulse" />
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="h-8 bg-muted animate-pulse rounded w-full" />
        </CardFooter>
      </Card>
    )
  }

  return (
    <>
      <ProductCardSchema product={product} isOutOfStock={isOutOfStock} />

      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer",
          isOutOfStock && "opacity-70",
          className
        )}
        itemScope
        itemType="https://schema.org/Product"
      >
        <Link href={`/shop/${product.slug}`} className="block">
          <CardHeader className="p-0 relative">
            <ProductCardImage 
              product={product}
              isOutOfStock={isOutOfStock}
              isNew={isNew}
              isOnPromotion={isOnPromotion}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite ? handleToggleFavorite : undefined}
              showFavoriteButton={!!onToggleFavorite}
            />
          </CardHeader>

          <CardContent className="p-0">
            <ProductCardContent 
              product={product}
              badges={badges}
              isOutOfStock={isOutOfStock}
            />
            <meta itemProp="url" content={`/shop/${product.slug}`} />
          </CardContent>
        </Link>

        <CardFooter className="p-0">
          <ProductCardActions 
            product={product}
            cartButtonState={cartButtonState}
            onAddToCart={handleAddToCart}
          />
        </CardFooter>
      </Card>
    </>
  )
}