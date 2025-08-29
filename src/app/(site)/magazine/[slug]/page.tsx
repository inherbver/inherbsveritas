import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Article: ${slug} | HerbisVeritas`,
    description: "Article du magazine HerbisVeritas sur les cosmétiques bio artisanaux",
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  
  // TODO: Implémenter selon l'architecture 13 tables MVP
  // - Récupération depuis table `articles` via Supabase
  // - Support TipTap JSON content
  // - Relations avec `categories` et `users` (author)
  
  return (
    <main>
      <Breadcrumb 
        pageName={`Article: ${slug}`}
        pageDescription="Article du magazine HerbisVeritas"
      />
      
      <section className="pb-10 pt-20 lg:pb-20 lg:pt-[120px]">
        <article className="container">
          <header className="text-center">
            <h1 className="mb-4 text-3xl font-bold text-dark dark:text-white">
              Article: {slug}
            </h1>
            <p className="text-body-color dark:text-body-color-dark">
              Système d&apos;articles TipTap en cours d&apos;implémentation selon l&apos;architecture MVP 13 tables.
            </p>
          </header>
        </article>
      </section>
    </main>
  );
}
