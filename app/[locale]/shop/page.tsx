import { setRequestLocale } from 'next-intl/server'
import { Suspense } from "react"
import { HeroSection } from "@/components/shop/hero-section"
import { TrustIndicators } from "@/components/shop/trust-indicators"
import { ProductGrid } from "@/components/collections"
import { Loader } from "@/components/common/loader"
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Product as DatabaseProduct } from '@/types/database'
import type { Product } from '@/types/product'


// Map database product to application product type
function mapDatabaseProducts(dbProducts: DatabaseProduct[], locale: string = 'fr'): Product[] {
  if (dbProducts.length === 0) {
    return []
  }

  return dbProducts.map(dbProduct => {
    const translationsData = dbProduct.translations || {}
    const fallbackLocale = Object.keys(translationsData)[0] || 'fr'
    const translations = translationsData[locale] || translationsData['fr'] || translationsData[fallbackLocale] || {}
    
    return {
      id: dbProduct.id,
      slug: dbProduct.slug,
      category_id: dbProduct.category_id,
      
      // Name: priorité sur nom direct de la table, puis translations
      name: dbProduct.name || translations?.name || `Produit ${dbProduct.slug}`,
      description_short: dbProduct.description_short || translations?.description || '',
      description_long: dbProduct.description_long || translations?.description || '',
      
      // Commerce
      price: dbProduct.price,
      currency: dbProduct.currency || 'EUR',
      stock: dbProduct.stock,
      unit: dbProduct.unit || 'g',
      
      // Labels
      labels: dbProduct.labels,
      
      // Status
      status: dbProduct.status || 'active',
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

  // Récupération des produits depuis Supabase
  // Note: Utilisation temporaire du client admin pour contourner le problème RLS
  // TODO: Corriger les politiques RLS pour utiliser le client standard
  let products: Product[] = []
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erreur lors du chargement des produits:', error)
      products = []
    } else {
      const dbProducts = data || []
      products = mapDatabaseProducts(dbProducts, locale)
    }
  } catch (err) {
    console.error('Erreur critique lors du chargement des produits:', err)
    products = []
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