# Guide d'Internationalisation - HerbisVeritas V2 MVP

## 🌍 Vue d'Ensemble

Ce document détaille la stratégie d'internationalisation (i18n) MVP pour HerbisVeritas V2, utilisant **next-intl v3.22+** avec Next.js 15 App Router pour supporter **FR/EN** (DE/ES reportés V2) avec des performances optimales et une architecture JSONB.

---

## 🎯 Architecture d'Internationalisation Moderne

### Configuration des Locales avec next-intl 3.22+

```typescript
// src/i18n/routing.ts - Configuration centralisée selon next-intl
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // Langues supportées MVP (DE/ES → V2)
  locales: ['fr', 'en'],
  
  // Langue par défaut (pas de préfixe dans l'URL)
  defaultLocale: 'fr',
  
  // Configuration avancée pour les domaines (optionnel)
  domains: [
    {
      domain: 'herbisveritas.fr',
      defaultLocale: 'fr'
    },
    {
      domain: 'herbisveritas.com', 
      defaultLocale: 'en'
    }
  ],
  
  // Stratégies de préfixe
  localePrefix: {
    mode: 'always',
    prefixes: {
      // '/fr' sera redirigé vers '/' (domaine français)
      fr: '/'
    }
  }
});

// Types dérivés pour TypeScript
export type SupportedLocale = (typeof routing.locales)[number];
export const DEFAULT_LOCALE = routing.defaultLocale;
```

### Configuration des Métadonnées Locales

```typescript
// lib/i18n/config.ts - Métadonnées par locale
export const LOCALE_CONFIG = {
  fr: {
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    rtl: false,
    region: 'FR',
    hreflang: 'fr-FR'
  },
  en: {
    name: 'English',
    nativeName: 'English', 
    flag: '🇬🇧',
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    rtl: false,
    region: 'GB',
    hreflang: 'en-GB'
  },
  de: {
    name: 'Deutsch',
    nativeName: 'Deutsch',
    flag: '🇩🇪', 
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: '24h',
    rtl: false,
    region: 'DE',
    hreflang: 'de-DE'
  },
  es: {
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸',
    currency: 'EUR',
    currencySymbol: '€', 
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    rtl: false,
    region: 'ES',
    hreflang: 'es-ES'
  },
  it: {
    name: 'Italiano',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'dd/MM/yyyy', 
    timeFormat: '24h',
    rtl: false,
    region: 'IT',
    hreflang: 'it-IT'
  }
} as const;

export type LocaleConfig = typeof LOCALE_CONFIG;
```

### Configuration Next-intl

```typescript
// i18n.ts (racine du projet)
import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { SUPPORTED_LOCALES, type SupportedLocale } from './lib/i18n/config'

export default getRequestConfig(async ({ locale }) => {
  // Validation locale
  if (!SUPPORTED_LOCALES[locale as SupportedLocale]) {
    notFound()
  }
  
  try {
    // Chargement dynamique des messages
    const messages = await import(`./src/i18n/messages/${locale}.json`)
    
    return {
      messages: messages.default,
      timeZone: 'Europe/Paris', // Timezone par défaut
      now: new Date(),
      formats: {
        dateTime: SUPPORTED_LOCALES[locale as SupportedLocale].dateFormat,
        number: {
          currency: {
            style: 'currency',
            currency: SUPPORTED_LOCALES[locale as SupportedLocale].currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          },
          percent: {
            style: 'percent',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          }
        }
      }
    }
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error)
    notFound()
  }
})
```

### Structure des Fichiers de Traduction

```
src/i18n/messages/
├── fr.json              # Français (langue par défaut)
├── en.json              # Anglais
├── de.json              # Allemand
├── es.json              # Espagnol
└── it.json              # Italien

src/i18n/
├── messages/            # Fichiers de traduction
├── hooks/              # Hooks d'internationalisation
├── utils/              # Utilitaires i18n
├── types/              # Types TypeScript
└── validation/         # Schémas Zod localisés
```

---

## 📝 Organisation des Messages de Traduction

### Structure Hiérarchique des Messages

