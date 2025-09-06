'use client'

/**
 * @file HeroSection - Section Hero pour boutique HerbisVeritas
 * @description Inspiré de PranaFoods, adapté à l'identité artisanale d'Occitanie
 * Phase MVP: Section hero avec labels certifiés et valeurs artisanales
 */

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Award, MapPin, Users } from "lucide-react"

interface HeroSectionProps {
  className?: string
  locale?: string
}

// Labels HerbisVeritas définis dans le plan MVP
const HERBIS_VERITAS_LABELS = [
  { key: 'organic_certified', label: 'Bio Certifié', icon: Leaf, color: 'bg-green-100 text-green-800' },
  { key: 'handmade', label: 'Artisanal', icon: Users, color: 'bg-amber-100 text-amber-800' },
  { key: 'local_ingredients', label: 'Ingrédients Locaux', icon: MapPin, color: 'bg-blue-100 text-blue-800' },
  { key: 'tradition', label: 'Savoir-faire Traditionnel', icon: Award, color: 'bg-purple-100 text-purple-800' }
] as const

export function HeroSection({ className, locale = 'fr' }: HeroSectionProps) {
  const content = React.useMemo(() => {
    if (locale === 'en') {
      return {
        title: 'HerbisVeritas - Artisanal Organic Cosmetics from Occitanie',
        subtitle: 'Certified labels - Traditional craftsmanship - Local ingredients',
        description: 'Discover our authentic organic cosmetics, handcrafted by passionate artisans in the heart of Occitanie. Each product carries our certified HerbisVeritas labels, guaranteeing quality, traceability and respect for traditional know-how.',
        cta: 'Explore Our Products',
        labelsTitle: 'Our Certifications'
      }
    }
    
    return {
      title: 'HerbisVeritas - Cosmétiques Bio Artisanaux d\'Occitanie',
      subtitle: 'Labels certifiés - Savoir-faire traditionnel - Ingrédients locaux',
      description: 'Découvrez nos cosmétiques bio authentiques, façonnés à la main par des artisans passionnés au cœur de l\'Occitanie. Chaque produit porte nos labels HerbisVeritas certifiés, garantie de qualité, traçabilité et respect du savoir-faire ancestral.',
      cta: 'Découvrir nos Produits',
      labelsTitle: 'Nos Certifications'
    }
  }, [locale])

  return (
    <section 
      className={`relative overflow-hidden ${className || ''}`}
      role="banner"
      aria-label="HerbisVeritas - Présentation boutique"
    >
      {/* Hero principal avec gradient naturel */}
      <article className="relative bg-gradient-to-br from-green-50 via-amber-50 to-orange-50 py-12 px-6 lg:px-8">
        {/* Motif décoratif subtil */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
          aria-hidden="true"
        />
        
        <div className="relative container mx-auto max-w-4xl text-center">
          <header className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {content.title}
            </h1>
            <p className="text-xl lg:text-2xl text-gray-700 mb-6 font-medium">
              {content.subtitle}
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {content.description}
            </p>
          </header>

          {/* Labels HerbisVeritas */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {content.labelsTitle}
            </h2>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {HERBIS_VERITAS_LABELS.map(({ key, label, icon: Icon, color }) => (
                <Badge 
                  key={key}
                  variant="secondary"
                  className={`${color} px-4 py-2 text-sm font-medium border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-default`}
                >
                  <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                  {label}
                </Badge>
              ))}
            </div>
          </section>
        </div>
      </article>

      {/* Section valeurs artisanales */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {locale === 'en' ? '100% Natural' : '100% Naturel'}
                </h3>
                <p className="text-sm text-gray-600">
                  {locale === 'en' 
                    ? 'Ingredients sourced from Occitanie organic agriculture'
                    : 'Ingrédients issus de l\'agriculture bio d\'Occitanie'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {locale === 'en' ? 'Artisan Made' : 'Fait Artisan'}
                </h3>
                <p className="text-sm text-gray-600">
                  {locale === 'en' 
                    ? 'Handcrafted in small batches by passionate craftspeople'
                    : 'Façonné à la main en petites séries par des artisans passionnés'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {locale === 'en' ? 'HerbisVeritas Certified' : 'Certifié HerbisVeritas'}
                </h3>
                <p className="text-sm text-gray-600">
                  {locale === 'en' 
                    ? 'Our 7 quality and traceability labels guarantee'
                    : 'Nos 7 labels de qualité et traçabilité en garantie'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </section>
  )
}