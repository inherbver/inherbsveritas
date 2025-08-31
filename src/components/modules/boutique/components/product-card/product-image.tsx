/**
 * Product Card Image Section
 * 
 * Image with hover effects and responsive behavior
 */

import Link from 'next/link'

interface ProductImageProps {
  imageUrl?: string
  productName: string
  productSlug: string
  variant?: 'default' | 'compact'
}

export function ProductImage({ imageUrl, productName, productSlug, variant = 'default' }: ProductImageProps) {
  return (
    <figure className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
      {/* Image Desktop (avec lien) */}
      <Link href={`/products/${productSlug}`} className="hidden md:block">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
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
      
      {/* Image Mobile (sans lien car card entière cliquable) */}
      <div className="md:hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
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
    </figure>
  )
}