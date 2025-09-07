import { setRequestLocale } from 'next-intl/server'
import { Suspense } from "react"
import { HeroSection } from "@/components/shop/hero-section"
import { TrustIndicators } from "@/components/shop/trust-indicators"
import { ProductGrid } from "@/components/collections"
import { Loader } from "@/components/common/Loader"

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

  return (
    <main className="min-h-screen">
      <HeroSection locale={locale} />
      
      <section className="container mx-auto px-4 py-8">
        <TrustIndicators variant="full" />
      </section>
      
      <section className="container mx-auto px-4 pb-16">
        <Suspense fallback={<Loader />}>
          <ProductGrid products={[]} showFilters={true} />
        </Suspense>
      </section>
    </main>
  )
}