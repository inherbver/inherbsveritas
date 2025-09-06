'use client'

/**
 * @file ProductBadges - Badges spécialisés HerbisVeritas
 * @description Composant réutilisable pour afficher les badges de certification, origine et artisanat
 */

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Leaf, Award, MapPin, Users, Sparkles, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

// Types pour les badges
export type BadgeVariant = 
  | 'organic' 
  | 'handmade' 
  | 'local' 
  | 'certified'
  | 'new'
  | 'promo'
  | 'limited'
  | 'featured'

interface ProductBadge {
  id: string
  label: string
  variant: BadgeVariant
  icon?: React.ComponentType<{ className?: string | undefined }>
  priority?: number
}

interface ProductBadgesProps {
  badges: ProductBadge[]
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
  layout?: 'horizontal' | 'vertical' | 'grid'
  className?: string
}

// Configuration des variants de badges
const BADGE_CONFIG: Record<BadgeVariant, {
  className: string
  icon: React.ComponentType<{ className?: string | undefined }>
  priority: number
}> = {
  organic: {
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    icon: Leaf,
    priority: 1
  },
  certified: {
    className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    icon: Award,
    priority: 2
  },
  handmade: {
    className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
    icon: Users,
    priority: 3
  },
  local: {
    className: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
    icon: MapPin,
    priority: 4
  },
  new: {
    className: 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200',
    icon: Sparkles,
    priority: 5
  },
  promo: {
    className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
    icon: Tag,
    priority: 6
  },
  limited: {
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
    icon: Award,
    priority: 7
  },
  featured: {
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
    icon: Sparkles,
    priority: 8
  }
}

export function ProductBadges({
  badges,
  maxVisible = 4,
  size = 'md',
  layout = 'horizontal',
  className
}: ProductBadgesProps) {
  // Tri par priorité et limitation du nombre
  const sortedBadges = React.useMemo(() => {
    return badges
      .sort((a, b) => {
        const aPriority = BADGE_CONFIG[a.variant]?.priority || 999
        const bPriority = BADGE_CONFIG[b.variant]?.priority || 999
        return aPriority - bPriority
      })
      .slice(0, maxVisible)
  }, [badges, maxVisible])

  const sizeClasses = React.useMemo(() => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs'
      case 'lg':
        return 'px-4 py-2 text-sm'
      default:
        return 'px-3 py-1 text-xs'
    }
  }, [size])

  const layoutClasses = React.useMemo(() => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col gap-1'
      case 'grid':
        return 'grid grid-cols-2 gap-1'
      default:
        return 'flex flex-wrap gap-1'
    }
  }, [layout])

  if (sortedBadges.length === 0) {
    return null
  }

  return (
    <div 
      className={cn(layoutClasses, className)}
      role="group"
      aria-label="Badges de certification du produit"
    >
      {sortedBadges.map((badge) => {
        const config = BADGE_CONFIG[badge.variant]
        const Icon = badge.icon || config?.icon
        
        return (
          <Badge
            key={badge.id}
            variant="secondary"
            className={cn(
              sizeClasses,
              config?.className,
              'border font-medium transition-colors duration-200',
              'flex items-center gap-1 w-fit'
            )}
            title={`${badge.label} - Certification HerbisVeritas`}
          >
            {Icon && (
              <Icon 
                className={cn(
                  size === 'sm' ? 'w-3 h-3' : 
                  size === 'lg' ? 'w-4 h-4' : 
                  'w-3 h-3'
                )}
                aria-hidden="true"
              />
            )}
            <span>{badge.label}</span>
          </Badge>
        )
      })}
    </div>
  )
}

// Helper pour convertir les labels HerbisVeritas en badges
export function createHerbisVeritasBadges(
  labels?: string[],
  isNew?: boolean,
  isOnPromotion?: boolean,
  isLimited?: boolean,
  isFeatured?: boolean
): ProductBadge[] {
  const badges: ProductBadge[] = []

  // Badges basés sur les labels
  if (labels?.includes('organic_certified')) {
    badges.push({
      id: 'organic',
      label: 'Bio Certifié',
      variant: 'organic'
    })
  }

  if (labels?.includes('handmade')) {
    badges.push({
      id: 'handmade', 
      label: 'Artisanal',
      variant: 'handmade'
    })
  }

  if (labels?.includes('local_ingredients')) {
    badges.push({
      id: 'local',
      label: 'Origine Locale',
      variant: 'local'
    })
  }

  if (labels?.includes('herbis_veritas_certified')) {
    badges.push({
      id: 'certified',
      label: 'Certifié HV',
      variant: 'certified'
    })
  }

  // Badges d'état
  if (isNew) {
    badges.push({
      id: 'new',
      label: 'Nouveau',
      variant: 'new'
    })
  }

  if (isOnPromotion) {
    badges.push({
      id: 'promo',
      label: 'Promo',
      variant: 'promo'
    })
  }

  if (isLimited) {
    badges.push({
      id: 'limited',
      label: 'Série Limitée',
      variant: 'limited'
    })
  }

  if (isFeatured) {
    badges.push({
      id: 'featured',
      label: 'Coup de Cœur',
      variant: 'featured'
    })
  }

  return badges
}