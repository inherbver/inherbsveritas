/**
 * CartItemImage - Image produit avec variants
 */

'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { type CartItemImageProps } from './types'

export function CartItemImage({ 
  imageUrl, 
  name, 
  variant = 'default' 
}: CartItemImageProps) {
  // Configuration tailles par variant
  const sizeConfig = {
    compact: { 
      container: "w-12 h-12", 
      image: { width: 48, height: 48 } 
    },
    default: { 
      container: "w-16 h-16", 
      image: { width: 64, height: 64 } 
    },
    detailed: { 
      container: "w-20 h-20", 
      image: { width: 80, height: 80 } 
    }
  }

  const config = sizeConfig[variant]
  const fallbackUrl = '/placeholder-product.jpg'

  return (
    <div className={cn(
      "relative rounded-lg bg-muted overflow-hidden shrink-0",
      config.container
    )}>
      <Image
        src={imageUrl || fallbackUrl}
        alt={name}
        width={config.image.width}
        height={config.image.height}
        className="object-cover w-full h-full transition-transform hover:scale-105"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          if (target.src !== fallbackUrl) {
            target.src = fallbackUrl
          }
        }}
      />
    </div>
  )
}