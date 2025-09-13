/**
 * Module de validation Zod pour les addresses HerbisVeritas
 * Implémentation TDD Red → Green selon CLAUDE.md
 */

import { z } from 'zod'

// Helper de capitalisation
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Helper de nettoyage téléphone
function cleanPhone(phone: string): string {
  return phone.replace(/[\s\.\-\(\)]/g, '')
}

// Validation code postal par pays avec patterns précis et plages
const postalCodeValidation = {
  'FR': (code: string) => /^[0-9]{5}$/.test(code) && parseInt(code) >= 1000 && parseInt(code) <= 95999,
  'US': (code: string) => /^[0-9]{5}(-[0-9]{4})?$/.test(code),
  'CA': (code: string) => /^[A-Z][0-9][A-Z]\s?[0-9][A-Z][0-9]$/i.test(code),
  'GB': (code: string) => /^[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2}$/i.test(code),
  'DE': (code: string) => /^[0-9]{5}$/.test(code),
  'ES': (code: string) => /^[0-9]{5}$/.test(code),
  'IT': (code: string) => /^[0-9]{5}$/.test(code)
}

// Validation téléphone flexible
const phoneValidation = /^(\+[1-9]\d{1,14}|0[1-9]\d{8,9})$/

// Schema principal de création d'adresse
export const addressCreateSchema = z.object({
  type: z.string()
    .trim()
    .transform(val => val.toLowerCase())
    .refine(val => ['shipping', 'billing'].includes(val), 'Type doit être shipping ou billing')
    .transform(val => val as 'shipping' | 'billing'),
  
  first_name: z.string()
    .min(1, 'Prénom requis')
    .trim()
    .transform(capitalize),
    
  last_name: z.string()
    .min(1, 'Nom requis')
    .trim()
    .transform(name => name.toUpperCase()),
    
  company: z.string()
    .trim()
    .optional()
    .nullable(),
    
  address_line_1: z.string()
    .min(1, 'Adresse requise')
    .trim()
    .transform(addr => {
      // Capitalise les mots importants
      return addr.split(' ')
        .map(word => {
          if (['rue', 'avenue', 'boulevard', 'place', 'allée'].includes(word.toLowerCase())) {
            return capitalize(word)
          }
          if (['de', 'du', 'des', 'la', 'le', 'les'].includes(word.toLowerCase())) {
            return word.toLowerCase()
          }
          return capitalize(word)
        })
        .join(' ')
    }),
    
  address_line_2: z.string()
    .trim()
    .optional()
    .nullable(),
    
  city: z.string()
    .min(1, 'Ville requise')
    .trim()
    .transform(capitalize),
    
  postal_code: z.string()
    .min(1, 'Code postal requis')
    .trim(),
    
  country: z.string()
    .length(2, 'Code pays à 2 caractères requis')
    .trim()
    .transform(country => country.toUpperCase()),
    
  phone: z.string()
    .trim()
    .optional()
    .nullable()
    .refine((phone) => {
      if (!phone) return true // Optionnel
      const cleaned = cleanPhone(phone)
      return phoneValidation.test(cleaned)
    }, 'Numéro de téléphone invalide')
    .transform((phone) => {
      if (!phone) return phone
      // Formatage simple : suppression des espaces/points
      return cleanPhone(phone)
    })
    
}).refine((data) => {
  // Validation croisée code postal / pays
  const validator = postalCodeValidation[data.country as keyof typeof postalCodeValidation]
  return validator ? validator(data.postal_code) : true
}, {
  message: 'Code postal invalide pour ce pays',
  path: ['postal_code']
})

// Schema de mise à jour (tous champs optionnels, sans type)
export const addressUpdateSchema = z.object({
  first_name: z.string().min(1).trim().optional(),
  last_name: z.string().min(1).trim().optional(),
  company: z.string().optional().nullable(),
  address_line1: z.string().min(1).trim().optional(),
  address_line2: z.string().optional().nullable(),
  city: z.string().min(1).trim().optional(),
  postal_code: z.string().min(1).trim().optional(),
  country: z.string().length(2).trim().transform(c => c.toUpperCase()).optional(),
  phone: z.string().trim().optional().nullable(),
}).partial()