```json
// src/i18n/messages/fr.json
{
  "common": {
    "loading": "Chargement...",
    "error": "Une erreur est survenue",
    "success": "Succès !",
    "confirm": "Confirmer",
    "cancel": "Annuler",
    "save": "Enregistrer",
    "edit": "Modifier",
    "delete": "Supprimer",
    "close": "Fermer",
    "next": "Suivant",
    "previous": "Précédent",
    "search": "Rechercher",
    "filter": "Filtrer",
    "clear": "Effacer",
    "all": "Tout",
    "none": "Aucun",
    "or": "ou",
    "and": "et"
  },
  
  "navigation": {
    "home": "Accueil",
    "products": "Produits",
    "markets": "Marchés",
    "magazine": "Magazine", 
    "about": "À propos",
    "contact": "Contact",
    "account": "Mon Compte",
    "cart": "Panier",
    "orders": "Commandes",
    "login": "Connexion",
    "logout": "Déconnexion",
    "register": "S'inscrire",
    "admin": "Administration"
  },
  
  "products": {
    "title": "Produits Biologiques",
    "subtitle": "Découvrez notre sélection de produits locaux",
    "search": {
      "placeholder": "Rechercher un produit...",
      "results": "{count, plural, =0 {Aucun produit trouvé} =1 {1 produit trouvé} other {# produits trouvés}}",
      "filters": {
        "category": "Catégorie",
        "price": "Prix",
        "availability": "Disponibilité",
        "producer": "Producteur"
      }
    },
    "card": {
      "addToCart": "Ajouter au panier",
      "outOfStock": "Rupture de stock",
      "limitedStock": "Stock limité ({count} restants)",
      "price": {
        "from": "À partir de",
        "per": "par {unit}"
      }
    },
    "details": {
      "description": "Description",
      "ingredients": "Ingrédients",
      "nutrition": "Valeurs nutritionnelles",
      "producer": "Producteur",
      "origin": "Origine",
      "certifications": "Certifications",
      "storage": "Conservation",
      "quantity": "Quantité",
      "reviews": "Avis clients"
    },
    "categories": {
      "fruits-legumes": "Fruits & Légumes",
      "produits-laitiers": "Produits Laitiers",
      "viandes": "Viandes",
      "boulangerie": "Boulangerie",
      "epicerie": "Épicerie",
      "boissons": "Boissons"
    }
  },
  
  "cart": {
    "title": "Mon Panier",
    "empty": {
      "title": "Votre panier est vide",
      "description": "Découvrez nos produits biologiques",
      "action": "Voir les produits"
    },
    "summary": {
      "subtotal": "Sous-total",
      "shipping": "Livraison",
      "tax": "TVA",
      "total": "Total",
      "free": "Gratuite"
    },
    "checkout": "Commander",
    "continue": "Continuer mes achats",
    "quantity": {
      "decrease": "Diminuer la quantité",
      "increase": "Augmenter la quantité",
      "remove": "Retirer du panier"
    },
    "errors": {
      "stockInsufficient": "Stock insuffisant pour {product}",
      "productUnavailable": "Produit {product} non disponible",
      "updateFailed": "Impossible de mettre à jour le panier"
    }
  },
  
  "auth": {
    "login": {
      "title": "Connexion",
      "email": "Adresse email",
      "password": "Mot de passe",
      "submit": "Se connecter",
      "forgot": "Mot de passe oublié ?",
      "noAccount": "Pas de compte ?",
      "createAccount": "Créer un compte"
    },
    "register": {
      "title": "Créer un compte",
      "firstName": "Prénom",
      "lastName": "Nom",
      "email": "Adresse email",
      "password": "Mot de passe",
      "confirmPassword": "Confirmer le mot de passe",
      "terms": "J'accepte les {termsLink} et la {privacyLink}",
      "termsLink": "conditions d'utilisation",
      "privacyLink": "politique de confidentialité",
      "submit": "Créer mon compte",
      "hasAccount": "Déjà un compte ?",
      "signin": "Se connecter"
    },
    "errors": {
      "invalidCredentials": "Email ou mot de passe incorrect",
      "emailExists": "Cet email est déjà utilisé",
      "weakPassword": "Le mot de passe doit contenir au moins 8 caractères",
      "passwordMismatch": "Les mots de passe ne correspondent pas",
      "emailRequired": "L'email est requis",
      "passwordRequired": "Le mot de passe est requis"
    }
  },
  
  "profile": {
    "title": "Mon Profil",
    "personal": {
      "title": "Informations personnelles",
      "firstName": "Prénom",
      "lastName": "Nom",
      "email": "Email",
      "phone": "Téléphone",
      "birthDate": "Date de naissance"
    },
    "addresses": {
      "title": "Mes adresses",
      "add": "Ajouter une adresse",
      "edit": "Modifier",
      "delete": "Supprimer",
      "setDefault": "Définir par défaut",
      "default": "Adresse par défaut",
      "billing": "Facturation",
      "shipping": "Livraison"
    },
    "orders": {
      "title": "Mes commandes",
      "empty": "Aucune commande",
      "status": {
        "pending": "En attente",
        "confirmed": "Confirmée",
        "preparing": "Préparation",
        "shipped": "Expédiée",
        "delivered": "Livrée",
        "cancelled": "Annulée"
      }
    }
  },
  
  "admin": {
    "dashboard": {
      "title": "Tableau de bord",
      "stats": {
        "totalOrders": "Commandes totales",
        "revenue": "Chiffre d'affaires",
        "activeUsers": "Utilisateurs actifs",
        "products": "Produits"
      }
    },
    "products": {
      "title": "Gestion des produits",
      "add": "Ajouter un produit",
      "edit": "Modifier le produit",
      "delete": "Supprimer le produit",
      "bulk": {
        "actions": "Actions groupées",
        "delete": "Supprimer sélection",
        "activate": "Activer sélection",
        "deactivate": "Désactiver sélection"
      }
    },
    "orders": {
      "title": "Gestion des commandes",
      "updateStatus": "Mettre à jour le statut",
      "printLabel": "Imprimer étiquette",
      "refund": "Rembourser"
    }
  },
  
  "errors": {
    "generic": "Une erreur inattendue s'est produite",
    "network": "Problème de connexion réseau",
    "notFound": "Page non trouvée",
    "unauthorized": "Accès non autorisé",
    "forbidden": "Accès interdit",
    "validation": {
      "required": "Ce champ est requis",
      "email": "Format d'email invalide",
      "minLength": "Minimum {min} caractères",
      "maxLength": "Maximum {max} caractères",
      "pattern": "Format invalide"
    }
  },
  
  "dates": {
    "today": "Aujourd'hui",
    "yesterday": "Hier",
    "tomorrow": "Demain",
    "daysAgo": "Il y a {count} jour{count, plural, =1 {} other {s}}",
    "weeksAgo": "Il y a {count} semaine{count, plural, =1 {} other {s}}",
    "monthsAgo": "Il y a {count} mois"
  },
  
  "seo": {
    "home": {
      "title": "HerbisVeritas - Produits Biologiques Locaux",
      "description": "Découvrez notre sélection de produits biologiques locaux de qualité. Commandez en ligne et soutenez les producteurs de votre région."
    },
    "products": {
      "title": "Produits Bio - HerbisVeritas",
      "description": "Fruits, légumes, produits laitiers et épicerie bio. Livraison à domicile."
    },
    "markets": {
      "title": "Marchés Bio - HerbisVeritas",
      "description": "Trouvez les marchés biologiques près de chez vous. Calendrier et informations pratiques."
    }
  }
}
```

