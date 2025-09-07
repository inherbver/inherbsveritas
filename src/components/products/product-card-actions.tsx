'use client'

/**
 * @file ProductCardActions - Actions du product card (bouton panier)
 */

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CartButtonState {
  label: string
  disabled: boolean
  variant: 'default' | 'secondary'
}

interface ProductCardActionsProps {
  product: {
    id: string
    name: string
    price: number
    labels?: any[]
    slug: string
    image_url?: string
  }
  cartButtonState: CartButtonState
  onAddToCart: (e: React.MouseEvent) => Promise<void>
}

export function ProductCardActions({ 
  product, 
  cartButtonState, 
  onAddToCart 
}: ProductCardActionsProps) {
  return (
    <footer className="p-4 pt-0">
      <Button
        variant={cartButtonState.variant}
        size="sm"
        className="w-full"
        disabled={cartButtonState.disabled}
        onClick={onAddToCart}
        aria-label={`${cartButtonState.label} - ${product.name}`}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {cartButtonState.label}
      </Button>
    </footer>
  )
}