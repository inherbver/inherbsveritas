/**
 * Service d'addresses HerbisVeritas
 * Implémentation TDD Red → Green selon CLAUDE.md
 */

import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'

// Types d'address supportés
type AddressType = 'shipping' | 'billing'

// Interface base address
interface Address {
  id: string
  user_id: string
  type: AddressType
  is_default: boolean
  first_name: string
  last_name: string
  company?: string | null
  address_line_1: string
  address_line_2?: string | null
  city: string
  postal_code: string
  country: string
  phone?: string | null
  created_at: string
  updated_at: string
}

// Schema de validation pour création
const addressCreateSchema = z.object({
  type: z.enum(['shipping', 'billing']),
  first_name: z.string().min(1, 'Prénom requis').trim(),
  last_name: z.string().min(1, 'Nom requis').trim(),
  company: z.string().optional().nullable(),
  address_line_1: z.string().min(1, 'Adresse requise').trim(),
  address_line_2: z.string().optional().nullable(),
  city: z.string().min(1, 'Ville requise').trim(),
  postal_code: z.string().min(1, 'Code postal requis').trim(),
  country: z.string().length(2, 'Code pays à 2 caractères requis').toUpperCase(),
  phone: z.string().optional().nullable()
}).refine(
  (data) => validatePostalCodeByCountry(data.postal_code, data.country),
  { message: 'Code postal invalide pour ce pays', path: ['postal_code'] }
)

// Schema pour mise à jour (tous champs optionnels sauf contraintes métier)  
const addressUpdateSchema = z.object({
  type: z.enum(['shipping', 'billing']).optional(),
  first_name: z.string().min(1).trim().optional(),
  last_name: z.string().min(1).trim().optional(),
  company: z.string().optional().nullable(),
  address_line_1: z.string().min(1).trim().optional(),
  address_line_2: z.string().optional().nullable(),
  city: z.string().min(1).trim().optional(),
  postal_code: z.string().min(1).trim().optional(),
  country: z.string().length(2).toUpperCase().optional(),
  phone: z.string().optional().nullable()
})

// Validation code postal par pays
function validatePostalCodeByCountry(postalCode: string, country: string): boolean {
  const patterns: Record<string, RegExp> = {
    'FR': /^[0-9]{5}$/,           // France: 5 chiffres
    'US': /^[0-9]{5}(-[0-9]{4})?$/, // USA: 5 chiffres ou ZIP+4
    'CA': /^[A-Z][0-9][A-Z]\s?[0-9][A-Z][0-9]$/i, // Canada: format postal
    'GB': /^[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2}$/i // UK
  }

  const pattern = patterns[country]
  return pattern ? pattern.test(postalCode) : true // Pays non supportés = validé
}

// Types de retour
interface AddressResult {
  success: boolean
  address?: Address | null
  error?: string | null
  promotedNewDefault?: boolean
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

class AddressService {
  private supabase = createClient()

  /**
   * Crée une nouvelle adresse
   */
  async createAddress(
    userId: string, 
    addressData: Omit<Address, 'id' | 'user_id' | 'is_default' | 'created_at' | 'updated_at'>
  ): Promise<AddressResult> {
    try {
      // Validation input
      const validated = addressCreateSchema.parse(addressData)

      // Vérifier si c'est la première adresse (devient par défaut)
      const { data: existingAddresses } = await this.supabase
        .from('addresses')
        .select('id')
        .eq('user_id', userId)
        .eq('type', validated.type)

      const isFirstAddress = !existingAddresses || existingAddresses.length === 0

      // Insérer la nouvelle adresse
      const { data, error } = await this.supabase
        .from('addresses')
        .insert({
          user_id: userId,
          type: validated.type,
          is_default: isFirstAddress, // Première adresse = défaut
          first_name: validated.first_name,
          last_name: validated.last_name,
          company: validated.company,
          address_line_1: validated.address_line_1,
          address_line_2: validated.address_line_2,
          city: validated.city,
          postal_code: validated.postal_code,
          country: validated.country,
          phone: validated.phone
        })
        .select()

      if (error) {
        return {
          success: false,
          address: null,
          error: error.message
        }
      }

      return {
        success: true,
        address: data[0] as Address,
        error: null
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          address: null,
          error: error.errors[0]?.message || 'Erreur de validation'
        }
      }

      return {
        success: false,
        address: null,
        error: 'Erreur de création d\'adresse'
      }
    }
  }

