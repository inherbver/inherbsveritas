'use client'

import React from 'react'
import { ProductGrid } from '@/components/collections'
import { useCart } from '@/components/modules/boutique/hooks'
import { EnhancedProductCard as ProductCard } from '@/components/products/enhanced-product-card'
import { Product } from '@/types/product'
import { Button } from '@/components/ui'
import { toast } from 'react-hot-toast'

// Mock data pour la démo
const mockProducts: Product[] = [
  {
    id: '1',
    slug: 'huile-lavande-bio',
    name: 'Huile essentielle de lavande bio',
    description_short: 'Huile essentielle bio de lavande vraie, distillée en Provence.',
    price: 15.99,
    currency: 'EUR',
    stock: 10,
    unit: '10ml',
    image_url: '/images/demo/lavande.jpg',
    labels: ['bio', 'origine_occitanie'],
    status: 'active',
    is_active: true,
    is_new: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    slug: 'savon-miel-propolis',
    name: 'Savon au miel et propolis',
    description_short: 'Savon artisanal enrichi au miel local et propolis.',
    price: 8.50,
    currency: 'EUR',
    stock: 3,
    unit: '100g',
    image_url: '/images/demo/savon.jpg',
    labels: ['recolte_main', 'partenariat_producteurs'],
    status: 'active',
    is_active: true,
    is_new: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    slug: 'hydrolat-rose',
    name: 'Hydrolat de rose de Damas',
    description_short: 'Eau florale pure de rose de Damas, idéale pour tous types de peau.',
    price: 22.90,
    currency: 'EUR',
    stock: 0,
    unit: '200ml',
    labels: ['essence_precieuse', 'rituel_bien_etre'],
    status: 'active',
    is_active: true,
    is_new: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    slug: 'creme-calendula',
    name: 'Crème réparatrice au calendula',
    description_short: 'Crème apaisante et réparatrice formulée avec du calendula bio.',
    price: 18.75,
    currency: 'EUR',
    stock: 7,
    unit: '50ml',
    image_url: '/images/demo/creme.jpg',
    labels: ['bio', 'recolte_main', 'origine_occitanie'],
    status: 'active',
    is_active: true,
    is_new: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export function BoutiqueDemo() {
  const { itemsCount, total, addItem, clearCart } = useCart()

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product)
    } catch (error) {
      // Error already handled in useCart hook
    }
  }

  const handleToggleFavorite = (product: Product) => {
    toast.success(`${product.name} ${Math.random() > 0.5 ? 'ajouté aux' : 'retiré des'} favoris`)
  }

  return (
    <div className="space-y-8 p-6">
      {/* Demo Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Démo Composants Boutique MVP</h1>
        <p className="text-muted-foreground mb-4">
          Infrastructure UI shadcn/ui + Composants métier HerbisVeritas
        </p>
        
        {/* Cart Summary */}
        <div className="bg-muted p-4 rounded-lg inline-block">
          <p className="font-medium">
            Panier: {itemsCount} article{itemsCount !== 1 ? 's' : ''} - {total.toFixed(2)} €
          </p>
          {itemsCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCart}
              className="mt-2"
            >
              Vider le panier
            </Button>
          )}
        </div>
      </div>

      {/* ProductCard Single Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">ProductCard - Variantes</h2>
        
        <div className="space-y-6">
          {/* Default variant */}
          <div>
            <h3 className="text-lg font-medium mb-3">Variant Default</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ProductCard
                product={mockProducts[0]!}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
              />
              <ProductCard
                product={mockProducts[2]!} // Out of stock
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>

          {/* Compact variant */}
          <div>
            <h3 className="text-lg font-medium mb-3">Variant Compact</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {mockProducts.slice(0, 3).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="compact"
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>

          {/* Loading state */}
          <div>
            <h3 className="text-lg font-medium mb-3">État de Chargement</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ProductCard
                  key={i}
                  product={{} as Product}
                  isLoading={true}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ProductGrid Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">ProductGrid - Collection</h2>
        
        <div className="space-y-6">
          {/* Normal grid */}
          <div>
            <h3 className="text-lg font-medium mb-3">Grille Complète</h3>
            <ProductGrid products={mockProducts} />
          </div>

          {/* Empty state */}
          <div>
            <h3 className="text-lg font-medium mb-3">État Vide</h3>
            <ProductGrid products={mockProducts} />
          </div>

          {/* Error state */}
          <div>
            <h3 className="text-lg font-medium mb-3">État d&apos;Erreur</h3>
            <ProductGrid products={mockProducts} />
          </div>

          {/* Loading state */}
          <div>
            <h3 className="text-lg font-medium mb-3">État de Chargement</h3>
            <ProductGrid products={mockProducts} />
          </div>
        </div>
      </section>

      {/* Labels Showcase */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Labels HerbisVeritas</h2>
        <div className="bg-muted p-6 rounded-lg">
          <p className="text-sm text-muted-foreground mb-4">
            Les 7 labels métier intégrés dans les badges avec couleurs dédiées :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Labels Qualité :</strong>
              <ul className="mt-2 space-y-1">
                <li>• <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Bio</span> - Certification biologique</li>
                <li>• <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">Récolté à la main</span> - Cueillette artisanale</li>
                <li>• <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Origine Occitanie</span> - Terroir local</li>
              </ul>
            </div>
            <div>
              <strong>Labels Expertise :</strong>
              <ul className="mt-2 space-y-1">
                <li>• <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Partenariat producteurs</span> - Circuit court</li>
                <li>• <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">Rituel bien-être</span> - Usage spécialisé</li>
                <li>• <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">Essence précieuse</span> - Rareté</li>
                <li>• <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Rupture de récolte</span> - Disponibilité limitée</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}