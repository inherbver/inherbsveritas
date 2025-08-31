/**
 * Address Query Operations
 * 
 * Specialized query functions for address retrieval
 */

import { createClient } from '@/lib/supabase/client'
import { 
  Address, 
  AddressResult, 
  AddressListResult, 
  AddressType,
  AddressQuery,
  AddressQuerySchema
} from './schemas'

/**
 * Récupérer les addresses par type
 * TDD: Filtrage par type + user_id
 */
export async function getAddressesByType(userId: string, addressType: AddressType): Promise<AddressListResult> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('address_type', addressType)
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
 * Récupérer l'adresse par défaut d'un type
 * TDD: Une seule adresse par défaut par type
 */
export async function getDefaultAddress(userId: string, addressType: AddressType): Promise<AddressResult> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('address_type', addressType)
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
 * Vérifier si un utilisateur a des addresses
 * TDD: Count rapide pour validation checkout
 */
export async function hasAddresses(userId: string, addressType?: AddressType): Promise<{ hasAddresses: boolean; count: number }> {
  try {
    const supabase = createClient()

    let query = supabase
      .from('addresses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (addressType) {
      query = query.eq('address_type', addressType)
    }

    const { count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return {
      hasAddresses: (count || 0) > 0,
      count: count || 0
    }
  } catch (error) {
    return {
      hasAddresses: false,
      count: 0
    }
  }
}

/**
 * Recherche d'addresses avec validation
 * TDD: Query complexe avec validation Zod
 */
export async function searchAddresses(query: AddressQuery): Promise<AddressListResult> {
  try {
    // Validation des paramètres
    const validationResult = AddressQuerySchema.safeParse(query)
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues.map(issue => issue.message).join(', ')
      }
    }

    const supabase = createClient()
    const { user_id, address_type } = validationResult.data

    let dbQuery = supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user_id)

    if (address_type) {
      dbQuery = dbQuery.eq('address_type', address_type)
    }

    dbQuery = dbQuery
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    const { data, error } = await dbQuery

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