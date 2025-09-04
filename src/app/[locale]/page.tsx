import { ProductGrid } from "@/components/modules/boutique/components/product-grid";
import ScrollUp from "@/components/common/ScrollUp";
import { ColorShowcase } from "@/components/demo/color-showcase";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HerbisVeritas - Boutique Bio Artisanale",
  description: "Découvrez notre gamme de cosmétiques bio artisanaux aux labels HerbisVeritas. Produits naturels d'Occitanie, savoir-faire traditionnel et qualité certifiée.",
};

export default function Home() {
  return (
    <main>
      <ScrollUp />
      
      {/* Demo Design System temporaire */}
      <ColorShowcase />
      
      <section 
        className="py-16"
        role="main"
        aria-labelledby="boutique-title"
      >
        <header className="text-center mb-12">
          <h1 
            id="boutique-title"
            className="text-4xl font-bold text-hv-primary mb-4"
          >
            Boutique HerbisVeritas
          </h1>
          <p className="text-lg text-hv-neutral-600 max-w-2xl mx-auto">
            Découvrez notre gamme de cosmétiques bio artisanaux aux labels HerbisVeritas
          </p>
        </header>
        
        <ProductGrid />
      </section>
    </main>
  );
}
