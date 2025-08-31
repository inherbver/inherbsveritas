/**
 * Product Image Section
 * 
 * Main product image with fallback
 */

interface ProductImageProps {
  imageUrl?: string
  productName: string
}

export function ProductImage({ imageUrl, productName }: ProductImageProps) {
  return (
    <section className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-auto object-contain bg-gray-50"
            itemProp="image"
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