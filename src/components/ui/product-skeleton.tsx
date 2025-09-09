import { Skeleton } from "./skeleton"

interface ProductSkeletonProps {
  variant?: "card" | "detail" | "grid"
}

export function ProductSkeleton({ variant = "card" }: ProductSkeletonProps) {
  if (variant === "detail") {
    return (
      <main className="space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image skeleton */}
          <div className="aspect-square">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>

          {/* Product info skeleton */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Labels skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>

            {/* Price skeleton */}
            <Skeleton className="h-8 w-32" />

            {/* Actions skeleton */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-12" />
                <Skeleton className="h-10 w-10" />
              </div>
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </section>

        {/* Tabs skeleton */}
        <div className="space-y-4">
          <div className="flex gap-4 border-b">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </main>
    )
  }

  if (variant === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} variant="card" />
        ))}
      </div>
    )
  }

  // Card variant (default)
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      {/* Image skeleton */}
      <div className="aspect-square">
        <Skeleton className="h-full w-full rounded-md" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Labels skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-16" />
      </div>

      {/* Price skeleton */}
      <Skeleton className="h-6 w-20" />

      {/* Action skeleton */}
      <Skeleton className="h-9 w-full" />
    </div>
  )
}

export function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 py-4">
          {/* Image skeleton */}
          <Skeleton className="h-16 w-16 rounded-md" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Controls skeleton */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>

          {/* Price skeleton */}
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4 ml-auto" />
          </div>
        </div>
      ))}

      {/* Total skeleton */}
      <div className="border-t pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}