  /**
   * Récupère toutes les adresses d'un utilisateur
   */
  async getUserAddresses(userId: string): Promise<Address[]> {
    try {
      const { data, error } = await this.supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false }) // Par défaut en premier
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching addresses:', error)
        return []
      }

      return data as Address[]

    } catch (error) {
      console.error('Error in getUserAddresses:', error)
      return []
    }
  }

  /**
   * Met à jour une adresse existante
   */
  async updateAddress(
    userId: string,
    addressId: string,
    updates: Partial<Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<AddressResult> {
    try {
      // Validation des updates
      const validated = addressUpdateSchema.parse(updates)

      // Mettre à jour avec RLS (seulement les adresses du user)
      const { data, error } = await this.supabase
        .from('addresses')
        .update(validated)
        .eq('id', addressId)
        .eq('user_id', userId) // Sécurité supplémentaire
        .select()

      if (error) {
        return {
          success: false,
          address: null,
          error: error.message
        }
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          address: null,
          error: 'Adresse non trouvée ou accès refusé'
        }
      }

      return {
        success: true,
        address: data[0] as Address,
        error: null
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          address: null,
          error: error.errors[0]?.message || 'Erreur de validation'
        }
      }

      return {
        success: false,
        address: null,
        error: 'Erreur de mise à jour d\'adresse'
      }
    }
  }

  /**
   * Supprime une adresse
   */
  async deleteAddress(userId: string, addressId: string): Promise<AddressResult & { promotedNewDefault?: boolean }> {
    try {
      // Vérifier si l'adresse à supprimer est par défaut
      const { data: addressToDelete } = await this.supabase
        .from('addresses')
        .select('type, is_default')
        .eq('id', addressId)
        .eq('user_id', userId)
        .single()

      if (!addressToDelete) {
        return {
          success: false,
          error: 'Adresse non trouvée'
        }
      }

      // Supprimer l'adresse
      const { error } = await this.supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId)

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      let promotedNewDefault = false

      // Si c'était l'adresse par défaut, promouvoir une autre
      if (addressToDelete.is_default) {
        const { data: otherAddresses } = await this.supabase
          .from('addresses')
          .select('id')
          .eq('user_id', userId)
          .eq('type', addressToDelete.type)
          .neq('id', addressId)
          .limit(1)

        if (otherAddresses && otherAddresses.length > 0) {
          await this.supabase
            .from('addresses')
            .update({ is_default: true })
            .eq('id', otherAddresses[0]?.id)
            .eq('user_id', userId)

          promotedNewDefault = true
        }
      }

      return {
        success: true,
        promotedNewDefault
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de suppression'
      }
    }
  }

  /**
   * Définit une adresse comme par défaut
   */
  async setDefaultAddress(userId: string, addressId: string, type: AddressType): Promise<AddressResult> {
    try {
      // D'abord, désactiver toutes les adresses par défaut du même type
      await this.supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('type', type)

      // Puis activer la nouvelle adresse par défaut
      const { data, error } = await this.supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()

      if (error) {
        return {
          success: false,
          address: null,
          error: error.message
        }
      }

      return {
        success: true,
        address: data[0] as Address,
        error: null
      }

    } catch (error) {
      return {
        success: false,
        address: null,
        error: 'Erreur de mise à jour adresse par défaut'
      }
    }
  }

  /**
   * Récupère l'adresse par défaut d'un type
   */
  async getDefaultAddress(userId: string, type: AddressType): Promise<Address | null> {
    try {
      const { data, error } = await this.supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .eq('is_default', true)
        .single()

      if (error) return null

      return data as Address

    } catch (error) {
      return null
    }
  }

  /**
   * Valide une adresse
   */
  validateAddress(address: Partial<Address>): ValidationResult {
    try {
      addressCreateSchema.parse(address)
      return { isValid: true, errors: [] }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => e.message)
        }
      }
      return { isValid: false, errors: ['Erreur de validation'] }
    }
  }
}

// Instance singleton
export const addressService = new AddressService()
export type { Address, AddressType, AddressResult, ValidationResult }