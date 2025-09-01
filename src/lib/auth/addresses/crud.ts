/**
 * Address CRUD Operations
 * 
 * Database operations for address management
 */

import { createClient } from '@/lib/supabase/client'
import { 
  CreateAddressData, 
  // UpdateAddressData, 
  Address, 
  AddressResult, 
  AddressListResult,
  CreateAddressSchema,
  // UpdateAddressSchema
} from './schemas'

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
        .eq('address_type', validatedData.address_type)
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
 * Récupérer une adresse par ID
 */
export async function getAddressById(addressId: string, userId: string): Promise<AddressResult> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', userId)
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