---

## 🔧 Composants et Hooks d'Internationalisation

### Hook de Traduction Typé

```typescript
// lib/i18n/hooks/useTranslation.ts
import { useTranslations } from 'next-intl'
import { type SupportedLocale } from '../config'

type TranslationKey = 
  | 'common'
  | 'navigation'
  | 'products'
  | 'cart'
  | 'auth'
  | 'profile'
  | 'admin'
  | 'errors'
  | 'dates'
  | 'seo'

/**
 * Hook de traduction typé avec auto-completion
 */
export function useTranslation(namespace: TranslationKey = 'common') {
  const t = useTranslations(namespace)
  
  return {
    t,
    // Helpers pour les cas courants
    common: useTranslations('common'),
    errors: useTranslations('errors'),
    validation: useTranslations('errors.validation')
  }
}

/**
 * Hook pour les traductions riches (avec formatting)
 */
export function useRichTranslation() {
  const { t } = useTranslation('common')
  
  const formatMessage = (
    key: string, 
    values?: Record<string, any>,
    rich?: Record<string, (chunks: any) => React.ReactNode>
  ) => {
    return t.rich(key, { ...values, ...rich })
  }
  
  return { formatMessage, t }
}

/**
 * Hook pour les nombres et devises
 */
export function useNumberFormat() {
  const { t } = useTranslation('common')
  
  const formatCurrency = (
    value: number,
    options?: Intl.NumberFormatOptions
  ) => {
    return t('currency', { value, ...options })
  }
  
  const formatNumber = (
    value: number,
    options?: Intl.NumberFormatOptions
  ) => {
    return new Intl.NumberFormat(t('locale'), options).format(value)
  }
  
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat(t('locale'), { 
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value / 100)
  }
  
  return { formatCurrency, formatNumber, formatPercent }
}

/**
 * Hook pour les dates
 */
export function useDateFormat() {
  const { t } = useTranslation('dates')
  
  const formatDate = (
    date: Date,
    options?: Intl.DateTimeFormatOptions
  ) => {
    return new Intl.DateTimeFormat(t('locale'), {
      dateStyle: 'medium',
      ...options
    }).format(date)
  }
  
  const formatDateTime = (
    date: Date,
    options?: Intl.DateTimeFormatOptions
  ) => {
    return new Intl.DateTimeFormat(t('locale'), {
      dateStyle: 'medium',
      timeStyle: 'short',
      ...options
    }).format(date)
  }
  
  const formatRelative = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return t('today')
    if (diffInDays === 1) return t('yesterday')
    if (diffInDays === -1) return t('tomorrow')
    if (diffInDays > 0 && diffInDays < 7) {
      return t('daysAgo', { count: diffInDays })
    }
    if (diffInDays >= 7 && diffInDays < 30) {
      return t('weeksAgo', { count: Math.floor(diffInDays / 7) })
    }
    if (diffInDays >= 30) {
      return t('monthsAgo', { count: Math.floor(diffInDays / 30) })
    }
    
    return formatDate(date)
  }
  
  return { formatDate, formatDateTime, formatRelative }
}
```

### Composant de Changement de Langue

