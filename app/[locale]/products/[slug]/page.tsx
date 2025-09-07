import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { ProductDetail } from '@/components/products/product-detail'
import { Spinner } from '@/components/ui/spinner'
import { type ProductLabel } from '@/types/product'

// Mock fonction pour récupérer un produit par slug
// TODO: Remplacer par l'API Supabase réelle
async function getProductBySlug(slug: string) {
  // Simulation d'un produit pour demo
  const mockProduct = {
    id: 'product-' + slug,
    slug: slug,
    name: 'Huile Essentielle de Lavande Bio',
    description_short: 'Huile essentielle de lavande vraie (Lavandula angustifolia) certifiée bio, récoltée à la main en Occitanie.',
    description_long: 'Cette huile essentielle de lavande vraie est issue de nos champs situés sur les plateaux de haute Provence. Distillée dans notre atelier selon des méthodes ancestrales, elle conserve toutes ses propriétés apaisantes et régénérantes. Parfaite pour la relaxation, les soins de la peau et l\'aromathérapie.',
    price: 24.90,
    currency: 'EUR',
    stock: 12,
    unit: 'flacon 10ml',
    image_url: '/images/products/lavender-oil.jpg',
    inci_list: [
      'Lavandula Angustifolia Oil',
      'Linalool',
      'Limonene',
      'Geraniol'
    ],
    labels: ['bio', 'recolte_main', 'origine_occitanie'] as ProductLabel[],
    status: 'active',
    is_active: true,
    is_new: false,
    is_on_promotion: false,
    properties: 'Anti-inflammatoire\\nCicatrisante\\nAntispasmodique\\nSédative et calmante\\nRépulsive (insectes)',
    compositionText: 'Huile essentielle 100% pure et naturelle de Lavandula angustifolia, obtenue par distillation à la vapeur d\'eau des sommités fleuries fraîches.',
    usageInstructions: 'Usage externe uniquement.\\nPour le bain : 5 à 10 gouttes mélangées dans une base neutre.\\nEn diffusion : 5 à 10 gouttes dans un diffuseur électrique.\\nEn massage : 2 à 3 gouttes dans 10ml d\'huile végétale.\\n\\nPrécautions : Tenir hors de portée des enfants. Déconseillé aux femmes enceintes et allaitantes.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  // Simule un délai de chargement
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return mockProduct
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

  const handleAddToCart = async (product: any, quantity: number) => {
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
  const product = await getProductBySlug(resolvedParams.slug)

  if (!product) {
    return {
      title: 'Produit non trouvé',
      description: 'Le produit que vous recherchez n\'existe pas.'
    }
  }

  return {
    title: `${product.name} | HerbisVeritas`,
    description: product.description_short,
    openGraph: {
      title: product.name,
      description: product.description_short,
      images: product.image_url ? [
        {
          url: product.image_url,
          width: 800,
          height: 600,
          alt: product.name
        }
      ] : [],
      type: 'product'
    },
    other: {
      'product:price:amount': product.price.toString(),
      'product:price:currency': product.currency,
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock'
    }
  }
}