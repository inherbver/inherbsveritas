'use client'

/**
 * @file ProductCardImage - Image et overlay du product card
 */

import * as React from "react"
import Image from "next/image"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProductCardImageProps {
  product: {
    id: string
    name: string
    image_url?: string
  }
  isOutOfStock: boolean
  isNew: boolean
  isOnPromotion: boolean
  isFavorite: boolean
  onToggleFavorite?: ((e: React.MouseEvent) => void) | undefined
  showFavoriteButton?: boolean
}

export function ProductCardImage({ 
  product, 
  isOutOfStock, 
  isNew, 
  isOnPromotion, 
  isFavorite, 
  onToggleFavorite,
  showFavoriteButton = true
}: ProductCardImageProps) {
  return (
    <figure className="aspect-square relative overflow-hidden bg-gray-100">
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          itemProp="image"
        />
      ) : (
        <aside className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Aucune image</span>
        </aside>
      )}

      {/* Badges overlay en haut à droite */}
      <aside className="absolute top-2 right-2 flex flex-col gap-1" role="complementary">
        {isNew && (
          <Badge variant="destructive" className="text-xs">
            Nouveau
          </Badge>
        )}
        {isOnPromotion && (
          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
            Promo
          </Badge>
        )}
      </aside>

      {/* Action favoris en haut à gauche */}
      {showFavoriteButton && onToggleFavorite && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
          onClick={onToggleFavorite}
        >
          <Heart 
            className={cn(
              "w-4 h-4",
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
            )}
          />
        </Button>
      )}

      {/* Indicateur rupture de stock */}
      {isOutOfStock && (
        <aside className="absolute inset-0 bg-black/50 flex items-center justify-center" role="alert">
          <Badge variant="destructive" className="text-sm">
            Rupture de stock
          </Badge>
        </aside>
      )}
    </figure>
  )
}