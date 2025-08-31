'use client'

import * as React from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  ProductCardProps, 
  LABEL_DISPLAY, 
  LABEL_BADGE_VARIANTS 
} from "@/types/product"

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
    <Card 
      className={cn(
        "group overflow-hidden transition-all hover:shadow-lg",
        variant === 'compact' && "max-w-sm",
        className
      )}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">Image à venir</span>
          </div>
        )}
        
        {/* Labels HerbisVeritas */}
        {product.labels.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {product.labels.slice(0, 2).map((label) => (
              <Badge
                key={label}
                variant={LABEL_BADGE_VARIANTS[label] as any}
                className="text-xs"
              >
                {LABEL_DISPLAY[label]}
              </Badge>
            ))}
            {product.labels.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{product.labels.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* New Badge */}
        {product.is_new && (
          <Badge className="absolute right-2 top-2 bg-green-500">
            Nouveau
          </Badge>
        )}

        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="destructive">Rupture de stock</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Product Title */}
        <h3 className={cn(
          "font-semibold leading-tight",
          variant === 'compact' ? "text-sm" : "text-base"
        )}>
          {product.name}
        </h3>

        {/* Description */}
        {product.description_short && variant !== 'compact' && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.description_short}
          </p>
        )}

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold">
            {formatPrice(product.price, product.currency)}
          </span>
          <span className="text-xs text-muted-foreground">
            / {product.unit}
          </span>
        </div>

        {/* Stock indicator */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="mt-1 text-xs text-amber-600">
            Plus que {product.stock} en stock
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex w-full gap-2">
          <Button
            onClick={handleAddToCart}
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
      </CardFooter>
    </Card>
  )
}

// Skeleton component for loading state
function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <CardContent className="p-4">
        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 bg-muted rounded animate-pulse w-3/4 mb-2" />
        <div className="h-5 bg-muted rounded animate-pulse w-1/2" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="h-10 bg-muted rounded animate-pulse w-full" />
      </CardFooter>
    </Card>
  )
}