```typescript
// components/i18n/LanguageSwitcher.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Languages, Check } from 'lucide-react'
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/i18n/config'

interface LanguageSwitcherProps {
  variant?: 'select' | 'menu'
  showFlag?: boolean
  showText?: boolean
  className?: string
}

export function LanguageSwitcher({
  variant = 'select',
  showFlag = true,
  showText = true,
  className
}: LanguageSwitcherProps) {
  const locale = useLocale() as SupportedLocale
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const handleLocaleChange = (newLocale: SupportedLocale) => {
    startTransition(() => {
      // Remplacement de la locale dans l'URL
      const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
      router.replace(newPath)
    })
  }
  
  if (variant === 'select') {
    return (
      <Select
        value={locale}
        onValueChange={handleLocaleChange}
        disabled={isPending}
      >
        <SelectTrigger className={className}>
          <SelectValue>
            <div className="flex items-center gap-2">
              {showFlag && <span className="text-lg">{SUPPORTED_LOCALES[locale].flag}</span>}
              {showText && (
                <span className="text-sm font-medium">
                  {SUPPORTED_LOCALES[locale].nativeName}
                </span>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_LOCALES).map(([code, localeData]) => (
            <SelectItem key={code} value={code}>
              <div className="flex items-center gap-2">
                <span className="text-base">{localeData.flag}</span>
                <span className="text-sm">{localeData.nativeName}</span>
                {code === locale && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
  
  return (
    <div className="flex items-center gap-2">
      {Object.entries(SUPPORTED_LOCALES).map(([code, localeData]) => (
        <Button
          key={code}
          variant={code === locale ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLocaleChange(code as SupportedLocale)}
          disabled={isPending}
          className="h-8 px-2"
        >
          <span className="mr-1">{localeData.flag}</span>
          {showText && (
            <span className="text-xs">{localeData.code.toUpperCase()}</span>
          )}
        </Button>
      ))}
    </div>
  )
}
```

### Validation Localisée avec Zod

```typescript
// lib/i18n/validation/schemas.ts
import { z } from 'zod'
import { getTranslations } from 'next-intl/server'

/**
 * Créateur de schémas Zod localisés
 */
export async function createLocalizedSchemas(locale: string) {
  const t = await getTranslations({ locale, namespace: 'errors.validation' })
  
  // Messages d'erreur localisés
  const errorMap: z.ZodErrorMap = (issue, ctx) => {
    switch (issue.code) {
      case z.ZodIssueCode.too_small:
        if (issue.type === 'string') {
          return { message: t('minLength', { min: issue.minimum }) }
        }
        break
      case z.ZodIssueCode.too_big:
        if (issue.type === 'string') {
          return { message: t('maxLength', { max: issue.maximum }) }
        }
        break
      case z.ZodIssueCode.invalid_string:
        if (issue.validation === 'email') {
          return { message: t('email') }
        }
        break
      case z.ZodIssueCode.invalid_type:
        if (issue.expected === 'string' && issue.received === 'undefined') {
          return { message: t('required') }
        }
        break
    }
    return { message: ctx.defaultError }
  }
  
  // Configuration globale de Zod
  z.setErrorMap(errorMap)
  
  // Schémas spécifiques
  return {
    // Schéma utilisateur
    userSchema: z.object({
      firstName: z.string()
        .min(2, t('minLength', { min: 2 }))
        .max(50, t('maxLength', { max: 50 })),
      
      lastName: z.string()
        .min(2, t('minLength', { min: 2 }))
        .max(50, t('maxLength', { max: 50 })),
      
      email: z.string()
        .email(t('email'))
        .max(320, t('maxLength', { max: 320 })),
      
      phone: z.string()
        .regex(/^[\d\s\+\-\(\)\.]+$/, t('pattern'))
        .optional(),
    }),
    
    // Schéma produit
    productSchema: z.object({
      name: z.string()
        .min(3, t('minLength', { min: 3 }))
        .max(100, t('maxLength', { max: 100 })),
      
      description: z.string()
        .max(1000, t('maxLength', { max: 1000 }))
        .optional(),
      
      price: z.number()
        .positive(t('positive'))
        .max(9999.99, t('maxValue', { max: '9999.99' })),
      
      stock: z.number()
        .int(t('integer'))
        .min(0, t('minValue', { min: 0 })),
    }),
    
    // Schéma adresse
    addressSchema: z.object({
      street: z.string()
        .min(5, t('minLength', { min: 5 }))
        .max(100, t('maxLength', { max: 100 })),
      
      city: z.string()
        .min(2, t('minLength', { min: 2 }))
        .max(50, t('maxLength', { max: 50 })),
      
      postalCode: z.string()
        .regex(/^\d{5}$/, t('postalCodePattern')),
      
      country: z.enum(['FR', 'BE', 'CH', 'LU'], {
        errorMap: () => ({ message: t('invalidCountry') })
      }),
    }),
  }
}

/**
 * Hook pour validation côté client
 */
export function useLocalizedValidation() {
  const locale = useLocale()
  const { t } = useTranslation('errors')
  
  const validateField = (schema: z.ZodSchema, value: any) => {
    try {
      schema.parse(value)
      return { success: true, error: null }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          error: error.errors[0]?.message || t('validation.generic')
        }
      }
      return { success: false, error: t('generic') }
    }
  }
  
  return { validateField, locale }
}
```

---

## 🗺️ Routing Multilingue

### Middleware de Routing

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { LOCALES, DEFAULT_LOCALE } from './lib/i18n/config'

