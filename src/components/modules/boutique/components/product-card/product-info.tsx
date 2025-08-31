/**
 * Product Card Info Section
 * 
 * Title, description, price and stock information
 */

import Link from 'next/link'
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { Product } from "@/types/product"

interface ProductInfoProps {
  product: Product
  variant?: 'default' | 'compact'
  formatPrice: (price: number, currency: string) => string
}

export function ProductInfo({ product, variant = 'default', formatPrice }: ProductInfoProps) {
  return (
    <>
      {/* Product Title */}
      <header>
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
      </header>

      {/* Description with HoverCard */}
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
            <article className="space-y-2">
              <header>
                <h4 className="font-semibold">{product.name}</h4>
              </header>
              <p className="text-sm">{product.description_short}</p>
              {product.description_long && (
                <p className="text-xs text-muted-foreground">
                  Cliquez sur le produit pour voir la description complète
                </p>
              )}
            </article>
          </HoverCardContent>
        </HoverCard>
      )}

      {/* Prix avec métadonnées Schema.org */}
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

      {/* Indicateur stock */}
      {product.stock > 0 && product.stock <= 5 && (
        <aside className="mt-1 text-xs text-amber-600" role="status" aria-live="polite">
          Plus que {product.stock} en stock
        </aside>
      )}
    </>
  )
}