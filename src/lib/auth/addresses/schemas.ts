/**
 * Address Validation Schemas
 * 
 * Zod schemas for address validation and types
 */

import { z } from 'zod'

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const AddressTypeSchema = z.enum(['billing', 'shipping'])
export type AddressType = z.infer<typeof AddressTypeSchema>

export const CreateAddressSchema = z.object({
  user_id: z.string().uuid(),
  address_type: AddressTypeSchema,
  first_name: z.string().min(1, 'Prénom requis').max(50),
  last_name: z.string().min(1, 'Nom requis').max(50),
  address_line1: z.string().min(1, 'Adresse requise').max(255),
  address_line2: z.string().max(255).optional(),
  city: z.string().min(1, 'Ville requise').max(100),
  postal_code: z.string().min(3, 'Code postal requis').max(20),
  country_code: z.string().min(2).max(3).default('FR'),
  phone_number: z.string().max(20).optional(),
  is_default: z.boolean().default(false)
})

export const UpdateAddressSchema = CreateAddressSchema.partial().omit(['user_id'])

export const AddressQuerySchema = z.object({
  user_id: z.string().uuid(),
  address_type: AddressTypeSchema.optional()
})

// ============================================================================
// TYPES
// ============================================================================

export type CreateAddressData = z.infer<typeof CreateAddressSchema>
export type UpdateAddressData = z.infer<typeof UpdateAddressSchema>
export type AddressQuery = z.infer<typeof AddressQuerySchema>

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

export interface DefaultAddressUpdate {
  user_id: string
  address_type: AddressType
  new_default_id: string
}