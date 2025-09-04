/**
 * Product Card Image Section
 * 
 * Image with hover effects and responsive behavior
 */

import Link from 'next/link'
import Image from 'next/image'

interface ProductImageProps {
  imageUrl?: string | undefined
  productName: string
  productSlug: string
  variant?: 'default' | 'compact'
}

export function ProductImage({ imageUrl, productName, productSlug }: ProductImageProps) {
  return (
    <figure className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
      {/* Image Desktop (avec lien) */}
      <Link href={`/products/${productSlug}`} className="hidden md:block">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            itemProp="image"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            itemProp="image"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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