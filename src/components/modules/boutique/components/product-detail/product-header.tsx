/**
 * Product Header Section
 * 
 * Title, price, labels and main product information
 */

import { Badge } from "@/components/ui/badge"
import { Product, LABEL_DISPLAY, LABEL_BADGE_VARIANTS } from "@/types/product"

interface ProductHeaderProps {
  product: Product
  formatPrice: (price: number, currency: string) => string
}

export function ProductHeader({ product, formatPrice }: ProductHeaderProps) {
  return (
    <header className="space-y-4">
      {/* Titre H1 + Unité */}
      <div>
        <h1 
          className="font-serif text-3xl md:text-4xl font-bold mb-2"
          itemProp="name"
        >
          {product.name}
        </h1>
        {product.unit && (
          <p className="text-lg text-muted-foreground italic">
            {product.unit}
          </p>
        )}
      </div>

      {/* Description courte introductive */}
      {product.description_short && (
        <p 
          className="text-lg text-muted-foreground leading-relaxed"
          itemProp="description"
        >
          {product.description_short}
        </p>
      )}

      {/* Labels HerbisVeritas */}
      {product.labels.length > 0 && (
        <aside className="flex flex-wrap gap-2" role="complementary" aria-label="Labels de qualité">
          {product.labels.map((label) => (
            <Badge
              key={label}
              variant={LABEL_BADGE_VARIANTS[label] as any}
              className="text-sm px-3 py-1"
            >
              {LABEL_DISPLAY[label]}
            </Badge>
          ))}
        </aside>
      )}

      {/* Prix avec mention TTC */}
      <section className="space-y-2" itemScope itemType="https://schema.org/Offer" aria-label="Prix et disponibilité">
        <div className="text-2xl font-bold text-primary">
          <span itemProp="price" content={product.price.toString()}>
            {formatPrice(product.price, product.currency)}
          </span>
          <span className="text-sm font-normal text-muted-foreground ml-2">
            TTC
          </span>
        </div>
        <meta itemProp="priceCurrency" content={product.currency} />
        <meta 
          itemProp="availability" 
          content={product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} 
        />
      </section>
    </header>
  )
}