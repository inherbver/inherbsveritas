/**
 * CVA Variants pour ContentGrid - Styles et responsive
 */

import { cva } from "class-variance-authority"

// CVA pour les variants de grille
export const contentGridVariants = cva(
  "grid gap-4 transition-all duration-200",
  {
    variants: {
      // Types de contenu (adapte columns par défaut)
      variant: {
        product: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        article: "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3", 
        category: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        partner: "grid-cols-1 sm:grid-cols-1 md:grid-cols-2",
        event: "grid-cols-1 sm:grid-cols-1 md:grid-cols-2"
      },
      // Espacement
      gap: {
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8"
      },
      // Densité d'affichage
      density: {
        compact: "gap-2",
        normal: "gap-4", 
        spacious: "gap-6"
      }
    },
    defaultVariants: {
      variant: "product",
      gap: "md",
      density: "normal"
    }
  }
)