// Configuration next-intl
const intlMiddleware = createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always', // Toujours préfixer les URLs
  localeDetection: true,  // Détection automatique
  alternateLinks: true,   // Génération des liens alternatifs
})

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Exclure les fichiers statiques et API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Redirection spéciale pour la racine
  if (pathname === '/') {
    // Détection de la langue préférée
    const acceptLanguage = request.headers.get('accept-language')
    const detectedLocale = detectLocaleFromHeader(acceptLanguage) || DEFAULT_LOCALE
    
    return NextResponse.redirect(new URL(`/${detectedLocale}`, request.url))
  }
  
  // Application du middleware next-intl
  const response = intlMiddleware(request)
  
  // Ajout d'headers SEO
  if (response) {
    const locale = getLocaleFromPathname(pathname)
    
    // Headers hreflang pour SEO
    const alternateUrls = LOCALES.map(loc => 
      `<${request.nextUrl.origin}/${loc}${pathname.replace(`/${locale}`, '')}>; rel="alternate"; hreflang="${loc}"`
    ).join(', ')
    
    response.headers.set('Link', alternateUrls)
    
    // Headers de cache spécifiques par langue
    response.headers.set('Vary', 'Accept-Language')
  }
  
  return response
}

function detectLocaleFromHeader(acceptLanguage: string | null): string | null {
  if (!acceptLanguage) return null
  
  const languages = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim().toLowerCase())
  
  for (const lang of languages) {
    // Correspondance exacte
    if (LOCALES.includes(lang as any)) {
      return lang
    }
    
    // Correspondance partielle (ex: 'en-US' -> 'en')
    const shortLang = lang.split('-')[0]
    if (LOCALES.includes(shortLang as any)) {
      return shortLang
    }
  }
  
  return null
}

function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/')
  return segments[1] || DEFAULT_LOCALE
}

