import { Suspense } from "react";
import { setRequestLocale } from 'next-intl/server';
import Breadcrumb from "@/components/common/Breadcrumb";
import { ProductGrid } from "@/components/collections";
import { Loader } from "@/components/common/Loader";

interface ProductsPageProps {
  params: Promise<{ locale: string }>
}

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Nos Produits | HerbisVeritas",
  description: "Découvrez notre gamme complète de cosmétiques bio artisanaux aux 7 labels HerbisVeritas",
};

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Breadcrumb
        pageName="Nos Produits"
        pageDescription="Cosmétiques bio artisanaux aux essences d&apos;Occitanie"
      />
      <main className="pb-[120px] pt-[120px]">
        <section className="container">
          <Suspense fallback={<Loader />}>
            <ProductGrid products={[]} showFilters={true} />
          </Suspense>
        </section>
      </main>
    </>
  );
}