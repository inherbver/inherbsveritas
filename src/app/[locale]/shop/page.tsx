/**
 * @file Page catalogue boutique - Semaine 4 MVP
 * @description Frontend catalogue avec CategoryNavigation + ProductGrid intégré ContentCard
 */

import * as React from "react"
import { Suspense } from "react"
import { Metadata } from "next"
import { getTranslations } from 'next-intl/server'
import { CategoriesService } from '@/lib/categories/categories-service'
import { ProductsService } from '@/lib/products/products-service'
import { ContentGrid } from '@/components/ui/content-grid'
import { ProductCard } from '@/components/products/product-card-optimized'
import { ProductFilters } from '@/components/shop/product-filters'
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

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'shop' })
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      type: 'website'
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Boutique</h1>
            <p className="text-gray-600">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} 
              {searchParams.category && ' dans cette catégorie'}
              {searchParams.search && ` pour "${searchParams.search}"`}
            </p>
          </div>

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
            emptyMessage="Aucun produit ne correspond à vos critères"
            allowViewToggle={false}
          />
        </main>
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