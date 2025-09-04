/**
 * @file Tests TDD pour service products avec labels HerbisVeritas
 * @description Tests pour CRUD products avec labels cosmétiques et INCI
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import type { Product, ProductInput, ProductLabel } from '@/types/database'

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  eq: jest.fn(),
  is: jest.fn(),
  order: jest.fn(),
  contains: jest.fn(),
  lte: jest.fn(),
  single: jest.fn(),
  or: jest.fn(),
  data: null,
  error: null
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient
}))

import { ProductsService } from '@/lib/products/products-service'

describe('ProductsService - TDD avec Labels HerbisVeritas', () => {
  let productsService: ProductsService
  
  beforeEach(() => {
    productsService = new ProductsService()
    jest.clearAllMocks()
    
    // Setup chain par défaut
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.update.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.delete.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.is.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.order.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.contains.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.lte.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.single.mockReturnValue(mockSupabaseClient)
    mockSupabaseClient.or.mockReturnValue(mockSupabaseClient)
  })

  describe('getAllProducts - Récupération produits actifs', () => {
    it('devrait récupérer tous les produits avec labels HerbisVeritas', async () => {
      const mockProducts: Product[] = [
        {
          id: 'prod-1',
          slug: 'savon-lavande',
          category_id: 'cat-1',
          name: 'Savon à la Lavande',
          description_short: 'Savon artisanal bio',
          description_long: 'Savon fait main avec lavande de Provence',
          price: 8.50,
          currency: 'EUR',
          stock: 25,
          unit: 'pièce',
          image_url: '/images/savon-lavande.jpg',
          inci_list: ['Sodium Cocoate', 'Lavandula Angustifolia'],
          labels: ['bio', 'origine_occitanie', 'recolte_main'] as ProductLabel[],
          status: 'active',
          is_active: true,
          is_new: false,
          translations: {
            en: { name: 'Lavender Soap', description: 'Handmade organic soap' }
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockSupabaseClient.data = mockProducts
      mockSupabaseClient.error = null

      const result = await productsService.getAllProducts()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('is_active', true)
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockProducts)
    })

    it('devrait gérer les erreurs de base de données', async () => {
      mockSupabaseClient.data = null
      mockSupabaseClient.error = { message: 'Database connection error' }

      await expect(productsService.getAllProducts())
        .rejects.toThrow('Erreur lors de la récupération des produits: Database connection error')
    })
  })

  describe('createProduct - Création avec labels HerbisVeritas', () => {
    it('devrait créer un produit avec labels bio et origine Occitanie', async () => {
      const productInput: ProductInput = {
        slug: 'creme-arnica',
        category_id: 'cat-2',
        name: 'Crème à l\'Arnica',
        description_short: 'Crème apaisante bio',
        description_long: 'Crème réparatrice aux fleurs d\'arnica récoltées à la main',
        price: 15.90,
        currency: 'EUR',
        stock: 12,
        unit: 'tube',
        image_url: '/images/creme-arnica.jpg',
        inci_list: ['Aqua', 'Arnica Montana Flower Extract', 'Butyrospermum Parkii'],
        labels: ['bio', 'origine_occitanie', 'recolte_main'] as ProductLabel[],
        status: 'active',
        is_active: true,
        is_new: true,
        translations: {
          en: { 
            name: 'Arnica Cream', 
            description: 'Soothing organic cream with hand-picked arnica flowers' 
          }
        }
      }

      const mockCreatedProduct: Product = {
        id: 'prod-new-1',
        ...productInput,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabaseClient.data = [mockCreatedProduct]
      mockSupabaseClient.error = null

      const result = await productsService.createProduct(productInput)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products')
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(productInput)
      expect(mockSupabaseClient.select).toHaveBeenCalled()
      expect(result).toEqual(mockCreatedProduct)
      expect(result.labels).toContain('bio')
      expect(result.labels).toContain('origine_occitanie')
      expect(result.labels).toContain('recolte_main')
    })

    it('devrait créer un produit avec label essence précieuse', async () => {
      const productInput: ProductInput = {
        slug: 'huile-rose',
        category_id: 'cat-3',
        name: 'Huile de Rose',
        description_short: 'Essence rare et précieuse',
        price: 45.00,
        labels: ['essence_precieuse', 'partenariat_producteurs'] as ProductLabel[],
        inci_list: ['Rosa Damascena Flower Oil'],
        stock: 5
      }

      const mockCreatedProduct: Product = {
        id: 'prod-rose',
        ...productInput,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabaseClient.data = [mockCreatedProduct]
      mockSupabaseClient.error = null

      const result = await productsService.createProduct(productInput)

      expect(result.labels).toContain('essence_precieuse')
      expect(result.labels).toContain('partenariat_producteurs')
      expect(result.inci_list).toContain('Rosa Damascena Flower Oil')
    })
  })

  describe('getProductsByLabel - Filtrage par labels', () => {
    it('devrait récupérer les produits bio uniquement', async () => {
      const mockBioProducts: Product[] = [
        {
          id: 'prod-bio-1',
          slug: 'savon-bio',
          name: 'Savon Bio',
          category_id: 'cat-1',
          description_short: 'Savon bio naturel',
          description_long: null,
          price: 7.50,
          currency: 'EUR',
          stock: 10,
          unit: 'pièce',
          image_url: null,
          inci_list: ['Sodium Cocoate'],
          labels: ['bio', 'origine_occitanie'] as ProductLabel[],
          status: 'active',
          is_active: true,
          is_new: false,
          translations: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockSupabaseClient.data = mockBioProducts
      mockSupabaseClient.error = null

      const result = await productsService.getProductsByLabel('bio')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('is_active', true)
      // Vérifier que la requête filtre bien par le label 'bio'
      expect(result).toEqual(mockBioProducts)
    })

    it('devrait récupérer les produits en rupture de récolte', async () => {
      const mockRuptureProducts: Product[] = [
        {
          id: 'prod-rupture-1',
          slug: 'miel-acacia-rupture',
          name: 'Miel d\'Acacia',
          category_id: 'cat-4',
          description_short: 'Miel d\'acacia pur',
          description_long: null,
          price: 12.00,
          currency: 'EUR',
          stock: 0,
          unit: 'pot',
          image_url: null,
          inci_list: ['Mel'],
          labels: ['rupture_recolte', 'partenariat_producteurs'] as ProductLabel[],
          status: 'active',
          is_active: true,
          is_new: false,
          translations: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockSupabaseClient.data = mockRuptureProducts
      mockSupabaseClient.error = null

      const result = await productsService.getProductsByLabel('rupture_recolte')

      expect(result).toEqual(mockRuptureProducts)
      expect(result[0].labels).toContain('rupture_recolte')
    })
  })

  describe('updateProduct - Mise à jour avec gestion labels', () => {
    it('devrait mettre à jour les labels d\'un produit', async () => {
      const updates: Partial<ProductInput> = {
        labels: ['bio', 'origine_occitanie', 'rituel_bien_etre'] as ProductLabel[],
        price: 9.50,
        stock: 20
      }

      const mockUpdatedProduct: Product = {
        id: 'prod-1',
        slug: 'savon-lavande-updated',
        category_id: 'cat-1',
        name: 'Savon à la Lavande Premium',
        description_short: 'Savon artisanal premium',
        description_long: null,
        price: 9.50,
        currency: 'EUR',
        stock: 20,
        unit: 'pièce',
        image_url: null,
        inci_list: ['Sodium Cocoate', 'Lavandula Angustifolia'],
        labels: ['bio', 'origine_occitanie', 'rituel_bien_etre'] as ProductLabel[],
        status: 'active',
        is_active: true,
        is_new: false,
        translations: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T01:00:00Z'
      }

      mockSupabaseClient.data = [mockUpdatedProduct]
      mockSupabaseClient.error = null

      const result = await productsService.updateProduct('prod-1', updates)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products')
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        ...updates,
        updated_at: expect.any(String)
      })
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'prod-1')
      expect(result.labels).toEqual(['bio', 'origine_occitanie', 'rituel_bien_etre'])
    })
  })

  describe('validateInciList - Validation liste INCI', () => {
    it('devrait valider une liste INCI correcte', () => {
      const validInci = [
        'Aqua',
        'Sodium Cocoate',
        'Lavandula Angustifolia Flower Oil',
        'Glycerin'
      ]

      const result = productsService.validateInciList(validInci)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('devrait rejeter une liste INCI avec noms invalides', () => {
      const invalidInci = [
        '', // Nom vide
        'eau', // Nom français au lieu du nom INCI
        'Aqua', // Valide
        '123Invalid' // Nom avec caractères invalides
      ]

      const result = productsService.validateInciList(invalidInci)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Nom INCI vide détecté')
      expect(result.errors).toContain('Nom INCI invalide: "eau"')
      expect(result.errors).toContain('Nom INCI invalide: "123Invalid"')
    })
  })

  describe('getProductsWithLowStock - Gestion stock', () => {
    it('devrait identifier les produits en stock faible', async () => {
      const mockLowStockProducts: Product[] = [
        {
          id: 'prod-low-1',
          slug: 'huile-rare',
          name: 'Huile Rare',
          category_id: 'cat-5',
          description_short: 'Huile essentielle rare',
          description_long: null,
          price: 30.00,
          currency: 'EUR',
          stock: 2,
          unit: 'flacon',
          image_url: null,
          inci_list: ['Rare Oil Extract'],
          labels: ['essence_precieuse'] as ProductLabel[],
          status: 'active',
          is_active: true,
          is_new: false,
          translations: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockSupabaseClient.data = mockLowStockProducts
      mockSupabaseClient.error = null

      const result = await productsService.getProductsWithLowStock(5)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products')
      expect(result).toEqual(mockLowStockProducts)
      expect(result[0].stock).toBeLessThanOrEqual(5)
    })
  })
})