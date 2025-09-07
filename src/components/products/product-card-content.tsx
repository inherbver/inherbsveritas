'use client'

/**
 * @file ProductCardContent - Contenu du product card (titre, description, prix)
 */

import { Info } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ProductBadges } from "@/components/shop/product-badges"

interface ProductCardContentProps {
  product: {
    id: string
    name: string
    description_short?: string
    price: number
    currency?: string
    stock: number
    labels?: any[]
  }
  badges: any[]
  isOutOfStock: boolean
}

export function ProductCardContent({ product, badges, isOutOfStock }: ProductCardContentProps) {
  return (
    <section className="p-4">
      {/* Badges HerbisVeritas */}
      {badges.length > 0 && (
        <section className="mb-3" aria-label="Certifications produit">
          <ProductBadges 
            badges={badges}
            maxVisible={2}
            size="sm"
            layout="horizontal"
          />
        </section>
      )}

      {/* Titre produit */}
      <h3 
        className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-green-600 transition-colors"
        itemProp="name"
      >
        {product.name}
      </h3>

      {/* Description courte avec hover card */}
      {product.description_short && (
        <section className="mb-3" aria-label="Description produit">
          <HoverCard>
            <HoverCardTrigger asChild>
              <aside className="cursor-help">
                <p 
                  className="text-xs text-gray-600 line-clamp-3 leading-relaxed"
                  itemProp="description"
                >
                  {product.description_short}
                </p>
                <Info className="w-3 h-3 text-gray-400 mt-1 opacity-60" />
              </aside>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4">
              <article className="space-y-2">
                <h4 className="font-semibold text-sm">{product.name}</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {product.description_short}
                </p>
                {product.labels && product.labels.length > 0 && (
                  <footer className="pt-2 border-t">
                    <ProductBadges 
                      badges={badges}
                      size="sm"
                      layout="horizontal"
                    />
                  </footer>
                )}
              </article>
            </HoverCardContent>
          </HoverCard>
        </section>
      )}

      {/* Prix avec métadonnées Schema.org */}
      <section 
        className="flex items-center justify-between"
        itemProp="offers" 
        itemScope 
        itemType="https://schema.org/Offer"
        aria-label="Prix et disponibilité"
      >
        <address className="not-italic">
          <span 
            className="text-lg font-bold text-green-600"
            itemProp="price"
            content={product.price.toString()}
          >
            {product.price.toFixed(2)} €
          </span>
          <meta itemProp="priceCurrency" content={product.currency || "EUR"} />
          <meta 
            itemProp="availability" 
            content={isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"} 
          />
        </address>
        
        {/* Stock indicator */}
        <span className="text-xs text-gray-500">
          {isOutOfStock ? 'Rupture' : `Stock: ${product.stock}`}
        </span>
      </section>
    </section>
  )
}