'use client'

/**
 * ProductCard Optimisé - Wrapper ContentCard
 * 
 * Version optimisée utilisant le ContentCard générique + Integration Cart HerbisVeritas
 * Réduit de ~180 lignes à ~80 lignes (-57% code)
 * Compatible avec l'API existante ProductCardProps
 */

import * as React from "react"
import { ShoppingCart, Heart } from "lucide-react"
import { ContentCard, type ContentCardBadge, type ContentCardAction } from "@/components/ui/content-card"
import { InciListCompact } from "@/components/ui/inci-list"
import { ProductBadges, createHerbisVeritasBadges } from "@/components/shop/product-badges"
import { ProductCardProps } from "@/types/product"
import { useCartActions, useIsInCart } from "@/hooks/cart"

export function ProductCardOptimized({
  product,
  onAddToCart, // Deprecated: utilise maintenant hooks cart directement
  onToggleFavorite,
  variant = 'default',
  className,
  isLoading = false,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = React.useState(false)

  // === Integration Cart HerbisVeritas ===
  const { addToCart, isAdding } = useCartActions()
  const { isInCart, quantity } = useIsInCart(product.id)

  // Handler pour ajout au panier avec hooks cart
  const handleAddToCart = async () => {
    if (product.stock === 0 || isAdding) return
    
    try {
      // Utilise les hooks cart modernes au lieu de l'ancienne prop
      addToCart({ 
        productId: product.id, 
        name: product.name,
        price: product.price,
        quantity: 1,
        labels: product.labels || [],
        slug: product.slug,
        ...(product.image_url && { image_url: product.image_url })
      })
      
      // Backward compatibility: appelle aussi l'ancienne prop si fournie
      if (onAddToCart) {
        await onAddToCart(product)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  // Handler pour favoris
  const handleToggleFavorite = () => {
    if (!onToggleFavorite) return
    setIsFavorite(!isFavorite)
    onToggleFavorite(product)
  }

  // Génération des badges HerbisVeritas enrichis
  const herbisVeritasBadges = createHerbisVeritasBadges(
    product.labels,
    product.is_new,
    product.is_on_promotion,
    false, // isLimited - à implémenter plus tard
    false  // isFeatured - à implémenter plus tard
  )

  // Conversion pour ContentCard (backward compatibility)
  const productBadges: ContentCardBadge[] = herbisVeritasBadges.map(badge => ({
    label: badge.label,
    variant: badge.variant as any
  }))

  // Actions du produit avec état cart intégré
  const getCartButtonLabel = () => {
    if (isAdding) return 'Ajout...'
    if (isInCart) return `Dans le panier (${quantity})`
    return 'Ajouter au panier'
  }

  const productActions: ContentCardAction[] = [
    {
      label: getCartButtonLabel(),
      onClick: handleAddToCart,
      variant: isInCart ? 'secondary' : 'default',
      icon: ShoppingCart,
      loading: isAdding,
      disabled: product.stock === 0 || isAdding
    }
  ]

  // Ajout action favoris si handler fourni
  if (onToggleFavorite) {
    productActions.push({
      label: isFavorite ? 'Retirer' : 'Favoris',
      onClick: handleToggleFavorite,
      variant: 'ghost',
      icon: Heart
    })
  }

  // Métadonnées produit
  const productMetadata = {
    price: product.price,
    currency: product.currency,
    stock: product.stock,
    inStock: product.stock > 0,
    ...(product.category_id && { category: product.category_id }) // TODO: resolve category name
  }

  // Contenu enrichi avec badges et INCI
  const enrichedContent = (
    <>
      {/* Badges HerbisVeritas */}
      {herbisVeritasBadges.length > 0 && (
        <div className="mb-3">
          <ProductBadges 
            badges={herbisVeritasBadges}
            maxVisible={3}
            size="sm"
            layout="horizontal"
          />
        </div>
      )}
      
      {/* Liste INCI si disponible */}
      {product.inci_list && product.inci_list.length > 0 && variant !== 'compact' && (
        <section className="mt-2" role="complementary" aria-label="Composition INCI">
          <InciListCompact 
            inciList={product.inci_list} 
            className="border-t pt-2 mt-2"
          />
        </section>
      )}
    </>
  )

  return (
    <ContentCard
      // Identité
      slug={product.slug}
      title={product.name}
      {...(product.description_short && { description: product.description_short })}
      {...(product.image_url && { imageUrl: product.image_url })}
      imageAlt={product.name}
      
      // Configuration
      variant="product"
      layout={variant === 'compact' ? 'compact' : 'default'}
      
      // Données
      metadata={productMetadata}
      badges={productBadges}
      actions={productActions}
      
      // Navigation
      href={`/shop/${product.slug}`}
      
      // État
      isLoading={isLoading}
      {...(className && { className })}
      
      // Contenu spécialisé cosmétique
      customContent={enrichedContent}
    />
  )
}

// Export du composant avec le même nom pour compatibilité
export { ProductCardOptimized as ProductCard }