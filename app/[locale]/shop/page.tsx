import { Suspense } from 'react'
import { ProductGrid } from '@/components/modules/boutique/components/product-grid'
import { Spinner } from '@/components/ui/spinner'

export default function ShopPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* En-tête de la boutique */}
      <header className="text-center mb-12">
        <h1 className="font-serif text-4xl font-bold text-dark dark:text-white mb-4">
          Boutique HerbisVeritas
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez notre collection de cosmétiques bio artisanaux, 
          élaborés avec des plantes cultivées et récoltées à la main en Occitanie.
        </p>
      </header>

      {/* Grille de produits avec Suspense */}
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Chargement des produits...</p>
          </div>
        </div>
      }>
        <ProductGrid />
      </Suspense>
    </main>
  )
}

export const metadata = {
  title: 'Boutique | HerbisVeritas - Cosmétiques Bio Artisanaux',
  description: 'Découvrez nos cosmétiques bio artisanaux aux 7 labels HerbisVeritas. Produits naturels récoltés à la main en Occitanie.',
  openGraph: {
    title: 'Boutique HerbisVeritas',
    description: 'Cosmétiques bio artisanaux aux 7 labels HerbisVeritas',
    type: 'website'
  }
}