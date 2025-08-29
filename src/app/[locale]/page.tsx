import About from "@/components/About";
import CallToAction from "@/components/CallToAction";
import Clients from "@/components/Clients";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HerbisVeritas - Cosmétiques Bio Artisanaux",
  description: "Découvrez HerbisVeritas, votre spécialiste en cosmétiques bio artisanaux aux essences d'Occitanie. Produits naturels, labels qualité et savoir-faire traditionnel.",
};

export default function Home() {
  return (
    <main>
      <ScrollUp />
      <Hero />
      <Features />
      <About />
      <CallToAction />
      <Contact />
      <Clients />
    </main>
  );
}
