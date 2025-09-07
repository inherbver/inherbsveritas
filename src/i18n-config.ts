// src/i18n-config.ts  
// Copie exacte du premier projet fonctionnel

// Définition des locales supportées
export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

// Locale par défaut
export const defaultLocale: Locale = "fr";
export const localePrefix = "as-needed"; // Options: 'as-needed', 'always', 'never'

// Définition des pathnames pour le routage localisé
export const pathnames = {
  // Le chemin canonique '/' est mappé à la page d'accueil
  "/": "/",

  // Le chemin canonique '/shop' est mappé à des URLs localisées
  "/shop": {
    en: "/shop",
    fr: "/boutique",
  },

  // Le chemin canonique pour les produits (route dynamique)
  "/products/[slug]": {
    en: "/products/[slug]",
    fr: "/produits/[slug]",
  },

  // Le chemin canonique pour la page de paiement
  "/checkout": {
    en: "/checkout",
    fr: "/paiement",
  },

  // Le chemin canonique pour la page de contact
  "/contact": {
    en: "/contact",
    fr: "/contact",
  },
};

export const localeDetection = true; // Activer/désactiver la détection automatique

// Configuration pour next-intl v3.22+
export const routing = {
  locales,
  defaultLocale,
  pathnames,
  localePrefix,
  localeDetection
} as const;