'use client'

/**
 * ProductCard Optimisé - Wrapper ContentCard
 * 
 * Version optimisée utilisant le ContentCard générique
 * Réduit de ~180 lignes à ~80 lignes (-57% code)
 * Compatible avec l'API existante ProductCardProps
 */

import * as React from "react"
import { ShoppingCart, Heart } from "lucide-react"
import { ContentCard, type ContentCardBadge, type ContentCardAction } from "@/components/ui/content-card"
import { InciListCompact } from "@/components/ui/inci-list"
import { ProductCardProps } from "@/types/product"
import { LABEL_DISPLAY, LABEL_BADGE_VARIANTS } from "@/types/product"

export function ProductCardOptimized({
  product,
  onAddToCart,
  onToggleFavorite,
  variant = 'default',
  className,
  isLoading = false,
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)
  const [isFavorite, setIsFavorite] = React.useState(false)

  // Handler pour ajout au panier avec optimistic updates
  const handleAddToCart = async () => {
    if (!onAddToCart || isAddingToCart || product.stock === 0) return
    
    setIsAddingToCart(true)
    try {
      await onAddToCart(product)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Handler pour favoris
  const handleToggleFavorite = () => {
    if (!onToggleFavorite) return
    setIsFavorite(!isFavorite)
    onToggleFavorite(product)
  }

  // Conversion des labels HerbisVeritas en badges
  const productBadges: ContentCardBadge[] = product.labels.map(label => ({
    label: LABEL_DISPLAY[label],
    variant: LABEL_BADGE_VARIANTS[label] as any
  }))

  // Ajout des badges d'état
  if (product.is_new) {
    productBadges.push({ label: 'Nouveau', variant: 'new' })
  }
  if (product.is_on_promotion) {
    productBadges.push({ label: 'Promo', variant: 'promo' })
  }

  // Actions du produit
  const productActions: ContentCardAction[] = [
    {
      label: isAddingToCart ? 'Ajout...' : 'Ajouter au panier',
      onClick: handleAddToCart,
      variant: 'default',
      icon: ShoppingCart,
      loading: isAddingToCart,
      disabled: product.stock === 0 || isAddingToCart
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

  // Contenu personnalisé INCI (spécificité cosmétique)
  const inciContent = product.inci_list && product.inci_list.length > 0 && variant !== 'compact' ? (
    <section className="mt-2" role="complementary" aria-label="Composition INCI">
      <InciListCompact 
        inciList={product.inci_list} 
        className="border-t pt-2 mt-2"
      />
    </section>
  ) : null

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
      customContent={inciContent}
    />
  )
}

// Export du composant avec le même nom pour compatibilité
export { ProductCardOptimized as ProductCard }