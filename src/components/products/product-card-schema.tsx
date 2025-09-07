/**
 * @file ProductCardSchema - Métadonnées Schema.org pour les produits
 */

interface ProductSchemaProps {
  product: {
    id: string
    name: string
    description_short?: string
    image_url?: string
    price: number
    currency?: string
    slug: string
    stock: number
  }
  isOutOfStock: boolean
}

export function ProductCardSchema({ product, isOutOfStock }: ProductSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description_short || product.name,
    "image": product.image_url || '',
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "HerbisVeritas"
    },
    "offers": {
      "@type": "Offer",
      "url": `/shop/${product.slug}`,
      "priceCurrency": product.currency || "EUR",
      "price": product.price,
      "availability": isOutOfStock 
        ? "https://schema.org/OutOfStock" 
        : "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "HerbisVeritas"
      }
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData)
      }}
    />
  )
}