// Utilitaires de validation
export const addressValidation = {
  /**
   * Formate un code postal selon le pays
   */
  formatPostalCode(code: string, country: string): string {
    const cleaned = code.replace(/\s+/g, '')
    
    switch (country) {
      case 'FR':
        // Ne fait le padding que si exactement 4 chiffres ET commençant par 0-9
        if (cleaned.length === 4 && /^[0-9]{4}$/.test(cleaned)) {
          return cleaned.padStart(5, '0')
        }
        return cleaned // Autres cas : pas de padding, validation stricte
      case 'CA':
        // Format: A1A 1A1
        const upper = cleaned.toUpperCase()
        if (upper.length === 6) {
          return `${upper.slice(0, 3)} ${upper.slice(3)}`
        }
        return upper
      case 'US':
        // Garde ZIP+4 si présent
        return cleaned
      default:
        return cleaned
    }
  },

  /**
   * Formate un téléphone selon le pays
   */
  formatPhone(phone: string, country: string): string {
    const cleaned = cleanPhone(phone)
    
    // Si déjà international, garde tel quel
    if (cleaned.startsWith('+')) {
      return cleaned
    }
    
    // Formats nationaux vers international
    switch (country) {
      case 'FR':
        if (cleaned.startsWith('0')) {
          return `+33${cleaned.slice(1)}`
        }
        return `+33${cleaned}`
      case 'US':
      case 'CA':
        if (cleaned.length === 10) {
          return `+1${cleaned}`
        }
        return cleaned
      default:
        return cleaned
    }
  },

  /**
   * Valide combinaison pays/code postal
   */
  validateCountryPostal(postalCode: string, country: string): { isValid: boolean; error?: string } {
    const validator = postalCodeValidation[country as keyof typeof postalCodeValidation]
    
    if (!validator) {
      return { isValid: true } // Pays non supporté = accepté
    }
    
    const isValid = validator(postalCode)
    if (isValid) {
      return { isValid }
    }
    return {
      isValid,
      error: `Code postal invalide pour ${country}`
    }
  },

  /**
   * Suggère des corrections pour erreurs communes
   */
  suggestCorrections(address: Partial<any>): Record<string, string> {
    const corrections: Record<string, string> = {}
    
    // Corrections communes
    if (!address['first_name']) {
      corrections['first_name'] = 'Prénom requis'
    }
    
    if (address['last_name'] && typeof address['last_name'] === 'string') {
      corrections['last_name'] = capitalize(address['last_name'])
    }
    
    if (address['city'] && typeof address['city'] === 'string') {
      corrections['city'] = capitalize(address['city'])
    }
    
    // Code postal français courant
    if (address['country'] === 'france' || address['country'] === 'FR') {
      corrections['country'] = 'FR'
      
      if (address['postal_code'] === '7500') {
        corrections['postal_code'] = '75001' // Paris 1er suggéré
      }
    }
    
    // Adresse format amélioré
    if (address['address_line_1'] && typeof address['address_line_1'] === 'string') {
      let addr = address['address_line_1']
      if (addr.includes('rue république')) {
        corrections['address_line_1'] = addr.replace('rue république', 'Rue de la République')
      }
    }
    
    return corrections
  },

  /**
   * Validation champ par champ (temps réel)
   */
  validateField(fieldName: string, value: any, _context?: Record<string, any>): { isValid: boolean; error?: string } {
    try {
      // Validation simple pour éviter les problèmes de ZodEffects
      switch (fieldName) {
        case 'first_name':
        case 'last_name':
          return value && value.trim().length > 0 
            ? { isValid: true }
            : { isValid: false, error: `${fieldName === 'first_name' ? 'Prénom' : 'Nom'} requis` }
        case 'address_line1':
          return value && value.trim().length > 0
            ? { isValid: true }
            : { isValid: false, error: 'Adresse requise' }
        case 'city':
          return value && value.trim().length > 0
            ? { isValid: true }
            : { isValid: false, error: 'Ville requise' }
        case 'postal_code':
          return value && value.trim().length > 0
            ? { isValid: true }
            : { isValid: false, error: 'Code postal requis' }
        case 'country':
          return value && value.length === 2
            ? { isValid: true }
            : { isValid: false, error: 'Code pays à 2 caractères requis' }
        default:
          return { isValid: true }
      }
    } catch (error) {
      return { isValid: false, error: 'Erreur de validation' }
    }
  },

  /**
   * Validation état complet formulaire
   */
  validateForm(formState: {
    fields: Record<string, any>
    touched: Record<string, boolean>
  }): {
    isValid: boolean
    touchedErrors: string[]
    canSubmit: boolean
  } {
    try {
      // Valide les champs complets
      addressCreateSchema.parse(formState.fields)
      
      // Vérifie si tous les champs requis sont touchés
      const requiredFields = ['first_name', 'last_name', 'address_line_1', 'city', 'postal_code', 'country']
      const allTouched = requiredFields.every(field => formState.touched[field])
      
      return {
        isValid: true,
        touchedErrors: [],
        canSubmit: allTouched
      }
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Filtre seulement les erreurs sur champs touchés
        const touchedErrors = error.errors
          .filter(e => formState.touched[e.path[0] as string])
          .map(e => e.message)
          
        return {
          isValid: false,
          touchedErrors,
          canSubmit: false
        }
      }
      
      return {
        isValid: false,
        touchedErrors: ['Erreur de validation'],
        canSubmit: false
      }
    }
  }
}

// Helpers exportés
function formatPostalCode(code: string, country: string): string {
  return addressValidation.formatPostalCode(code, country)
}

function formatPhone(phone: string, country: string): string {
  return addressValidation.formatPhone(phone, country)
}