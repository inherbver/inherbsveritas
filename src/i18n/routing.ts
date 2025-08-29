/**
 * Next-intl Routing Configuration for HerbisVeritas V2 MVP
 * Supports: French (default), English only for MVP
 * DE/ES will be added in V2 phase
 */
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // MVP supported locales: FR/EN only
  locales: ['fr', 'en'],
  
  // Default locale (French for HerbisVeritas)
  defaultLocale: 'fr',
  
  // URL prefix configuration
  localePrefix: {
    mode: 'always',
    prefixes: {
      // French uses root path
      fr: '/'
    }
  },

  // Optional: Define alternate links for SEO
  alternateLinks: true,
  
  // Path names for localized routes MVP (FR/EN only)
  pathnames: {
    '/': '/',
    '/products': {
      fr: '/produits',
      en: '/products'
    },
    '/cart': {
      fr: '/panier',
      en: '/cart'
    },
    '/checkout': {
      fr: '/commande',
      en: '/checkout'
    },
    '/magazine': {
      fr: '/magazine',
      en: '/magazine'
    },
    '/partners': {
      fr: '/partenaires',
      en: '/partners'
    },
    '/about': {
      fr: '/a-propos',
      en: '/about'
    },
    '/contact': {
      fr: '/contact',
      en: '/contact'
    }
  }
})

// Export types for TypeScript
export type Locale = (typeof routing.locales)[number]
export type Pathnames = keyof typeof routing.pathnames