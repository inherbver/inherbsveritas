/**
 * Schémas Zod pour les formulaires profil utilisateur - HerbisVeritas V2 MVP
 * 
 * Validation des données personnelles utilisateur avec transformation et sécurité
 */

import { z } from 'zod'

// Helper de capitalisation pour noms
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Helper de nettoyage téléphone
function cleanPhone(phone: string): string {
  return phone.replace(/[\s\.\-\(\)]/g, '')
}

// Validation téléphone international flexible
const phoneValidation = /^(\+[1-9]\d{1,14}|0[1-9]\d{8,9})$/

/**
 * Schéma pour mise à jour profil utilisateur
 */
export const userProfileUpdateSchema = z.object({
  first_name: z.string()
    .min(1, 'Prénom requis')
    .min(2, 'Prénom trop court (min. 2 caractères)')
    .max(50, 'Prénom trop long (max. 50 caractères)')
    .trim()
    .transform(capitalize),
    
  last_name: z.string()
    .min(1, 'Nom requis')
    .min(2, 'Nom trop court (min. 2 caractères)')
    .max(50, 'Nom trop long (max. 50 caractères)')
    .trim()
    .transform(name => name.toUpperCase()),
    
  email: z.string()
    .min(1, 'Email requis')
    .email('Format email invalide')
    .max(254, 'Email trop long')
    .trim()
    .toLowerCase(),
    
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
      return cleanPhone(phone)
    }),
    
  birth_date: z.string()
    .optional()
    .nullable()
    .refine((date) => {
      if (!date) return true // Optionnel
      const parsed = new Date(date)
      return !isNaN(parsed.getTime())
    }, 'Date de naissance invalide')
    .refine((date) => {
      if (!date) return true
      const parsed = new Date(date)
      const now = new Date()
      const age = now.getFullYear() - parsed.getFullYear()
      return age >= 13 && age <= 120
    }, 'Âge doit être entre 13 et 120 ans'),
    
  preferred_language: z.string()
    .optional()
    .default('fr')
    .refine(lang => ['fr', 'en'].includes(lang), 'Langue non supportée (fr/en uniquement)')
    .transform(lang => lang as 'fr' | 'en'),
    
  newsletter_consent: z.boolean()
    .optional()
    .default(false),
    
  marketing_consent: z.boolean()
    .optional()
    .default(false)
})

/**
 * Schéma pour changement de mot de passe
 */
export const passwordChangeSchema = z.object({
  current_password: z.string()
    .min(1, 'Mot de passe actuel requis'),
    
  new_password: z.string()
    .min(8, 'Nouveau mot de passe trop court (min. 8 caractères)')
    .max(128, 'Nouveau mot de passe trop long (max. 128 caractères)')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),
    
  confirm_new_password: z.string()
    .min(1, 'Confirmation requise')
    
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: 'Les nouveaux mots de passe ne correspondent pas',
  path: ['confirm_new_password']
}).refine((data) => data.current_password !== data.new_password, {
  message: 'Le nouveau mot de passe doit être différent de l\'actuel',
  path: ['new_password']
})

/**
 * Schéma pour suppression de compte
 */
export const accountDeletionSchema = z.object({
  password: z.string()
    .min(1, 'Mot de passe requis pour confirmer la suppression'),
    
  confirmation: z.string()
    .min(1, 'Veuillez taper "SUPPRIMER" pour confirmer')
    .refine(val => val === 'SUPPRIMER', 'Veuillez taper exactement "SUPPRIMER"'),
    
  reason: z.string()
    .optional()
    .max(500, 'Raison trop longue (max. 500 caractères)')
})

/**
 * Types TypeScript inférés
 */
export type UserProfileUpdateData = z.infer<typeof userProfileUpdateSchema>
export type PasswordChangeData = z.infer<typeof passwordChangeSchema>
export type AccountDeletionData = z.infer<typeof accountDeletionSchema>

/**
 * Interface erreurs de validation
 */
export interface UserProfileFormErrors {
  [key: string]: string
}

