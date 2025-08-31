/**
 * Tests API Products Integration
 * Tests routes API avec validation et business logic
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { createMocks } from 'node-mocks-http'

// Mock Supabase
const mockSupabaseQuery = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  filter: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn()
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabaseQuery
}))

// API handlers to test
import { GET as getProducts, POST as createProduct } from '@/app/api/products/route'
import { GET as getProduct, PUT as updateProduct } from '@/app/api/products/[id]/route'

describe('Products API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return products list with pagination', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: { fr: 'Produit 1', en: 'Product 1' },
          price: 29.99,
          active: true
        },
        {
          id: 'product-2', 
          name: { fr: 'Produit 2', en: 'Product 2' },
          price: 39.99,
          active: true
        }
      ]

      mockSupabaseQuery.select.mockResolvedValueOnce({
        data: mockProducts,
        error: null,
        count: 2
      })

      const { req } = createMocks({
        method: 'GET',
        url: '/api/products?page=1&limit=10'
      })

      const request = new NextRequest('http://localhost:3000/api/products?page=1&limit=10')
      const response = await getProducts(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.products).toHaveLength(2)
      expect(data.products[0]).toEqual(expect.objectContaining({
        id: 'product-1',
        name: { fr: 'Produit 1', en: 'Product 1' }
      }))
    })

    it('should filter products by category', async () => {
      mockSupabaseQuery.select.mockResolvedValueOnce({
        data: [{ id: 'product-1', category_id: 'cat-123' }],
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/products?category=visage')
      const response = await getProducts(request)

      expect(mockSupabaseQuery.filter).toHaveBeenCalledWith('category_id', 'eq', 'visage')
      expect(response.status).toBe(200)
    })

    it('should filter products by labels', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?labels=bio_certifie,vegan')
      await getProducts(request)

      expect(mockSupabaseQuery.filter).toHaveBeenCalledWith(
        'labels', 
        'cs', 
        '{"bio_certifie","vegan"}'
      )
    })

    it('should handle database errors gracefully', async () => {
      mockSupabaseQuery.select.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' }
      })

      const request = new NextRequest('http://localhost:3000/api/products')
      const response = await getProducts(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Database connection failed')
    })
  })

  describe('POST /api/products (Admin)', () => {
    it('should create product with valid data', async () => {
      const newProduct = {
        name: { fr: 'Nouveau Produit', en: 'New Product' },
        description: { fr: 'Description', en: 'Description' },
        price: 29.99,
        category_id: 'cat-123',
        labels: ['bio_certifie', 'vegan'],
        stock_quantity: 10
      }

      mockSupabaseQuery.insert.mockResolvedValueOnce({
        data: [{ id: 'new-product-id', ...newProduct }],
        error: null
      })

      const { req } = createMocks({
        method: 'POST',
        body: newProduct
      })

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(newProduct)
      })

      const response = await createProduct(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.product).toEqual(expect.objectContaining({
        id: 'new-product-id',
        name: { fr: 'Nouveau Produit', en: 'New Product' }
      }))
    })

    it('should validate required fields', async () => {
      const invalidProduct = {
        name: { fr: '' }, // Name required
        price: -10 // Invalid price
      }

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(invalidProduct)
      })

      const response = await createProduct(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.errors).toContain('Nom produit requis')
      expect(data.errors).toContain('Prix doit être positif')
    })

    it('should validate labels HerbisVeritas', async () => {
      const productWithInvalidLabels = {
        name: { fr: 'Produit', en: 'Product' },
        price: 29.99,
        labels: ['invalid_label', 'bio_certifie'] // invalid_label not in enum
      }

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(productWithInvalidLabels)
      })

      const response = await createProduct(request)

      expect(response.status).toBe(400)
      expect(await response.json()).toEqual(expect.objectContaining({
        error: expect.stringContaining('Label invalide')
      }))
    })
  })

  describe('PUT /api/products/[id] (Admin)', () => {
    it('should update existing product', async () => {
      const productUpdate = {
        name: { fr: 'Produit Modifié', en: 'Updated Product' },
        price: 34.99
      }

      mockSupabaseQuery.update.mockResolvedValueOnce({
        data: [{ id: 'product-123', ...productUpdate }],
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/products/product-123', {
        method: 'PUT',
        body: JSON.stringify(productUpdate)
      })

      const response = await updateProduct(request, { params: { id: 'product-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith(productUpdate)
      expect(data.product.name.fr).toBe('Produit Modifié')
    })

    it('should handle product not found', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      })

      const request = new NextRequest('http://localhost:3000/api/products/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({ price: 29.99 })
      })

      const response = await updateProduct(request, { params: { id: 'nonexistent' } })

      expect(response.status).toBe(404)
      expect(await response.json()).toEqual({
        error: 'Produit non trouvé'
      })
    })
  })

  describe('GET /api/products/[id]', () => {
    it('should return single product with full details', async () => {
      const mockProduct = {
        id: 'product-123',
        name: { fr: 'Produit Test', en: 'Test Product' },
        description: { fr: 'Description', en: 'Description' },
        price: 29.99,
        labels: ['bio_certifie', 'vegan'],
        inci_ingredients: ['Aqua', 'Aloe Vera'],
        stock_quantity: 15,
        category: {
          id: 'cat-123',
          name: { fr: 'Visage', en: 'Face' }
        }
      }

      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: mockProduct,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/products/product-123')
      const response = await getProduct(request, { params: { id: 'product-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.product).toEqual(mockProduct)
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith(`
        *,
        category:categories(id, name)
      `)
    })

    it('should return 404 for non-existent product', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      })

      const request = new NextRequest('http://localhost:3000/api/products/nonexistent')
      const response = await getProduct(request, { params: { id: 'nonexistent' } })

      expect(response.status).toBe(404)
    })
  })

  describe('Business logic validation', () => {
    it('should validate stock before allowing add to cart', async () => {
      // Mock product with low stock
      const lowStockProduct = {
        id: 'product-low-stock',
        stock_quantity: 1
      }

      const result = await addToCart('product-low-stock', 5) // Quantity > stock

      expect(result.success).toBe(false)
      expect(result.error).toBe('Stock insuffisant')
    })

    it('should calculate correct totals with labels pricing', async () => {
      // Mock product with bio premium
      const bioProduct = {
        id: 'bio-product',
        price: 25.00,
        labels: ['bio_certifie'],
        quantity: 2
      }

      const total = await getCartTotal('session-123', [bioProduct])

      // Bio products might have different calculation logic
      expect(total).toBeGreaterThan(50.00) // Base price * quantity
    })
  })
})