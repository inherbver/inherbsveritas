/**
 * Product Card Badges Section
 * 
 * Promotional badges and product labels overlay
 */

import { Badge } from "@/components/ui/badge"
import { Product, LABEL_DISPLAY, LABEL_BADGE_VARIANTS } from "@/types/product"

interface ProductBadgesProps {
  product: Product
}

export function ProductBadges({ product }: ProductBadgesProps) {
  return (
    <>
      {/* Badges promotionnels et labels */}
      <aside className="absolute left-2 top-2 flex flex-col gap-1" role="complementary" aria-label="Labels du produit">
        {/* Badge PROMO */}
        {product.is_on_promotion && (
          <Badge className="bg-orange-500 text-white hover:bg-orange-600">
            PROMO
          </Badge>
        )}
        
        {/* Badge NOUVEAU */}
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

      {/* Overlay rupture de stock */}
      {product.stock === 0 && (
        <aside 
          className="absolute inset-0 flex items-center justify-center bg-black/50" 
          role="alert" 
          aria-live="polite"
          aria-label="Produit en rupture de stock"
        >
          <Badge variant="destructive">Rupture de stock</Badge>
        </aside>
      )}
    </>
  )
}