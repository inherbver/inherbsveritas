/**
 * Tests TDD pour système d'addresses  
 * RED -> GREEN -> REFACTOR
 */

import {
  createAddress,
  updateAddress,
  deleteAddress,
  getUserAddresses,
  setDefaultAddress,
  type Address,
  type CreateAddressData,
  type UpdateAddressData
} from '@/lib/auth/addresses'

// Utilise les mocks centralisés

describe('lib/auth/addresses (TDD)', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Utilise factory centralisée - pas besoin de setup manuel
    mockSupabase = global.createMockSupabaseClient()
    const { createClient } = require('@/lib/supabase/client')
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('createAddress (TDD)', () => {
    it('should create a new address successfully', async () => {
      // Arrange
      const addressData: CreateAddressData = {
        user_id: 'user-123',
        address_type: 'billing' as const,
        first_name: 'Jean',
        last_name: 'Dupont',
        address_line1: '123 rue de la Paix',
        city: 'Paris',
        postal_code: '75001',
        country_code: 'FR',
        is_default: true
      }

      const expectedAddress: Address = {
        id: 'addr-123',
        ...addressData,
        created_at: '2025-01-01T10:00:00.000Z',
        updated_at: '2025-01-01T10:00:00.000Z'
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({ 
        data: expectedAddress, 
        error: null 
      })

      // Act
      const result = await createAddress(addressData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(expectedAddress)
      expect(mockSupabase.from).toHaveBeenCalledWith('addresses')
      expect(mockQuery.insert).toHaveBeenCalledWith(addressData)
      expect(mockQuery.select).toHaveBeenCalled()
      expect(mockQuery.single).toHaveBeenCalled()
    })

    it('should validate required fields', async () => {
      // Arrange
      const invalidAddressData = {
        user_id: 'user-123',
        address_type: 'billing' as const,
        // Missing required fields
      } as CreateAddressData

      // Act
      const result = await createAddress(invalidAddressData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('required')
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      // Arrange
      const addressData: CreateAddressData = {
        user_id: 'user-123',
        type: 'shipping',
        first_name: 'Jane',
        last_name: 'Smith',
        address_line1: '456 Main St',
        city: 'Lyon',
        postal_code: '69000',
        country: 'France'
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      })

      // Act
      const result = await createAddress(addressData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })

    it('should set new address as default and unset others when is_default is true', async () => {
      // Arrange
      const addressData: CreateAddressData = {
        user_id: 'user-123',
        address_type: 'billing' as const,
        first_name: 'Jean',
        last_name: 'Dupont',
        address_line1: '123 rue de la Paix',
        city: 'Paris',
        postal_code: '75001',
        country_code: 'FR',
        is_default: true
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({ 
        data: { id: 'addr-123', ...addressData }, 
        error: null 
      })

      // Act
      const result = await createAddress(addressData)

      // Assert
      expect(result.success).toBe(true)
      // Vérifier qu'il y a eu deux appels: un pour unset les autres, un pour créer
      expect(mockSupabase.from).toHaveBeenCalledTimes(2)
    })
  })

  describe('getUserAddresses (TDD)', () => {
    it('should retrieve all addresses for a user', async () => {
      // Arrange
      const userId = 'user-123'
      const mockAddresses: Address[] = [
        {
          id: 'addr-1',
          user_id: userId,
          address_type: 'billing' as const,
          first_name: 'Jean',
          last_name: 'Dupont',
          address_line1: '123 rue de la Paix',
          city: 'Paris',
          postal_code: '75001',
          country_code: 'FR',
          is_default: true,
          created_at: '2025-01-01T10:00:00.000Z',
          updated_at: '2025-01-01T10:00:00.000Z'
        },
        {
          id: 'addr-2',
          user_id: userId,
          address_type: 'shipping',
          first_name: 'Jane',
          last_name: 'Smith',
          address_line1: '456 Main St',
          city: 'Lyon',
          postal_code: '69000',
          country_code: 'FR',
          is_default: false,
          created_at: '2025-01-01T11:00:00.000Z',
          updated_at: '2025-01-01T11:00:00.000Z'
        }
      ]

      const mockQuery = mockSupabase.from()
      mockQuery.select.mockResolvedValue({ 
        data: mockAddresses, 
        error: null 
      })

      // Act
      const result = await getUserAddresses(userId)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockAddresses)
      expect(mockSupabase.from).toHaveBeenCalledWith('addresses')
      expect(mockQuery.select).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId)
    })

    it('should return empty array when user has no addresses', async () => {
      // Arrange
      const userId = 'user-123'
      const mockQuery = mockSupabase.from()
      mockQuery.select.mockResolvedValue({ 
        data: [], 
        error: null 
      })

      // Act
      const result = await getUserAddresses(userId)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('should handle database errors when fetching addresses', async () => {
      // Arrange
      const userId = 'user-123'
      const mockQuery = mockSupabase.from()
      mockQuery.select.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database connection failed' } 
      })

      // Act
      const result = await getUserAddresses(userId)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
    })
  })

  describe('updateAddress (TDD)', () => {
    it('should update address successfully', async () => {
      // Arrange
      const addressId = 'addr-123'
      const updateData: UpdateAddressData = {
        address_line1: '789 New Street',
        city: 'Marseille',
        postal_code: '13000'
      }

      const expectedUpdatedAddress: Address = {
        id: addressId,
        user_id: 'user-123',
        address_type: 'billing' as const,
        first_name: 'Jean',
        last_name: 'Dupont',
        address_line1: '789 New Street',
        city: 'Marseille',
        postal_code: '13000',
        country_code: 'FR',
        is_default: true,
        created_at: '2025-01-01T10:00:00.000Z',
        updated_at: '2025-01-01T12:00:00.000Z'
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({ 
        data: expectedUpdatedAddress, 
        error: null 
      })

      // Act
      const result = await updateAddress(addressId, updateData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(expectedUpdatedAddress)
      expect(mockSupabase.from).toHaveBeenCalledWith('addresses')
      expect(mockQuery.update).toHaveBeenCalledWith(updateData)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', addressId)
    })

    it('should handle non-existent address', async () => {
      // Arrange
      const addressId = 'non-existent-addr'
      const updateData: UpdateAddressData = {
        city: 'Nice'
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Address not found', code: 'PGRST116' } 
      })

      // Act
      const result = await updateAddress(addressId, updateData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Address not found')
    })
  })

  describe('deleteAddress (TDD)', () => {
    it('should delete address successfully', async () => {
      // Arrange
      const addressId = 'addr-123'
      const mockQuery = mockSupabase.from()
      mockQuery.select.mockResolvedValue({ 
        data: [{ id: addressId }], 
        error: null 
      })

      // Act
      const result = await deleteAddress(addressId)

      // Assert
      expect(result.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('addresses')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', addressId)
    })

    it('should handle deletion of non-existent address', async () => {
      // Arrange
      const addressId = 'non-existent-addr'
      const mockQuery = mockSupabase.from()
      mockQuery.select.mockResolvedValue({ 
        data: [], 
        error: null 
      })

      // Act
      const result = await deleteAddress(addressId)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Address not found')
    })
  })

  describe('setDefaultAddress (TDD)', () => {
    it('should set address as default and unset others', async () => {
      // Arrange
      const addressId = 'addr-123'
      const userId = 'user-123'
      
      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({ 
        data: { id: addressId, user_id: userId }, 
        error: null 
      })

      // Act
      const result = await setDefaultAddress(addressId, userId)

      // Assert
      expect(result.success).toBe(true)
      // Doit y avoir 2 appels : unset all defaults, puis set new default
      expect(mockSupabase.from).toHaveBeenCalledTimes(2)
    })

    it('should handle unauthorized access to other user address', async () => {
      // Arrange
      const addressId = 'addr-123'
      const userId = 'user-456' // Différent user
      
      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({ 
        data: { id: addressId, user_id: 'user-123' }, // Appartient à user-123
        error: null 
      })

      // Act
      const result = await setDefaultAddress(addressId, userId)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized access to address')
    })
  })
})