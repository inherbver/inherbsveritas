/**
 * @file Page catalogue boutique - Semaine 4 MVP
 * @description Frontend catalogue avec CategoryNavigation + ProductGrid intégré ContentCard
 */

import * as React from "react"
import { Suspense } from "react"
import { Metadata } from "next"
import { CategoriesService } from '@/lib/categories/categories-service'
import { ProductsService } from '@/lib/products/products-service'
import { ContentGrid } from '@/components/ui/content-grid'
import { ProductCard } from '@/components/products/product-card-optimized'
import { ProductFilters } from '@/components/shop/product-filters'
import { HeroSection } from '@/components/shop/hero-section'
import { TrustIndicators } from '@/components/shop/trust-indicators'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const categoriesService = new CategoriesService()
const productsService = new ProductsService()

interface ShopPageProps {
  params: { locale: string }
  searchParams: { 
    category?: string
    search?: string
    page?: string
    labels?: string
  }
}

export async function generateMetadata(): Promise<Metadata> {
  // Landing page principale - Metadata optimisés SEO
  return {
    title: 'HerbisVeritas - Cosmétiques Bio Artisanaux d\'Occitanie',
    description: 'Boutique officielle HerbisVeritas. Découvrez nos cosmétiques bio artisanaux aux labels certifiés. Produits naturels d\'Occitanie, savoir-faire traditionnel.',
    keywords: 'cosmétiques bio, artisanal, HerbisVeritas, Occitanie, naturel, labels bio',
    openGraph: {
      title: 'HerbisVeritas - Cosmétiques Bio Artisanaux',
      description: 'Boutique officielle de cosmétiques bio artisanaux d\'Occitanie',
      type: 'website',
      siteName: 'HerbisVeritas'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HerbisVeritas - Cosmétiques Bio Artisanaux',
      description: 'Boutique officielle de cosmétiques bio artisanaux d\'Occitanie'
    }
  }
}


// Composant principal de la page boutique
async function ShopPageContent({ params, searchParams }: { params: ShopPageProps['params'], searchParams: ShopPageProps['searchParams'] }) {
  // Récupération des données côté serveur
  const [categories, allProducts] = await Promise.all([
    categoriesService.getCategoryHierarchy(),
    productsService.getAllProducts()
  ])

  // Filtrage des produits selon les paramètres
  let filteredProducts = allProducts

  if (searchParams.category) {
    filteredProducts = filteredProducts.filter(
      product => product.category_id === searchParams.category
    )
  }

  if (searchParams.search) {
    const searchTerm = searchParams.search.toLowerCase()
    filteredProducts = filteredProducts.filter(
      product => {
        const name = product.translations[params.locale]?.name || product.translations['fr']?.name || ''
        const description = product.translations[params.locale]?.description || product.translations['fr']?.description || ''
        return name.toLowerCase().includes(searchTerm) ||
               description.toLowerCase().includes(searchTerm)
      }
    )
  }

  if (searchParams.labels) {
    const selectedLabels = searchParams.labels.split(',')
    filteredProducts = filteredProducts.filter(
      product => selectedLabels.some(label => product.labels?.includes(label as any))
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Hero Section */}
      <HeroSection locale={params.locale} />

      {/* Main Shop Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation & Filtres */}
          <aside className="lg:col-span-1">
            <ProductFilters
              categories={categories}
              selectedCategoryId={searchParams.category}
              selectedLabels={(searchParams.labels?.split(',') as any) || []}
              searchTerm={searchParams.search || ''}
            />
          </aside>

          {/* Grille produits principale */}
          <main className="lg:col-span-3">
            <header className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {params.locale === 'en' ? 'Our Products' : 'Nos Produits'}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} 
                    {searchParams.category && ' dans cette catégorie'}
                    {searchParams.search && ` pour "${searchParams.search}"`}
                  </p>
                </div>
                
                {/* Trust indicators inline */}
                <div className="hidden md:block">
                  <TrustIndicators 
                    variant="inline" 
                    maxItems={3}
                    locale={params.locale}
                  />
                </div>
              </div>
            </header>

            {/* ContentGrid avec ProductCard optimisé */}
            <ContentGrid
              variant="product"
              items={filteredProducts}
              renderItem={(product) => (
                <ProductCard
                  key={product.id}
                  product={product as any}
                  onAddToCart={async (product) => {
                    // Action panier sera ajoutée Semaine 5
                    console.log('Add to cart:', product.name)
                  }}
                  variant="default"
                />
              )}
              columns={{
                default: 1,
                sm: 2, 
                md: 2,
                lg: 3,
                xl: 4
              }}
              gap="lg"
              emptyMessage={params.locale === 'en' 
                ? "No products match your criteria" 
                : "Aucun produit ne correspond à vos critères"
              }
              allowViewToggle={false}
            />

            {/* Trust indicators section mobile */}
            <div className="md:hidden mt-8">
              <TrustIndicators 
                variant="compact"
                maxItems={4}
                locale={params.locale}
                className="space-y-4"
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// Skeleton pour le loading
function ShopPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
        <main className="lg:col-span-3">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

// Page principale avec Suspense
export default function ShopPage({ params, searchParams }: ShopPageProps) {
  return (
    <Suspense fallback={<ShopPageSkeleton />}>
      <ShopPageContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}