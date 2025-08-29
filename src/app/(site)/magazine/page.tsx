import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Magazine | HerbisVeritas",
  description: "Découvrez nos articles, conseils et actualités sur les cosmétiques bio artisanaux",
};

const MagazinePage = () => {
  return (
    <main>
      <Breadcrumb 
        pageName="Magazine" 
        pageDescription="Nos conseils et actualités bio" 
      />
      
      <section className="pb-10 pt-20 lg:pb-20 lg:pt-[120px]">
        <article className="container">
          <header className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-dark dark:text-white">
              Magazine en construction
            </h2>
            <p className="text-body-color dark:text-body-color-dark">
              Notre système d&apos;articles avec TipTap sera bientôt disponible selon l&apos;architecture MVP 13 tables.
            </p>
          </header>
        </article>
      </section>
    </main>
  );
};

export default MagazinePage;
