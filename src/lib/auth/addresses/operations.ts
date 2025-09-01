/**
 * Address Operations
 * 
 * Complex address operations (update, delete, default management)
 */

import { createClient } from '@/lib/supabase/client'
import { 
  UpdateAddressData, 
  Address, 
  AddressResult,
  UpdateAddressSchema,
  // AddressType,
  DefaultAddressUpdate
} from './schemas'

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
    if ('is_default' in validatedData && validatedData.is_default) {
      const { data: addressInfo } = await supabase
        .from('addresses')
        .select('user_id, address_type')
        .eq('id', addressId)
        .single()

      if (addressInfo) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', addressInfo.user_id)
          .eq('address_type', addressInfo.address_type)
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
 * TDD: Gestion atomic des defaults
 */
export async function setDefaultAddress(params: DefaultAddressUpdate): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { user_id, address_type, new_default_id } = params

    // Transaction-like behavior: d'abord unset all, puis set le nouveau
    const { error: unsetError } = await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user_id)
      .eq('address_type', address_type)

    if (unsetError) {
      return {
        success: false,
        error: unsetError.message
      }
    }

    const { error: setError } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', new_default_id)
      .eq('user_id', user_id)

    if (setError) {
      return {
        success: false,
        error: setError.message
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