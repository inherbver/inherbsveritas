/**
 * Product Card Wrapper Component
 * 
 * Responsive card wrapper with mobile/desktop link behavior
 */

import * as React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CardWrapperProps {
  productSlug: string
  variant?: 'default' | 'compact'
  className?: string
  children: React.ReactNode
}

export function CardWrapper({ productSlug, variant = 'default', className, children }: CardWrapperProps) {
  if (variant === 'compact') {
    return (
      <Card className={cn("group overflow-hidden transition-all hover:shadow-lg max-w-sm", className)}>
        {children}
      </Card>
    )
  }
  
  return (
    <Card className={cn("group overflow-hidden transition-all hover:shadow-lg md:cursor-auto", className)}>
      {/* Mobile: Card entière cliquable */}
      <Link href={`/products/${productSlug}`} className="block md:hidden">
        <div className="md:pointer-events-none">
          {children}
        </div>
      </Link>
      {/* Desktop: Éléments individuellement cliquables */}
      <div className="hidden md:block">
        {children}
      </div>
    </Card>
  )
}