'use client'

import * as React from "react"
import { ProductCard } from "../product-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { Product, ProductFilters } from "@/types/product"

export interface ProductGridProps {
  /** Array of products to display */
  products: Product[]
  /** Loading state */
  isLoading?: boolean
  /** Error state */
  error?: string | null
  /** Callback when adding product to cart */
  onAddToCart?: (product: Product) => Promise<void>
  /** Callback when toggling product favorite */
  onToggleFavorite?: (product: Product) => void
  /** Custom className */
  className?: string
  /** Grid columns configuration */
  columns?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  /** Empty state message */
  emptyMessage?: string
}

export function ProductGrid({
  products,
  isLoading = false,
  error,
  onAddToCart,
  onToggleFavorite,
  className,
  columns = { default: 1, sm: 2, md: 3, lg: 4 },
  emptyMessage = "Aucun produit trouvé"
}: ProductGridProps) {
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return <ProductGridSkeleton columns={columns} className={className} />
  }

  if (products.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="mx-auto w-24 h-24 bg-muted rounded-lg flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Essayez de modifier vos critères de recherche ou explorez nos autres catégories.
        </p>
      </div>
    )
  }

  const gridClasses = cn(
    "grid gap-6",
    // Responsive grid classes based on columns prop
    `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    className
  )

  return (
    <div className={gridClasses}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}

interface ProductGridSkeletonProps {
  columns?: ProductGridProps['columns']
  className?: string
  count?: number
}

function ProductGridSkeleton({ 
  columns = { default: 1, sm: 2, md: 3, lg: 4 }, 
  className,
  count = 8 
}: ProductGridSkeletonProps) {
  const gridClasses = cn(
    "grid gap-6",
    `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    className
  )

  return (
    <div className={gridClasses}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCard
          key={`skeleton-${index}`}
          product={{} as Product}
          isLoading={true}
        />
      ))}
    </div>
  )
}