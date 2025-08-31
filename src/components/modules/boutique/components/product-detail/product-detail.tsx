'use client'

/**
 * Product Detail Component - HerbisVeritas V2 MVP
 * 
 * Main product detail component composed of modular sections
 * Refactored from 396-line monolith for maintainability
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Product } from "@/types/product"
import { ProductImage } from './product-image'
import { ProductHeader } from './product-header'
import { AddToCart } from './add-to-cart'
import { ProductTabs } from './product-tabs'
import { ProductSections } from './product-sections'
import { useTabAutoScroll } from './hooks'

export interface ProductDetailProps {
  product: Product
  onAddToCart?: (product: Product, quantity: number) => Promise<void>
  className?: string
}

export function ProductDetail({
  product,
  onAddToCart,
  className
}: ProductDetailProps) {
  const [quantity, setQuantity] = React.useState(1)
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)
  const { activeTab, setActiveTab, handleTabClick } = useTabAutoScroll()

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + delta))
    setQuantity(newQuantity)
  }

  const handleAddToCart = async () => {
    if (!onAddToCart || isAddingToCart) return
    
    setIsAddingToCart(true)
    try {
      await onAddToCart(product, quantity)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <article 
      className={cn("max-w-7xl mx-auto", className)}
      itemScope 
      itemType="https://schema.org/Product"
    >
      {/* Layout 2 colonnes MD+ / Stack vertical mobile */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <ProductImage imageUrl={product.image_url} productName={product.name} />
        
        <section className="space-y-6">
          <ProductHeader product={product} formatPrice={formatPrice} />
          
          <AddToCart
            product={product}
            quantity={quantity}
            isAddingToCart={isAddingToCart}
            onQuantityChange={handleQuantityChange}
            onQuantitySet={setQuantity}
            onAddToCart={handleAddToCart}
          />
        </section>
      </main>

      {/* Sections détaillées avec onglets */}
      <section className="space-y-8">
        <ProductTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onTabClick={handleTabClick}
        />
        
        <ProductSections product={product} />
      </section>
    </article>
  )
}