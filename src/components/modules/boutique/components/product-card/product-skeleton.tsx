/**
 * Product Card Skeleton Component
 * 
 * Loading state placeholder
 */

import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/5] bg-muted animate-pulse" />
      <CardContent className="p-4">
        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 bg-muted rounded animate-pulse w-3/4 mb-2" />
        <div className="h-5 bg-muted rounded animate-pulse w-1/2" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="h-10 bg-muted rounded animate-pulse w-full" />
      </CardFooter>
    </Card>
  )
}