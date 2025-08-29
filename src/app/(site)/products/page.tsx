import { Suspense } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Products from "@/components/Products";
import { Loader } from "@/components/Common/Loader";

export const metadata = {
  title: "Nos Produits | HerbisVeritas",
  description: "Découvrez notre gamme complète de cosmétiques bio artisanaux aux 7 labels HerbisVeritas",
};

export default function ProductsPage() {
  return (
    <>
      <Breadcrumb
        pageName="Nos Produits"
        pageDescription="Cosmétiques bio artisanaux aux essences d&apos;Occitanie"
      />
      <main className="pb-[120px] pt-[120px]">
        <section className="container">
          <Suspense fallback={<Loader />}>
            <Products />
          </Suspense>
        </section>
      </main>
    </>
  );
}