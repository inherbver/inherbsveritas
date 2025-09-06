'use client'

/**
 * @file TrustIndicators - Éléments de confiance bio/artisanal HerbisVeritas
 * @description Composant pour afficher les garanties, certifications et éléments de confiance
 */

import * as React from "react"
import { Shield, Award, Heart, Truck, RotateCcw, Leaf } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TrustIndicator {
  id: string
  icon: React.ComponentType<{ className?: string | undefined }>
  title: string
  description: string
  badge?: string
  priority: number
}

interface TrustIndicatorsProps {
  variant?: 'full' | 'compact' | 'inline'
  maxItems?: number
  showBadges?: boolean
  className?: string
  locale?: string
}

// Configuration des indicateurs de confiance HerbisVeritas
const TRUST_INDICATORS: Record<string, TrustIndicator[]> = {
  fr: [
    {
      id: 'bio-certified',
      icon: Leaf,
      title: 'Certifié Bio',
      description: 'Tous nos produits sont certifiés agriculture biologique selon les standards européens.',
      badge: 'AB',
      priority: 1
    },
    {
      id: 'handmade-quality',
      icon: Heart,
      title: 'Qualité Artisanale',
      description: 'Fabrication traditionnelle à la main par nos artisans partenaires d\'Occitanie.',
      badge: 'Artisanal',
      priority: 2
    },
    {
      id: 'local-ingredients',
      icon: Award,
      title: 'Ingrédients Locaux',
      description: 'Approvisionnement direct auprès des producteurs locaux de notre région.',
      badge: 'Local',
      priority: 3
    },
    {
      id: 'quality-guarantee',
      icon: Shield,
      title: 'Garantie Qualité',
      description: 'Labels HerbisVeritas : traçabilité complète de la récolte au produit fini.',
      badge: 'HerbisVeritas',
      priority: 4
    },
    {
      id: 'free-shipping',
      icon: Truck,
      title: 'Livraison Offerte',
      description: 'Livraison gratuite dès 45€ d\'achat, emballage écologique recyclable.',
      badge: 'Gratuite dès 45€',
      priority: 5
    },
    {
      id: 'satisfaction-guarantee',
      icon: RotateCcw,
      title: 'Satisfait ou Remboursé',
      description: '30 jours pour tester nos produits. Retour gratuit si vous n\'êtes pas satisfait.',
      badge: '30 jours',
      priority: 6
    }
  ],
  en: [
    {
      id: 'bio-certified',
      icon: Leaf,
      title: 'Organic Certified',
      description: 'All our products are certified organic according to European standards.',
      badge: 'Organic',
      priority: 1
    },
    {
      id: 'handmade-quality',
      icon: Heart,
      title: 'Artisan Quality',
      description: 'Traditional handcrafted manufacturing by our partner artisans from Occitanie.',
      badge: 'Handmade',
      priority: 2
    },
    {
      id: 'local-ingredients',
      icon: Award,
      title: 'Local Ingredients',
      description: 'Direct sourcing from local producers in our region.',
      badge: 'Local',
      priority: 3
    },
    {
      id: 'quality-guarantee',
      icon: Shield,
      title: 'Quality Guarantee',
      description: 'HerbisVeritas labels: complete traceability from harvest to finished product.',
      badge: 'HerbisVeritas',
      priority: 4
    },
    {
      id: 'free-shipping',
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free delivery from €45 purchase, recyclable eco-friendly packaging.',
      badge: 'Free from €45',
      priority: 5
    },
    {
      id: 'satisfaction-guarantee',
      icon: RotateCcw,
      title: 'Satisfaction Guarantee',
      description: '30 days to test our products. Free return if you are not satisfied.',
      badge: '30 days',
      priority: 6
    }
  ]
}

export function TrustIndicators({
  variant = 'full',
  maxItems = 6,
  showBadges = true,
  className,
  locale = 'fr'
}: TrustIndicatorsProps) {
  const indicators = TRUST_INDICATORS[locale] || TRUST_INDICATORS['fr']
  const displayedIndicators = (indicators || [])
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxItems)

  if (variant === 'inline') {
    return (
      <div 
        className={cn("flex flex-wrap gap-2", className)}
        role="group"
        aria-label="Garanties et certifications HerbisVeritas"
      >
        {displayedIndicators.map(({ id, icon: Icon, badge }) => (
          <Badge 
            key={id}
            variant="outline" 
            className="px-3 py-1 text-xs font-medium bg-white/80"
          >
            <Icon className="w-3 h-3 mr-1" />
            {badge}
          </Badge>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div 
        className={cn("space-y-3", className)}
        role="region"
        aria-label="Éléments de confiance"
      >
        {displayedIndicators.map(({ id, icon: Icon, title, badge }) => (
          <div key={id} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900">{title}</p>
              {showBadges && badge && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {badge}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div 
      className={cn("grid gap-4", className)}
      style={{ 
        gridTemplateColumns: `repeat(auto-fit, minmax(${variant === 'full' ? '280px' : '240px'}, 1fr))` 
      }}
      role="region"
      aria-label="Garanties et certifications HerbisVeritas"
    >
      {displayedIndicators.map(({ id, icon: Icon, title, description, badge }) => (
        <Card 
          key={id} 
          className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-gray-50/50"
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
                  {showBadges && badge && (
                    <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                      {badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Composant spécialisé pour l'affichage en footer/bas de page
export function TrustIndicatorsFooter({ 
  className,
  locale = 'fr'
}: {
  className?: string
  locale?: string
}) {
  return (
    <section 
      className={cn("bg-gray-50 py-8", className)}
      aria-label="Nos engagements qualité"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {locale === 'en' ? 'Our Quality Commitments' : 'Nos Engagements Qualité'}
          </h2>
          <p className="text-sm text-gray-600">
            {locale === 'en' 
              ? 'HerbisVeritas certified cosmetics, artisanal quality guaranteed'
              : 'Cosmétiques certifiés HerbisVeritas, qualité artisanale garantie'
            }
          </p>
        </div>
        <TrustIndicators 
          variant="compact"
          maxItems={4}
          showBadges={false}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
          locale={locale}
        />
      </div>
    </section>
  )
}