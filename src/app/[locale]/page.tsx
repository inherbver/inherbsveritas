import { ProductGrid } from "@/components/modules/boutique/components/product-grid";
import ScrollUp from "@/components/common/ScrollUp";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HerbisVeritas - Boutique Bio Artisanale",
  description: "Découvrez notre gamme de cosmétiques bio artisanaux aux labels HerbisVeritas. Produits naturels d'Occitanie, savoir-faire traditionnel et qualité certifiée.",
};

export default function Home() {
  return (
    <main>
      <ScrollUp />
      <section className="py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark dark:text-white mb-4">
            Boutique HerbisVeritas
          </h1>
          <p className="text-lg text-body-color dark:text-body-color-dark max-w-2xl mx-auto">
            Découvrez notre gamme de cosmétiques bio artisanaux aux labels HerbisVeritas
          </p>
        </header>
        
        <ProductGrid />
      </section>
    </main>
  );
}
