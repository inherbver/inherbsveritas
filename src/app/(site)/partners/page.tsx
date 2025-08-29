import { Suspense } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Partners from "@/components/Partners";
import { Loader } from "@/components/Common/Loader";

export const metadata = {
  title: "Où nous trouver | HerbisVeritas",
  description: "Découvrez nos points de vente partenaires en Occitanie",
};

export default function PartnersPage() {
  return (
    <>
      <Breadcrumb
        pageName="Où nous trouver"
        pageDescription="Nos partenaires et points de vente"
      />
      <main className="pb-[120px] pt-[120px]">
        <section className="container">
          <Suspense fallback={<Loader />}>
            <Partners />
          </Suspense>
        </section>
      </main>
    </>
  );
}