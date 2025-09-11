import { setRequestLocale } from 'next-intl/server'
import { Suspense } from "react"
import { HeroSection } from "@/components/shop/hero-section"
import { TrustIndicators } from "@/components/shop/trust-indicators"
import { ProductGrid } from "@/components/collections"
import { Loader } from "@/components/common/loader"
import { createAdminClient } from '@/lib/supabase/admin'
import type { Product as DatabaseProduct } from '@/types/database'
import type { Product } from '@/types/product'


// Images Supabase Storage disponibles
const PRODUCT_IMAGES = [
  'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_1.webp',
  'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_2.webp',
  'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_3.webp',
  'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_4.webp',
  'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_5.webp',
  'https://mntndpelpvcskirnyqvx.supabase.co/storage/v1/object/public/products/pdct_6.webp'
]

// Map database product to application product type
function mapDatabaseProducts(dbProducts: DatabaseProduct[], locale: string = 'fr'): Product[] {
  if (dbProducts.length === 0) {
    return []
  }

  return dbProducts.map((dbProduct, index) => {
    const translationsData = dbProduct.translations || {}
    const fallbackLocale = Object.keys(translationsData)[0] || 'fr'
    const translations = translationsData[locale] || translationsData['fr'] || translationsData[fallbackLocale] || {}
    
    // Attribution cyclique des images (réutilise les images si plus de 6 produits)
    const imageIndex = index % PRODUCT_IMAGES.length
    const image_url = PRODUCT_IMAGES[imageIndex] || undefined
    
    return {
      id: dbProduct.id,
      slug: dbProduct.slug,
      category_id: dbProduct.category_id,
      
      // Name: depuis translations uniquement (structure MVP)
      name: translations?.name || `Produit ${dbProduct.slug}`,
      description_short: translations?.description || '',
      description_long: translations?.description || '',
      
      // Commerce
      price: dbProduct.price,
      currency: 'EUR',
      stock: dbProduct.stock_quantity,
      unit: 'g',
      
      // Image depuis Supabase Storage
      ...(image_url && { image_url }),
      
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