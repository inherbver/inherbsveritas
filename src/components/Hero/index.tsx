/**
 * Hero Component - HerbisVeritas V2 MVP
 * 
 * Refactored hero section with proper component separation
 * Configured for cosmetics business content
 */

import { HeroSection } from './hero-section';
import { HeroContent } from './hero-content';

export default function Hero() {
  const heroData = {
    title: "HerbisVeritas - Cosmétiques Naturels Artisanaux",
    description: "Découvrez notre gamme de cosmétiques biologiques et naturels fabriqués artisanalement avec les meilleurs ingrédients d'Occitanie. Des produits authentiques pour votre bien-être quotidien.",
    primaryCta: {
      text: "Découvrir nos produits",
      href: "/products"
    },
    secondaryCta: {
      text: "Notre histoire", 
      href: "/about"
    }
  };

  return (
    <HeroSection>
      <HeroContent 
        title={heroData.title}
        description={heroData.description}
        primaryCta={heroData.primaryCta}
        secondaryCta={heroData.secondaryCta}
      />
    </HeroSection>
  );
}

// Re-export named export for backward compatibility
export { default as Hero } from './index';