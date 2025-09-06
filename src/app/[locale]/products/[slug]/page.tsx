/**
 * @file Page produit détail
 * @description Fiche produit complète avec INCI, labels, ajout panier
 */

import * as React from "react"
import { Metadata } from "next"
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ProductPageProps {
  params: { 
    locale: string
    slug: string 
  }
}


export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    // TODO: Implémenter getProductBySlug
    const productName = params.slug.replace(/-/g, ' ')
    
    return {
      title: `${productName} - HerbisVeritas`,
      description: `Découvrez ${productName}, cosmétique bio artisanal HerbisVeritas aux labels certifiés.`,
      openGraph: {
        title: `${productName} - HerbisVeritas`,
        description: `Cosmétique bio artisanal : ${productName}`,
        type: 'website'
      }
    }
  } catch {
    return {
      title: 'Produit - HerbisVeritas',
      description: 'Produit cosmétique bio artisanal HerbisVeritas'
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // TODO: Récupérer le produit par slug
  // const product = await productsService.getProductBySlug(params.slug)
  
  // Simulation données produit (à remplacer par vraie API)
  const mockProduct = {
    id: '1',
    slug: params.slug,
    name: params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: 'Cosmétique bio artisanal aux ingrédients naturels d\'Occitanie. Formulé selon nos standards HerbisVeritas pour une efficacité optimale et un respect de votre peau.',
    longDescription: `
      Ce produit emblématique de notre gamme HerbisVeritas combine tradition artisanale et innovation naturelle. 
      Chaque ingrédient est soigneusement sélectionné pour ses propriétés uniques et sa provenance responsable.
      
      Fabriqué dans notre atelier d'Occitanie selon des méthodes respectueuses de l'environnement, 
      ce produit porte nos labels de qualité les plus exigeants.
    `,
    price: 29.90,
    originalPrice: 35.90,
    unit: '50ml',
    stockQuantity: 15,
    images: [
      '/images/products/placeholder-1.jpg',
      '/images/products/placeholder-2.jpg'
    ],
    labels: ['BIO', 'NATUREL', 'ARTISANAL'],
    inciList: [
      'Aqua (Eau)',
      'Butyrospermum Parkii Butter* (Beurre de karité bio)',
      'Cocos Nucifera Oil* (Huile de coco bio)', 
      'Glycerin (Glycérine végétale)',
      'Lavandula Angustifolia Oil* (Huile essentielle de lavande bio)',
      'Tocopherol (Vitamine E)',
      'Benzyl Alcohol (Conservateur naturel)'
    ],
    benefits: [
      'Hydratation longue durée',
      'Apaise les peaux sensibles',
      'Parfum naturel de lavande',
      'Texture non grasse'
    ],
    usage: 'Appliquer matin et/ou soir sur peau propre et sèche. Masser délicatement jusqu\'à absorption complète.',
    category: 'Soins du visage',
    isAvailable: true
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          <a href={`/${params.locale}/shop`} className="hover:text-gray-700">Boutique</a>
          <span className="mx-2">›</span>
          <span>{mockProduct.category}</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{mockProduct.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images produit */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-lg">Image produit</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded border cursor-pointer hover:border-gray-400">
                </div>
              ))}
            </div>
          </div>

          {/* Informations produit */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{mockProduct.name}</h1>
              <p className="text-gray-600 text-lg">{mockProduct.description}</p>
            </div>

            {/* Labels */}
            <div className="flex flex-wrap gap-2">
              {mockProduct.labels.map((label) => (
                <Badge key={label} variant="secondary">
                  {label}
                </Badge>
              ))}
            </div>

            {/* Prix */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-green-600">
                {mockProduct.price.toFixed(2)}€
              </span>
              {mockProduct.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {mockProduct.originalPrice.toFixed(2)}€
                </span>
              )}
              <span className="text-gray-500">/ {mockProduct.unit}</span>
            </div>

            {/* Stock */}
            <div className="text-sm">
              {mockProduct.stockQuantity > 0 ? (
                <span className="text-green-600">✓ En stock ({mockProduct.stockQuantity} disponibles)</span>
              ) : (
                <span className="text-red-600">✗ Rupture de stock</span>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded">
                  <button className="px-3 py-2 hover:bg-gray-100">-</button>
                  <span className="px-4 py-2 border-x">1</span>
                  <button className="px-3 py-2 hover:bg-gray-100">+</button>
                </div>
                <Button 
                  size="lg" 
                  className="flex-1"
                  disabled={!mockProduct.isAvailable}
                >
                  Ajouter au panier
                </Button>
              </div>
              
              <Button variant="outline" size="lg" className="w-full">
                ♡ Ajouter aux favoris
              </Button>
            </div>

            {/* Bénéfices */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Bénéfices</h3>
                <ul className="space-y-2">
                  {mockProduct.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sections détaillées */}
        <div className="mt-16 space-y-8">
          {/* Description complète */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <div className="prose max-w-none">
                {mockProduct.longDescription.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-4 text-gray-700">
                      {paragraph.trim()}
                    </p>
                  )
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Liste INCI */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Composition (INCI)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mockProduct.inciList.map((ingredient, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    {ingredient}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                * Ingrédients issus de l&apos;agriculture biologique
              </p>
            </CardContent>
          </Card>

          {/* Utilisation */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Mode d&apos;emploi</h2>
              <p className="text-gray-700">{mockProduct.usage}</p>
            </CardContent>
          </Card>
        </div>

        {/* Produits suggérés */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-8">Vous aimerez aussi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map((i) => (
              <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded mb-3"></div>
                  <h3 className="font-medium mb-1">Produit similaire {i}</h3>
                  <p className="text-sm text-gray-600 mb-2">Description courte</p>
                  <p className="font-semibold text-green-600">24.90€</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}