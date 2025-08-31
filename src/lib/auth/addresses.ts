/**
 * Système d'Addresses - HerbisVeritas V2 MVP
 * CRUD addresses utilisateur avec validation Zod
 * TDD Implementation
 */

import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'

// ============================================================================
// TYPES & SCHEMAS ZOD
// ============================================================================

export const AddressTypeSchema = z.enum(['billing', 'shipping'])
export type AddressType = z.infer<typeof AddressTypeSchema>

export const CreateAddressSchema = z.object({
  user_id: z.string().uuid(),
  type: AddressTypeSchema,
  first_name: z.string().min(1, 'Prénom requis').max(50),
  last_name: z.string().min(1, 'Nom requis').max(50),
  street_address: z.string().min(1, 'Adresse requise').max(255),
  street_address_2: z.string().max(255).optional(),
  city: z.string().min(1, 'Ville requise').max(100),
  postal_code: z.string().min(3, 'Code postal requis').max(20),
  country: z.string().min(1, 'Pays requis').max(100).default('France'),
  phone: z.string().max(20).optional(),
  is_default: z.boolean().default(false)
})

export const UpdateAddressSchema = CreateAddressSchema.partial().omit(['user_id'])

export type CreateAddressData = z.infer<typeof CreateAddressSchema>
export type UpdateAddressData = z.infer<typeof UpdateAddressSchema>

export interface Address extends CreateAddressData {
  id: string
  created_at: string
  updated_at: string
}

export interface AddressResult<T = Address> {
  success: boolean
  data?: T
  error?: string
}

export interface AddressListResult {
  success: boolean
  data?: Address[]
  error?: string
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Créer une nouvelle adresse
 * TDD: Validation + gestion is_default
 */
export async function createAddress(addressData: CreateAddressData): Promise<AddressResult> {
  try {
    // Validation Zod
    const validationResult = CreateAddressSchema.safeParse(addressData)
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues.map(issue => issue.message).join(', ')
      }
    }

    const supabase = createClient()
    const validatedData = validationResult.data

    // Si is_default = true, unset les autres addresses par défaut
    if (validatedData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', validatedData.user_id)
        .eq('type', validatedData.type)
    }

    // Créer la nouvelle adresse
    const { data, error } = await supabase
      .from('addresses')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: data as Address
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Récupérer toutes les addresses d'un utilisateur
 * TDD: Triées par is_default desc, puis created_at desc
 */
export async function getUserAddresses(userId: string): Promise<AddressListResult> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: (data as Address[]) || []
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Mettre à jour une adresse
 * TDD: Validation partielle + gestion is_default
 */
export async function updateAddress(addressId: string, updateData: UpdateAddressData): Promise<AddressResult> {
  try {
    // Validation Zod
    const validationResult = UpdateAddressSchema.safeParse(updateData)
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues.map(issue => issue.message).join(', ')
      }
    }

    const supabase = createClient()
    const validatedData = validationResult.data

    // Si is_default = true, récupérer l'adresse pour unset les autres
    if (validatedData.is_default) {
      const { data: addressInfo } = await supabase
        .from('addresses')
        .select('user_id, type')
        .eq('id', addressId)
        .single()

      if (addressInfo) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', addressInfo.user_id)
          .eq('type', addressInfo.type)
          .neq('id', addressId)
      }
    }

    // Mettre à jour l'adresse
    const { data, error } = await supabase
      .from('addresses')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', addressId)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: data as Address
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Supprimer une adresse
 * TDD: Vérification existence + protection address par défaut
 */
export async function deleteAddress(addressId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Vérifier que l'adresse existe
    const { data: existingAddress, error: selectError } = await supabase
      .from('addresses')
      .select('id, is_default')
      .eq('id', addressId)

    if (selectError) {
      return {
        success: false,
        error: selectError.message
      }
    }

    if (!existingAddress || existingAddress.length === 0) {
      return {
        success: false,
        error: 'Address not found'
      }
    }

    // Protection: empêcher suppression si c'est la seule adresse par défaut
    if (existingAddress[0].is_default) {
      const { data: userAddresses } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', (existingAddress[0] as any).user_id)

      if (userAddresses && userAddresses.length === 1) {
        return {
          success: false,
          error: 'Cannot delete the only address'
        }
      }
    }

    // Supprimer l'adresse
    const { error: deleteError } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message
      }
    }

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Définir une adresse comme par défaut
 * TDD: Sécurité user_id + unset autres defaults
 */
export async function setDefaultAddress(addressId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Vérifier que l'adresse appartient à l'utilisateur
    const { data: addressInfo, error: selectError } = await supabase
      .from('addresses')
      .select('id, user_id, type')
      .eq('id', addressId)
      .single()

    if (selectError || !addressInfo) {
      return {
        success: false,
        error: 'Address not found'
      }
    }

    if (addressInfo.user_id !== userId) {
      return {
        success: false,
        error: 'Unauthorized access to address'
      }
    }

    // Unset toutes les autres addresses par défaut du même type
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('type', addressInfo.type)
      .neq('id', addressId)

    // Set cette adresse comme par défaut
    const { error: updateError } = await supabase
      .from('addresses')
      .update({ 
        is_default: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', addressId)

    if (updateError) {
      return {
        success: false,
        error: updateError.message
      }
    }

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Récupérer l'adresse par défaut d'un utilisateur pour un type
 */
export async function getDefaultAddress(userId: string, type: AddressType): Promise<AddressResult> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('is_default', true)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: data as Address
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Valider une adresse (check format postal code selon pays)
 */
export function validateAddressData(addressData: Partial<CreateAddressData>): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = []

  // Validation code postal français
  if (addressData.country === 'France' && addressData.postal_code) {
    const frenchPostalRegex = /^[0-9]{5}$/
    if (!frenchPostalRegex.test(addressData.postal_code)) {
      errors.push('Code postal français invalide (format: 12345)')
    }
  }

  // Validation numéro de téléphone français
  if (addressData.phone && addressData.country === 'France') {
    const frenchPhoneRegex = /^(\+33|0)[1-9](\d{8})$/
    if (!frenchPhoneRegex.test(addressData.phone.replace(/\s/g, ''))) {
      errors.push('Numéro de téléphone français invalide')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}