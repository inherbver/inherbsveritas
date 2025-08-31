'use client'

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { 
  ProductCardProps, 
  LABEL_DISPLAY, 
  LABEL_BADGE_VARIANTS 
} from "@/types/product"
import { InciListCompact } from "@/components/ui/inci-list"

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

  // Mobile: Card entière cliquable (sauf boutons)
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (variant === 'compact') {
      return (
        <Card className={cn("group overflow-hidden transition-all hover:shadow-lg max-w-sm", className)}>
          {children}
        </Card>
      )
    }
    
    return (
      <Card className={cn("group overflow-hidden transition-all hover:shadow-lg md:cursor-auto", className)}>
        <Link href={`/products/${product.slug}`} className="block md:hidden">
          <div className="md:pointer-events-none">
            {children}
          </div>
        </Link>
        <div className="hidden md:block">
          {children}
        </div>
      </Card>
    )
  }

  return (
    <article itemScope itemType="https://schema.org/Product">
      <CardWrapper>
        {/* Product Image - Aspect 4/5 avec hover zoom */}
        <figure className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
        <Link href={`/products/${product.slug}`} className="hidden md:block">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
              itemProp="image"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-sm text-muted-foreground">Image à venir</span>
            </div>
          )}
        </Link>
        
        {/* Image pour mobile (sans lien car card entière est cliquable) */}
        <div className="md:hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
              itemProp="image"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-sm text-muted-foreground">Image à venir</span>
            </div>
          )}
        </div>
        
        {/* Badges en haut à gauche */}
        <aside className="absolute left-2 top-2 flex flex-col gap-1">
          {/* Badge PROMO en orange si promotion */}
          {product.is_on_promotion && (
            <Badge className="bg-orange-500 text-white hover:bg-orange-600">
              PROMO
            </Badge>
          )}
          
          {/* Badge NOUVEAU en primary si nouveau */}
          {product.is_new && (
            <Badge className="bg-primary text-primary-foreground">
              NOUVEAU
            </Badge>
          )}
          
          {/* Labels HerbisVeritas */}
          {product.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
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
        </aside>

        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <aside className="absolute inset-0 flex items-center justify-center bg-black/50" role="alert" aria-live="polite">
            <Badge variant="destructive">Rupture de stock</Badge>
          </aside>
        )}
        </figure>

      <CardContent className="p-4">
        {/* Product Title - Police serif, tronqué sur 1 ligne */}
        <Link href={`/products/${product.slug}`} className="hidden md:block">
          <h3 
            className={cn(
              "font-serif font-semibold leading-tight line-clamp-1 hover:text-primary transition-colors",
              variant === 'compact' ? "text-sm" : "text-base"
            )}
            itemProp="name"
          >
            {product.name}
          </h3>
        </Link>
        <h3 
          className={cn(
            "md:hidden font-serif font-semibold leading-tight line-clamp-1",
            variant === 'compact' ? "text-sm" : "text-base"
          )}
          itemProp="name"
        >
          {product.name}
        </h3>

        {/* Description courte - 3 lignes max avec HoverCard pour texte complet */}
        {product.description_short && variant !== 'compact' && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <p 
                className="mt-1 text-sm text-muted-foreground line-clamp-3 cursor-help"
                itemProp="description"
              >
                {product.description_short}
              </p>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold">{product.name}</h4>
                <p className="text-sm">{product.description_short}</p>
                {product.description_long && (
                  <p className="text-xs text-muted-foreground">
                    Cliquez sur le produit pour voir la description complète
                  </p>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        )}

        {/* Prix - Format XX.XX € en couleur primary avec métadonnées Schema.org */}
        <section className="mt-2 flex items-baseline gap-2" itemScope itemType="https://schema.org/Offer">
          <span 
            className="text-lg font-bold text-primary"
            itemProp="price"
            content={product.price.toString()}
          >
            {formatPrice(product.price, product.currency)}
          </span>
          <span className="text-xs text-muted-foreground">
            / {product.unit}
          </span>
          <meta itemProp="priceCurrency" content={product.currency} />
          <meta 
            itemProp="availability" 
            content={product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} 
          />
        </section>

        {/* Stock indicator */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="mt-1 text-xs text-amber-600">
            Plus que {product.stock} en stock
          </p>
        )}

        {/* INCI List for cosmetics - Seulement sur variant default */}
        {product.inci_list && product.inci_list.length > 0 && variant !== 'compact' && (
          <div className="mt-2">
            <InciListCompact 
              inciList={product.inci_list} 
              className="border-t pt-2 mt-2"
            />
          </div>
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
      </CardWrapper>
    </article>
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