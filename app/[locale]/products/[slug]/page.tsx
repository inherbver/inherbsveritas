import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { ProductDetail } from '@/components/products/product-detail'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/server'
import type { Product as DatabaseProduct } from '@/types/database'
import type { Product } from '@/types/product'

// Map database product to application product type
function mapDatabaseProduct(dbProduct: DatabaseProduct, locale: string = 'fr'): Product {
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
}

async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    
    if (error || !data) {
      console.error('Erreur produit:', error)
      return null
    }
    
    return mapDatabaseProduct(data as DatabaseProduct)
  } catch (err) {
    console.error('Erreur chargement produit:', err)
    return null
  }
}

interface ProductPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  setRequestLocale(resolvedParams.locale)
  const product = await getProductBySlug(resolvedParams.slug)

  if (!product) {
    notFound()
  }

  const handleAddToCart = async (product: Product, quantity: number) => {
    'use server'
    // TODO: Implémenter ajout au panier côté serveur
    console.log(`Adding ${quantity}x ${product.name} to cart`)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Chargement du produit...</p>
          </div>
        </div>
      }>
        <ProductDetail 
          product={product} 
          onAddToCart={handleAddToCart}
        />
      </Suspense>
    </main>
  )
}

export async function generateMetadata({ params }: ProductPageProps) {
  const resolvedParams = await params
  
  // Get raw product from database for metadata
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', resolvedParams.slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return {
        title: 'Produit non trouvé',
        description: 'Le produit que vous recherchez n\'existe pas.'
      }
    }

    const product = mapDatabaseProduct(data as DatabaseProduct, resolvedParams.locale)

    return {
      title: `${product.name} | HerbisVeritas`,
      description: product.description_short,
      openGraph: {
        title: product.name,
        description: product.description_short,
        images: [], // TODO: Implement product images from product_images table
        type: 'website'
      },
      other: {
        'product:price:amount': product.price.toString(),
        'product:price:currency': product.currency,
        'product:availability': product.stock > 0 ? 'in stock' : 'out of stock'
      }
    }
  } catch (err) {
    console.error('Erreur génération metadata:', err)
    return {
      title: 'Erreur',
      description: 'Erreur lors du chargement du produit.'
    }
  }
}