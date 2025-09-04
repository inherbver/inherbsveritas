import { ProductCardSkeleton } from './product-card-skeleton'

interface ProductGridSkeletonProps {
  count?: number
  className?: string
}

export function ProductGridSkeleton({ count = 8, className }: ProductGridSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className || ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  )
}