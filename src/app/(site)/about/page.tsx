import About from "@/components/About";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notre Histoire | HerbisVeritas",
  description: "Découvrez l'histoire d'HerbisVeritas, nos valeurs et notre engagement pour les cosmétiques bio artisanaux",
};

const AboutPage = () => {
  return (
    <main>
      <Breadcrumb 
        pageName="Notre Histoire" 
        pageDescription="L&apos;aventure HerbisVeritas" 
      />
      <About />
    </main>
  );
};

export default AboutPage;
