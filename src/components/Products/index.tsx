import { ProductGrid } from '@/components/modules/boutique/components/product-grid'

export default function Products() {
  return (
    <section className="py-16">
      <header className="text-center mb-12">
        <h2 className="text-3xl font-bold text-dark dark:text-white mb-4">
          Nos Produits Bio
        </h2>
        <p className="text-body-color dark:text-body-color-dark">
          Découvrez notre gamme de cosmétiques bio artisanaux aux labels HerbisVeritas
        </p>
      </header>
      
      <ProductGrid />
    </section>
  );
}