/**
 * Utilitaires de validation
 */
export const userProfileValidation = {
  /**
   * Valide formulaire profil et retourne erreurs
   */
  validateProfile(formData: UserProfileUpdateData): UserProfileFormErrors {
    try {
      userProfileUpdateSchema.parse(formData)
      return {}
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: UserProfileFormErrors = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message
          }
        })
        return errors
      }
      return { form: 'Erreur de validation inattendue' }
    }
  },

  /**
   * Valide changement mot de passe
   */
  validatePasswordChange(formData: PasswordChangeData): UserProfileFormErrors {
    try {
      passwordChangeSchema.parse(formData)
      return {}
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: UserProfileFormErrors = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message
          }
        })
        return errors
      }
      return { form: 'Erreur de validation inattendue' }
    }
  },

  /**
   * Valide suppression compte
   */
  validateAccountDeletion(formData: AccountDeletionData): UserProfileFormErrors {
    try {
      accountDeletionSchema.parse(formData)
      return {}
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: UserProfileFormErrors = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message
          }
        })
        return errors
      }
      return { form: 'Erreur de validation inattendue' }
    }
  },

  /**
   * Évalue force mot de passe
   */
  getPasswordStrength(password: string): {
    score: number
    label: string
    color: string
    suggestions: string[]
  } {
    let score = 0
    const suggestions: string[] = []
    
    if (password.length >= 8) score++
    else suggestions.push('Au moins 8 caractères')
    
    if (password.length >= 12) score++
    else suggestions.push('12+ caractères recommandés')
    
    if (/[a-z]/.test(password)) score++
    else suggestions.push('Ajouter des minuscules')
    
    if (/[A-Z]/.test(password)) score++
    else suggestions.push('Ajouter des majuscules')
    
    if (/\d/.test(password)) score++
    else suggestions.push('Ajouter des chiffres')
    
    if (/[^a-zA-Z\d]/.test(password)) score++
    else suggestions.push('Ajouter des symboles (!@#$...)')
    
    // Mappage score vers évaluation
    if (score <= 1) return { score, label: 'Très faible', color: 'red', suggestions }
    if (score <= 2) return { score, label: 'Faible', color: 'orange', suggestions }
    if (score <= 3) return { score, label: 'Moyen', color: 'yellow', suggestions }
    if (score <= 4) return { score, label: 'Fort', color: 'blue', suggestions }
    return { score, label: 'Très fort', color: 'green', suggestions: [] }
  },

  /**
   * Formate téléphone selon pays
   */
  formatPhone(phone: string, country: string = 'FR'): string {
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
   * Validation temps réel champ par champ
   */
  validateField(fieldName: string, value: any): { isValid: boolean; error?: string } {
    try {
      switch (fieldName) {
        case 'first_name':
        case 'last_name':
          return value && value.trim().length >= 2 
            ? { isValid: true }
            : { isValid: false, error: `${fieldName === 'first_name' ? 'Prénom' : 'Nom'} trop court (min. 2 caractères)` }
            
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return emailRegex.test(value)
            ? { isValid: true }
            : { isValid: false, error: 'Format email invalide' }
            
        case 'phone':
          if (!value) return { isValid: true } // Optionnel
          const cleaned = cleanPhone(value)
          return phoneValidation.test(cleaned)
            ? { isValid: true }
            : { isValid: false, error: 'Numéro de téléphone invalide' }
            
        case 'birth_date':
          if (!value) return { isValid: true } // Optionnel
          const parsed = new Date(value)
          if (isNaN(parsed.getTime())) {
            return { isValid: false, error: 'Date invalide' }
          }
          const age = new Date().getFullYear() - parsed.getFullYear()
          return age >= 13 && age <= 120
            ? { isValid: true }
            : { isValid: false, error: 'Âge doit être entre 13 et 120 ans' }
            
        default:
          return { isValid: true }
      }
    } catch (error) {
      return { isValid: false, error: 'Erreur de validation' }
    }
  }
}