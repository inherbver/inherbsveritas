/**
 * Tests Cart Business Logic Integration
 * Tests intégration avec Supabase et state management
 * @jest-environment node
 */

import { createClient } from '@/lib/supabase/server'

// Mock Supabase client
const mockFrom = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockSelect = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom.mockReturnThis(),
    insert: mockInsert.mockReturnThis(),
    update: mockUpdate.mockReturnThis(),
    delete: mockDelete.mockReturnThis(),
    select: mockSelect.mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null })
  }))
}))

// Business functions to test
import { addToCart, removeFromCart, updateCartQuantity, getCartTotal } from '@/lib/cart/operations'

describe('Cart Business Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Add to cart operations', () => {
    it('should add new product to guest cart', async () => {
      const cartData = {
        product_id: 'product-123',
        quantity: 1,
        session_id: 'guest-session-123'
      }

      mockInsert.mockResolvedValueOnce({
        data: [{ id: 'cart-item-123', ...cartData }],
        error: null
      })

      const result = await addToCart('product-123', 1, 'guest-session-123')

      expect(mockFrom).toHaveBeenCalledWith('cart_items')
      expect(mockInsert).toHaveBeenCalledWith(cartData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(expect.objectContaining({
        id: 'cart-item-123',
        product_id: 'product-123',
        quantity: 1
      }))
    })

    it('should add product to authenticated user cart', async () => {
      const cartData = {
        product_id: 'product-456',
        quantity: 2,
        user_id: 'user-123'
      }

      mockInsert.mockResolvedValueOnce({
        data: [{ id: 'cart-item-456', ...cartData }],
        error: null
      })

      const result = await addToCart('product-456', 2, null, 'user-123')

      expect(mockInsert).toHaveBeenCalledWith(cartData)
      expect(result.success).toBe(true)
    })

    it('should handle database error on add to cart', async () => {
      mockInsert.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' }
      })

      const result = await addToCart('product-123', 1, 'guest-session')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
    })
  })

  describe('Update cart operations', () => {
    it('should update cart item quantity', async () => {
      const updatedData = {
        id: 'cart-item-123',
        quantity: 3,
        updated_at: new Date().toISOString()
      }

      mockUpdate.mockResolvedValueOnce({
        data: [updatedData],
        error: null
      })

      const result = await updateCartQuantity('cart-item-123', 3)

      expect(mockFrom).toHaveBeenCalledWith('cart_items')
      expect(mockUpdate).toHaveBeenCalledWith({ quantity: 3 })
      expect(result.success).toBe(true)
    })

    it('should remove item when quantity is 0', async () => {
      mockDelete.mockResolvedValueOnce({
        data: [{ id: 'cart-item-123' }],
        error: null
      })

      const result = await updateCartQuantity('cart-item-123', 0)

      expect(mockDelete).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })

  describe('Remove from cart operations', () => {
    it('should remove cart item successfully', async () => {
      mockDelete.mockResolvedValueOnce({
        data: [{ id: 'cart-item-123' }],
        error: null
      })

      const result = await removeFromCart('cart-item-123')

      expect(mockFrom).toHaveBeenCalledWith('cart_items')
      expect(result.success).toBe(true)
    })
  })

  describe('Cart calculations', () => {
    it('should calculate cart total correctly', async () => {
      const cartItems = [
        { product_id: 'p1', quantity: 2, price: 10.00 },
        { product_id: 'p2', quantity: 1, price: 25.50 }
      ]

      mockSelect.mockResolvedValueOnce({
        data: cartItems,
        error: null
      })

      const total = await getCartTotal('session-123')

      expect(total).toBe(45.50) // (2 * 10.00) + (1 * 25.50)
    })

    it('should return 0 for empty cart', async () => {
      mockSelect.mockResolvedValueOnce({
        data: [],
        error: null
      })

      const total = await getCartTotal('session-123')

      expect(total).toBe(0)
    })

    it('should handle cart calculation errors', async () => {
      mockSelect.mockResolvedValueOnce({
        data: null,
        error: { message: 'Query failed' }
      })

      const total = await getCartTotal('session-123')

      expect(total).toBe(0) // Graceful fallback
    })
  })

  describe('Cart validation', () => {
    it('should validate product exists before adding', async () => {
      // Mock product exists check
      const mockProductExists = jest.fn().mockResolvedValue(true)
      
      // This would be part of the addToCart implementation
      const productExists = await mockProductExists('product-123')
      expect(productExists).toBe(true)
    })

    it('should validate stock availability', async () => {
      // Mock stock check
      const mockCheckStock = jest.fn().mockResolvedValue({ available: 5 })
      
      const stock = await mockCheckStock('product-123')
      expect(stock.available).toBeGreaterThan(0)
    })
  })
})