export const config = {
  matcher: [
    // Inclure toutes les routes sauf les fichiers statiques
    '/((?!_next|api|images|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
```

### Génération de Sitemap Multilingue

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'
import { LOCALES, SUPPORTED_LOCALES } from '@/lib/i18n/config'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://herbisveritas.fr'

interface SitemapEntry {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: {
    languages: Record<string, string>
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/products', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/markets', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/magazine', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
  ]
  
  // Pages dynamiques
  const dynamicPages = await getDynamicPages()
  
  const allPages = [...staticPages, ...dynamicPages]
  const sitemap: SitemapEntry[] = []
  
  // Génération des URLs pour chaque langue
  for (const page of allPages) {
    const alternates: Record<string, string> = {}
    
    // Création des alternatives linguistiques
    for (const locale of LOCALES) {
      alternates[locale] = `${BASE_URL}/${locale}${page.path}`
    }
    
    // Ajout pour la langue par défaut
    sitemap.push({
      url: `${BASE_URL}/fr${page.path}`,
      lastModified: page.lastModified || new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: alternates
      }
    })
  }
  
  return sitemap
}

async function getDynamicPages() {
  const { createSupabaseServerClient } = await import('@/lib/supabase/server')
  const supabase = createSupabaseServerClient()
  
  const dynamicPages: Array<{
    path: string
    priority: number
    changeFrequency: 'weekly' | 'monthly'
    lastModified?: Date
  }> = []
  
  // Produits
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('status', 'active')
  
  products?.forEach(product => {
    dynamicPages.push({
      path: `/products/${product.slug}`,
      priority: 0.8,
      changeFrequency: 'weekly',
      lastModified: new Date(product.updated_at)
    })
  })
  
  // Articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('status', 'published')
  
  articles?.forEach(article => {
    dynamicPages.push({
      path: `/magazine/${article.slug}`,
      priority: 0.7,
      changeFrequency: 'monthly',
      lastModified: new Date(article.updated_at)
    })
  })
  
  // Marchés
  const { data: markets } = await supabase
    .from('markets')
    .select('slug, updated_at')
    .eq('active', true)
  
  markets?.forEach(market => {
    dynamicPages.push({
      path: `/markets/${market.slug}`,
      priority: 0.8,
      changeFrequency: 'weekly',
      lastModified: new Date(market.updated_at)
    })
  })
  
  return dynamicPages
}
```

---

## 🔄 Gestion du Contenu Multilingue

### Interface d'Administration Multilingue

```typescript
// components/admin/MultilingualContentEditor.tsx
'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Save, Plus, Trash2, Eye, AlertCircle } from 'lucide-react'
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/i18n/config'
import { useTranslation } from '@/lib/i18n/hooks/useTranslation'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

interface MultilingualContent {
  id?: string
  translations: Record<SupportedLocale, {
    title: string
    description?: string
    content?: string
    slug: string
    metaTitle?: string
    metaDescription?: string
    published: boolean
  }>
  defaultLocale: SupportedLocale
  lastModified: string
  status: 'draft' | 'published' | 'archived'
}

const translationSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(100, 'Titre trop long'),
  description: z.string().max(300, 'Description trop longue').optional(),
  content: z.string().optional(),
  slug: z.string()
    .min(1, 'Slug requis')
    .max(100, 'Slug trop long')
    .regex(/^[a-z0-9-]+$/, 'Slug invalide (lettres, chiffres et tirets uniquement)'),
  metaTitle: z.string().max(60, 'Meta titre trop long').optional(),
  metaDescription: z.string().max(160, 'Meta description trop longue').optional(),
  published: z.boolean()
})

const multilingualContentSchema = z.object({
  translations: z.record(translationSchema),
  defaultLocale: z.enum(['fr', 'en', 'de', 'es', 'it']),
  status: z.enum(['draft', 'published', 'archived'])
})

interface Props {
  content?: MultilingualContent
  contentType: 'product' | 'article' | 'page'
  onSave: (content: MultilingualContent) => Promise<void>
  onPreview?: (locale: SupportedLocale, slug: string) => void
}

export function MultilingualContentEditor({
  content,
  contentType,
  onSave,
  onPreview
}: Props) {
  const { t } = useTranslation('admin')
  const [activeLocale, setActiveLocale] = useState<SupportedLocale>('fr')
  const [saving, setSaving] = useState(false)
  
  const form = useForm<z.infer<typeof multilingualContentSchema>>({
    resolver: zodResolver(multilingualContentSchema),
    defaultValues: content || {
      translations: Object.keys(SUPPORTED_LOCALES).reduce((acc, locale) => {
        acc[locale as SupportedLocale] = {
          title: '',
          description: '',
          content: '',
          slug: '',
          metaTitle: '',
          metaDescription: '',
          published: locale === 'fr'
        }
        return acc
      }, {} as Record<SupportedLocale, any>),
      defaultLocale: 'fr',
      status: 'draft'
    }
  })
  
  const watchedTranslations = form.watch('translations')
  
  // Auto-génération du slug à partir du titre
  const handleTitleChange = (locale: SupportedLocale, title: string) => {
    const slug = generateSlug(title)
    form.setValue(`translations.${locale}.slug`, slug)
  }
  
  // Validation des traductions
  const getTranslationStatus = (locale: SupportedLocale) => {
    const translation = watchedTranslations[locale]
    if (!translation?.title) return 'empty'
    if (!translation.published) return 'draft'
    return 'published'
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'empty': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Copie du contenu vers d'autres langues
  const copyToLanguages = (sourceLocale: SupportedLocale) => {
    const sourceContent = watchedTranslations[sourceLocale]
    
    Object.keys(SUPPORTED_LOCALES).forEach(targetLocale => {
      if (targetLocale !== sourceLocale) {
        form.setValue(`translations.${targetLocale as SupportedLocale}`, {
          ...sourceContent,
          published: false // Ne pas publier automatiquement
        })
      }
    })
  }
  
  const handleSubmit = async (data: z.infer<typeof multilingualContentSchema>) => {
    setSaving(true)
    try {
      await onSave({
        ...content,
        ...data,
        id: content?.id,
        lastModified: new Date().toISOString()
      })
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* En-tête avec actions globales */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {content?.id ? 'Modifier' : 'Créer'} {contentType}
          </h2>
          <p className="text-gray-600 mt-1">
            Gérez le contenu dans toutes les langues supportées
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => copyToLanguages(activeLocale)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Copier vers autres langues
          </Button>
          
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
      
      {/* Onglets par langue */}
      <Tabs value={activeLocale} onValueChange={(value) => setActiveLocale(value as SupportedLocale)}>
        <TabsList className="grid grid-cols-5 w-full">
          {Object.entries(SUPPORTED_LOCALES).map(([locale, localeData]) => {
            const status = getTranslationStatus(locale as SupportedLocale)
            
            return (
              <TabsTrigger 
                key={locale} 
                value={locale}
                className="flex items-center gap-2"
              >
                <span className="text-lg">{localeData.flag}</span>
                <span>{localeData.nativeName}</span>
                <Badge className={`text-xs ${getStatusColor(status)}`}>
                  {status}
                </Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>
        
        {/* Contenu par langue */}
        {Object.keys(SUPPORTED_LOCALES).map((locale) => (
          <TabsContent key={locale} value={locale} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`title-${locale}`}>Titre *</Label>
                  <Input
                    id={`title-${locale}`}
                    {...form.register(`translations.${locale as SupportedLocale}.title`)}
                    onChange={(e) => {
                      form.setValue(`translations.${locale as SupportedLocale}.title`, e.target.value)
                      handleTitleChange(locale as SupportedLocale, e.target.value)
                    }}
                    placeholder="Titre du contenu..."
                  />
                  {form.formState.errors.translations?.[locale as SupportedLocale]?.title && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {form.formState.errors.translations[locale as SupportedLocale]?.title?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`slug-${locale}`}>Slug *</Label>
                  <Input
                    id={`slug-${locale}`}
                    {...form.register(`translations.${locale as SupportedLocale}.slug`)}
                    placeholder="url-friendly-slug"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    URL: /{locale}/{contentType}s/{watchedTranslations[locale as SupportedLocale]?.slug || 'slug'}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor={`description-${locale}`}>Description</Label>
                  <Textarea
                    id={`description-${locale}`}
                    {...form.register(`translations.${locale as SupportedLocale}.description`)}
                    placeholder="Description courte..."
                    rows={3}
                  />
                </div>
                
                {/* Publication */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`published-${locale}`}
                    {...form.register(`translations.${locale as SupportedLocale}.published`)}
                    className="rounded"
                  />
                  <Label htmlFor={`published-${locale}`}>
                    Publié en {SUPPORTED_LOCALES[locale as SupportedLocale].nativeName}
                  </Label>
                </div>
              </div>
              
              {/* SEO */}
              <div className="space-y-4">
                <h3 className="font-semibold">Optimisation SEO</h3>
                
                <div>
                  <Label htmlFor={`meta-title-${locale}`}>Meta Titre</Label>
                  <Input
                    id={`meta-title-${locale}`}
                    {...form.register(`translations.${locale as SupportedLocale}.metaTitle`)}
                    placeholder="Titre SEO (max 60 caractères)..."
                    maxLength={60}
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    {watchedTranslations[locale as SupportedLocale]?.metaTitle?.length || 0}/60 caractères
                  </p>
                </div>
                
                <div>
                  <Label htmlFor={`meta-description-${locale}`}>Meta Description</Label>
                  <Textarea
                    id={`meta-description-${locale}`}
                    {...form.register(`translations.${locale as SupportedLocale}.metaDescription`)}
                    placeholder="Description SEO (max 160 caractères)..."
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    {watchedTranslations[locale as SupportedLocale]?.metaDescription?.length || 0}/160 caractères
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  {onPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onPreview(locale as SupportedLocale, watchedTranslations[locale as SupportedLocale]?.slug)}
                      disabled={!watchedTranslations[locale as SupportedLocale]?.slug}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Prévisualiser
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Éditeur de contenu riche */}
            {contentType === 'article' && (
              <div>
                <Label>Contenu</Label>
                <div className="mt-2">
                  <RichTextEditor
                    content={watchedTranslations[locale as SupportedLocale]?.content || ''}
                    onChange={(content) => 
                      form.setValue(`translations.${locale as SupportedLocale}.content`, content)
                    }
                    placeholder="Rédigez votre article..."
                  />
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </form>
  )
}

// Utilitaire pour générer des slugs
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Décomposition des caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Suppression des diacritiques
    .replace(/[^a-z0-9\s-]/g, '') // Suppression caractères spéciaux
    .trim()
    .replace(/\s+/g, '-') // Remplacement espaces par tirets
    .replace(/-+/g, '-') // Suppression tirets multiples
}
```

---

## ⚡ Optimisation des Performances i18n

### Lazy Loading des Traductions

```typescript
// lib/i18n/lazy-messages.ts
import { type SupportedLocale } from './config'

interface MessageLoader {
  namespace: string
  locale: SupportedLocale
  loaded: boolean
  messages: Record<string, any>
  promise?: Promise<Record<string, any>>
}

class LazyMessageManager {
  private cache: Map<string, MessageLoader> = new Map()
  private baseUrl: string
  
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_I18N_BASE_URL || '/i18n'
  }
  
  private getCacheKey(namespace: string, locale: SupportedLocale): string {
    return `${namespace}:${locale}`
  }
  
  /**
   * Chargement asynchrone des messages par namespace
   */
  async loadMessages(
    namespace: string,
    locale: SupportedLocale
  ): Promise<Record<string, any>> {
    const cacheKey = this.getCacheKey(namespace, locale)
    const cached = this.cache.get(cacheKey)
    
    // Retourner cache si disponible
    if (cached?.loaded) {
      return cached.messages
    }
    
    // Éviter les requêtes multiples simultanées
    if (cached?.promise) {
      return cached.promise
    }
    
    // Créer loader
    const loader: MessageLoader = {
      namespace,
      locale,
      loaded: false,
      messages: {},
      promise: this.fetchMessages(namespace, locale)
    }
    
    this.cache.set(cacheKey, loader)
    
    try {
      const messages = await loader.promise
      loader.messages = messages
      loader.loaded = true
      delete loader.promise
      
      return messages
    } catch (error) {
      this.cache.delete(cacheKey)
      throw error
    }
  }
  
  private async fetchMessages(
    namespace: string,
    locale: SupportedLocale
  ): Promise<Record<string, any>> {
    
    // Tentative cache navigateur d'abord
    const cached = this.getFromBrowserCache(namespace, locale)
    if (cached) {
      return cached
    }
    
    try {
      // Chargement depuis API ou fichiers statiques
      const response = await fetch(`${this.baseUrl}/${locale}/${namespace}.json`, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache 1h
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to load ${namespace} for ${locale}: ${response.status}`)
      }
      
      const messages = await response.json()
      
      // Cache navigateur
      this.setBrowserCache(namespace, locale, messages)
      
      return messages
    } catch (error) {
      // Fallback vers langue par défaut si échec
      if (locale !== 'fr') {
        console.warn(`Failed to load ${namespace} for ${locale}, falling back to French`)
        return this.fetchMessages(namespace, 'fr')
      }
      
      throw error
    }
  }
  
  /**
   * Préchargement de namespaces critiques
   */
  async preloadCriticalMessages(locale: SupportedLocale): Promise<void> {
    const criticalNamespaces = ['common', 'navigation', 'errors']
    
    await Promise.allSettled(
      criticalNamespaces.map(namespace => 
        this.loadMessages(namespace, locale)
      )
    )
  }
  
  /**
   * Préchargement conditionnel basé sur la route
   */
  async preloadRouteMessages(
    route: string, 
    locale: SupportedLocale
  ): Promise<void> {
    const routeNamespaces = this.getNamespacesForRoute(route)
    
    await Promise.allSettled(
      routeNamespaces.map(namespace => 
        this.loadMessages(namespace, locale)
      )
    )
  }
  
  private getNamespacesForRoute(route: string): string[] {
    const routeMap: Record<string, string[]> = {
      '/products': ['products', 'cart'],
      '/cart': ['cart', 'checkout'],
      '/checkout': ['checkout', 'payment'],
      '/profile': ['profile', 'auth'],
      '/admin': ['admin', 'forms'],
      '/magazine': ['magazine', 'content'],
      '/markets': ['markets', 'location']
    }
    
    // Correspondance exacte
    if (routeMap[route]) {
      return routeMap[route]
    }
    
    // Correspondance partielle
    const matchingRoute = Object.keys(routeMap).find(pattern => 
      route.startsWith(pattern)
    )
    
    return matchingRoute ? routeMap[matchingRoute] : []
  }
  
  private getFromBrowserCache(
    namespace: string, 
    locale: SupportedLocale
  ): Record<string, any> | null {
    try {
      if (typeof window === 'undefined') return null
      
      const cached = localStorage.getItem(`i18n_${namespace}_${locale}`)
      if (!cached) return null
      
      const { data, timestamp, ttl } = JSON.parse(cached)
      
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(`i18n_${namespace}_${locale}`)
        return null
      }
      
      return data
    } catch {
      return null
    }
  }
  
  private setBrowserCache(
    namespace: string,
    locale: SupportedLocale,
    data: Record<string, any>
  ): void {
    try {
      if (typeof window === 'undefined') return
      
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: 60 * 60 * 1000 // 1 heure
      }
      
      localStorage.setItem(`i18n_${namespace}_${locale}`, JSON.stringify(cacheData))
    } catch {
      // Ignore cache failures
    }
  }
  
  /**
   * Nettoyage du cache expiré
   */
  cleanExpiredCache(): void {
    if (typeof window === 'undefined') return
    
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('i18n_')) continue
      
      try {
        const cached = JSON.parse(localStorage.getItem(key)!)
        if (Date.now() - cached.timestamp > cached.ttl) {
          keysToRemove.push(key)
        }
      } catch {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }
  
  /**
   * Statistiques du cache
   */
  getCacheStats(): {
    totalLoaders: number
    loadedNamespaces: number
    cacheHitRate: number
    memoryUsage: number
  } {
    const totalLoaders = this.cache.size
    const loadedNamespaces = Array.from(this.cache.values())
      .filter(loader => loader.loaded).length
    
    return {
      totalLoaders,
      loadedNamespaces,
      cacheHitRate: totalLoaders > 0 ? loadedNamespaces / totalLoaders : 0,
      memoryUsage: this.estimateMemoryUsage()
    }
  }
  
  private estimateMemoryUsage(): number {
    let totalSize = 0
    
    this.cache.forEach(loader => {
      if (loader.loaded) {
        totalSize += JSON.stringify(loader.messages).length
      }
    })
    
    return totalSize
  }
}

