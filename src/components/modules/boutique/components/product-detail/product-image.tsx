/**
 * Product Image Section
 * 
 * Main product image with fallback
 */

import Image from 'next/image'

interface ProductImageProps {
  imageUrl?: string | undefined
  productName: string
}

export function ProductImage({ imageUrl, productName }: ProductImageProps) {
  return (
    <section className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={productName}
            width={600}
            height={600}
            className="w-full h-auto object-contain bg-gray-50"
            itemProp="image"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        ) : (
          <div className="aspect-square flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">Image à venir</span>
          </div>
        )}
      </figure>
    </section>
  )
}