/**
 * @file Tests unitaires pour src/lib/api/products.ts
 * @description Tests TDD pour API produits avec mocks Supabase
 */

import { addToCart, type AddToCartResult } from '@/lib/api/products'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  single: jest.fn(),
  insert: jest.fn(() => mockSupabase),
  update: jest.fn(() => mockSupabase),
  auth: {
    getUser: jest.fn()
  }
}

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('lib/api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  describe('addToCart', () => {
    const validProductId = 'prod-123'
    const validQuantity = 2

    describe('SUCCESS cases', () => {
      it('should successfully add product to cart', async () => {
        // Arrange - Mock product check
        mockSupabase.single
          .mockResolvedValueOnce({
            data: { id: validProductId, stock_quantity: 10, is_active: true },
            error: null
          })
          // Mock existing cart check
          .mockResolvedValueOnce({
            data: { id: 'cart-123' },
            error: null
          })
          // Mock existing cart item check
          .mockResolvedValueOnce({
            data: null,
            error: { message: 'No existing item' }
          })
          // Mock new cart item insert
          .mockResolvedValueOnce({
            data: { id: 'cart-item-123', product_id: validProductId, quantity: validQuantity },
            error: null
          })

        // Act
        const result: AddToCartResult = await addToCart(validProductId, validQuantity)

        // Assert
        expect(result.success).toBe(true)
        expect(result.error).toBeUndefined()
        expect(result.cartItem).toBeDefined()
      })
    })

    describe('ERROR cases', () => {
      it('should return error when product not found', async () => {
        // Arrange
        mockSupabase.eq.mockReturnValueOnce({
          ...mockSupabase,
          single: jest.fn().mockResolvedValueOnce({
            data: null,
            error: { message: 'Product not found' }
          })
        })

        // Act
        const result = await addToCart('invalid-product-id', 1)

        // Assert
        expect(result.success).toBe(false)
        expect(result.error).toBe('Produit non trouvé')
        expect(result.cartItem).toBeUndefined()
      })

      it('should return error when insufficient stock', async () => {
        // Arrange
        mockSupabase.eq.mockReturnValueOnce({
          ...mockSupabase,
          single: jest.fn().mockResolvedValueOnce({
            data: {
              id: validProductId,
              stock_quantity: 1, // Less than requested quantity
              is_active: true
            },
            error: null
          })
        })

        // Act
        const result = await addToCart(validProductId, 5)

        // Assert
        expect(result.success).toBe(false)
        expect(result.error).toContain('stock')
      })

      it('should return error when product is inactive', async () => {
        // Arrange
        mockSupabase.eq.mockReturnValueOnce({
          ...mockSupabase,
          single: jest.fn().mockResolvedValueOnce({
            data: {
              id: validProductId,
              stock_quantity: 10,
              is_active: false // Product inactive
            },
            error: null
          })
        })

        // Act
        const result = await addToCart(validProductId, 1)

        // Assert
        expect(result.success).toBe(false)
        expect(result.error).toBe('Produit non trouvé')
      })
    })

    describe('EDGE cases', () => {
      it('should handle zero quantity', async () => {
        // Act
        const result = await addToCart(validProductId, 0)

        // Assert
        expect(result.success).toBe(false)
        expect(result.error).toContain('quantité')
      })

      it('should handle negative quantity', async () => {
        // Act  
        const result = await addToCart(validProductId, -1)

        // Assert
        expect(result.success).toBe(false)
        expect(result.error).toContain('quantité')
      })

      it('should handle empty product ID', async () => {
        // Act
        const result = await addToCart('', 1)

        // Assert
        expect(result.success).toBe(false)
        expect(result.error).toContain('produit')
      })
    })

    describe('DATABASE error handling', () => {
      it('should handle Supabase connection errors', async () => {
        // Arrange - Mock database connection error
        mockSupabase.eq.mockReturnValueOnce({
          ...mockSupabase,
          single: jest.fn().mockRejectedValueOnce(new Error('Database connection failed'))
        })

        // Act
        const result = await addToCart(validProductId, 1)

        // Assert
        expect(result.success).toBe(false)
        expect(result.error).toContain('erreur')
      })
    })
  })
})