// Instance globale
export const lazyMessageManager = new LazyMessageManager()

/**
 * Hook pour chargement lazy des messages
 */
export function useLazyMessages(namespace: string) {
  const locale = useLocale() as SupportedLocale
  const [messages, setMessages] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    let mounted = true
    
    const loadMessages = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const loadedMessages = await lazyMessageManager.loadMessages(namespace, locale)
        
        if (mounted) {
          setMessages(loadedMessages)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load messages'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    loadMessages()
    
    return () => {
      mounted = false
    }
  }, [namespace, locale])
  
  return { messages, loading, error }
}

/**
 * Hook pour préchargement route
 */
export function useRoutePreload() {
  const locale = useLocale() as SupportedLocale
  const pathname = usePathname()
  
  useEffect(() => {
    // Préchargement des messages pour la route actuelle
    lazyMessageManager.preloadRouteMessages(pathname, locale)
    
    // Nettoyage périodique du cache
    const cleanupInterval = setInterval(() => {
      lazyMessageManager.cleanExpiredCache()
    }, 10 * 60 * 1000) // 10 minutes
    
    return () => clearInterval(cleanupInterval)
  }, [pathname, locale])
}
```

---

Cette documentation complète d'internationalisation fournit un framework robuste pour supporter multiple langues dans HerbisVeritas V2, avec des optimisations de performance et une expérience utilisateur native pour chaque locale.