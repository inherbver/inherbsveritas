import { setRequestLocale } from 'next-intl/server'
import { Suspense } from "react"
import { HeroSection } from "@/components/shop/hero-section"
import { TrustIndicators } from "@/components/shop/trust-indicators"
import { ProductGrid } from "@/components/collections"
import { Loader } from "@/components/common/loader"
import { createClient } from '@/lib/supabase/server'
import type { Product as DatabaseProduct } from '@/types/database'
import type { Product } from '@/types/product'

// Map database product to application product type
function mapDatabaseProducts(dbProducts: DatabaseProduct[], locale: string = 'fr'): Product[] {
  return dbProducts.map(dbProduct => {
    const translationsData = dbProduct.translations || {}
    const fallbackLocale = Object.keys(translationsData)[0] || 'fr'
    const translations = translationsData[locale] || translationsData['fr'] || translationsData[fallbackLocale] || {}
    
    return {
      id: dbProduct.id,
      slug: dbProduct.slug,
      category_id: dbProduct.category_id,
      
      // From translations
      name: translations?.name || `Produit ${dbProduct.sku}`,
      description_short: translations?.description || '',
      description_long: translations?.description || '',
      
      // Commerce
      price: dbProduct.price,
      currency: 'EUR', // MVP: Fixed currency
      stock: dbProduct.stock_quantity,
      unit: 'g', // MVP: Fixed unit for cosmetics
      
      // Labels
      labels: dbProduct.labels,
      
      // Status
      status: 'active',
      is_active: dbProduct.is_active,
      
      // Timestamps
      created_at: dbProduct.created_at,
      updated_at: dbProduct.updated_at,
      
      // Optional fields with translations
      translations: dbProduct.translations
    }
  })
}

interface ShopPageProps {
  params: Promise<{ locale: string }>
}

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Boutique | HerbisVeritas - Cosmétiques Bio Artisanaux',
  description: 'Découvrez nos cosmétiques bio artisanaux aux 7 labels HerbisVeritas.'
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  // Récupération des produits depuis Supabase (client sécurisé avec RLS)
  let products: Product[] = []
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erreur Supabase:', error)
    } else {
      const dbProducts = data || []
      products = mapDatabaseProducts(dbProducts, locale)
      console.log(`✅ ${products.length} produits chargés (RLS sécurisé)`)
    }
  } catch (err) {
    console.error('Erreur lors du chargement des produits:', err)
  }

  return (
    <main className="min-h-screen">
      <HeroSection locale={locale} />
      
      <section className="container mx-auto px-4 py-8">
        <TrustIndicators variant="full" />
      </section>
      
      <section className="container mx-auto px-4 pb-16">
        <Suspense fallback={<Loader />}>
          <ProductGrid products={products} showFilters={true} />
        </Suspense>
      </section>
    </main>
  )
}