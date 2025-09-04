/**
 * @file Tests TDD pour service categories hiérarchiques
 * @description Tests pour CRUD categories avec i18n JSONB
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import type { Category, CategoryWithChildren, CategoryInput } from '@/types/database'

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
  data: null,
  error: null
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient
}))

import { CategoriesService } from '@/lib/categories/categories-service'

describe('CategoriesService - TDD', () => {
  let categoriesService: CategoriesService
  
  beforeEach(() => {
    categoriesService = new CategoriesService()
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
  })

  describe('getRootCategories - Récupération catégories racine', () => {
    it('devrait récupérer toutes les catégories racine avec ordre', async () => {
      const mockCategories: Category[] = [
        {
          id: 'cat-1',
          slug: 'soins-corps',
          name: 'Soins du Corps',
          description: 'Produits pour le corps',
          parent_id: null,
          sort_order: 0,
          color: '#3e8e68',
          translations: { en: { name: 'Body Care', description: 'Body products' } },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'cat-2', 
          slug: 'soins-visage',
          name: 'Soins du Visage',
          description: 'Produits pour le visage',
          parent_id: null,
          sort_order: 1,
          color: '#8156cc',
          translations: { en: { name: 'Face Care', description: 'Face products' } },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockSupabaseClient.data = mockCategories
      mockSupabaseClient.error = null

      const result = await categoriesService.getRootCategories()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('categories')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.is).toHaveBeenCalledWith('parent_id', null)
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('sort_order', { ascending: true })
      expect(result).toEqual(mockCategories)
    })

    it('devrait gérer les erreurs de base de données', async () => {
      mockSupabaseClient.data = null
      mockSupabaseClient.error = { message: 'Database error' }

      await expect(categoriesService.getRootCategories())
        .rejects.toThrow('Erreur lors de la récupération des catégories racine: Database error')
    })
  })

  describe('getCategoryWithChildren - Hiérarchie complète', () => {
    it('devrait récupérer une catégorie avec ses sous-catégories', async () => {
      const mockCategoryWithChildren: CategoryWithChildren = {
        id: 'cat-1',
        slug: 'soins-corps',
        name: 'Soins du Corps',
        description: 'Produits pour le corps',
        parent_id: null,
        sort_order: 0,
        color: '#3e8e68',
        translations: { en: { name: 'Body Care', description: 'Body products' } },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        children: [
          {
            id: 'cat-1-1',
            slug: 'savons-corps',
            name: 'Savons Corps',
            description: 'Savons naturels',
            parent_id: 'cat-1',
            sort_order: 0,
            color: null,
            translations: { en: { name: 'Body Soaps', description: 'Natural soaps' } },
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
      }

      mockSupabaseClient.data = [mockCategoryWithChildren]
      mockSupabaseClient.error = null

      const result = await categoriesService.getCategoryWithChildren('cat-1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('categories')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith(`
        *,
        children:categories!parent_id(*)
      `)
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'cat-1')
      expect(result).toEqual(mockCategoryWithChildren)
    })

    it('devrait retourner null si catégorie non trouvée', async () => {
      mockSupabaseClient.data = []
      mockSupabaseClient.error = null

      const result = await categoriesService.getCategoryWithChildren('inexistant')

      expect(result).toBeNull()
    })
  })

  describe('createCategory - Création avec validation', () => {
    it('devrait créer une catégorie racine avec translations', async () => {
      const categoryInput: CategoryInput = {
        slug: 'nouvelle-categorie',
        name: 'Nouvelle Catégorie',
        description: 'Description test',
        parent_id: null,
        sort_order: 2,
        color: '#f97416',
        translations: {
          en: { name: 'New Category', description: 'Test description' }
        }
      }

      const mockCreatedCategory: Category = {
        id: 'new-cat-id',
        ...categoryInput,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabaseClient.data = [mockCreatedCategory]
      mockSupabaseClient.error = null

      const result = await categoriesService.createCategory(categoryInput)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('categories')
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(categoryInput)
      expect(mockSupabaseClient.select).toHaveBeenCalled()
      expect(result).toEqual(mockCreatedCategory)
    })

    it('devrait créer une sous-catégorie avec parent_id', async () => {
      const categoryInput: CategoryInput = {
        slug: 'sous-categorie',
        name: 'Sous Catégorie',
        description: 'Sous-catégorie test',
        parent_id: 'parent-cat-id',
        sort_order: 0,
        color: null,
        translations: {
          en: { name: 'Sub Category', description: 'Sub category test' }
        }
      }

      const mockCreatedCategory: Category = {
        id: 'sub-cat-id',
        ...categoryInput,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabaseClient.data = [mockCreatedCategory]
      mockSupabaseClient.error = null

      const result = await categoriesService.createCategory(categoryInput)

      expect(result).toEqual(mockCreatedCategory)
      expect(result.parent_id).toBe('parent-cat-id')
    })

    it('devrait gérer les erreurs de création', async () => {
      const categoryInput: CategoryInput = {
        slug: 'erreur',
        name: 'Erreur',
        description: 'Test erreur',
        parent_id: null,
        sort_order: 0
      }

      mockSupabaseClient.data = null
      mockSupabaseClient.error = { message: 'Duplicate slug' }

      await expect(categoriesService.createCategory(categoryInput))
        .rejects.toThrow('Erreur lors de la création de la catégorie: Duplicate slug')
    })
  })

  describe('updateCategory - Mise à jour avec i18n', () => {
    it('devrait mettre à jour une catégorie existante', async () => {
      const updates: Partial<CategoryInput> = {
        name: 'Nom Modifié',
        description: 'Description modifiée',
        translations: {
          en: { name: 'Modified Name', description: 'Modified description' },
          de: { name: 'Geänderter Name', description: 'Geänderte Beschreibung' }
        }
      }

      const mockUpdatedCategory: Category = {
        id: 'cat-1',
        slug: 'soins-corps',
        name: 'Nom Modifié',
        description: 'Description modifiée',
        parent_id: null,
        sort_order: 0,
        color: '#3e8e68',
        translations: updates.translations!,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T01:00:00Z'
      }

      mockSupabaseClient.data = [mockUpdatedCategory]
      mockSupabaseClient.error = null

      const result = await categoriesService.updateCategory('cat-1', updates)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('categories')
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        ...updates,
        updated_at: expect.any(String)
      })
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'cat-1')
      expect(result).toEqual(mockUpdatedCategory)
    })
  })

  describe('deleteCategory - Suppression avec validation hiérarchie', () => {
    it('devrait supprimer une catégorie sans enfants', async () => {
      // Mock vérification pas d'enfants
      mockSupabaseClient.data = []
      mockSupabaseClient.error = null

      // Mock suppression réussie
      const deleteMockChain = {
        ...mockSupabaseClient,
        data: null,
        error: null
      }
      mockSupabaseClient.delete.mockReturnValue(deleteMockChain)
      deleteMockChain.eq.mockReturnValue(deleteMockChain)

      const result = await categoriesService.deleteCategory('cat-1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('categories')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('id')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('parent_id', 'cat-1')
      expect(result).toBe(true)
    })

    it('devrait rejeter la suppression si catégorie a des enfants', async () => {
      // Mock catégorie avec enfants
      mockSupabaseClient.data = [{ id: 'child-1' }]
      mockSupabaseClient.error = null

      await expect(categoriesService.deleteCategory('cat-1'))
        .rejects.toThrow('Impossible de supprimer une catégorie qui a des sous-catégories')
    })
  })

  describe('getCategoryHierarchy - Arbre complet', () => {
    it('devrait construire l\'arbre hiérarchique complet', async () => {
      const mockFlatCategories: Category[] = [
        {
          id: 'root-1',
          slug: 'soins-corps',
          name: 'Soins du Corps',
          description: 'Produits corps',
          parent_id: null,
          sort_order: 0,
          color: '#3e8e68',
          translations: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'child-1',
          slug: 'savons-corps',
          name: 'Savons Corps',
          description: 'Savons naturels',
          parent_id: 'root-1',
          sort_order: 0,
          color: null,
          translations: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockSupabaseClient.data = mockFlatCategories
      mockSupabaseClient.error = null

      const result = await categoriesService.getCategoryHierarchy()

      expect(result).toHaveLength(1) // Une seule racine
      expect(result[0].id).toBe('root-1')
      expect(result[0].children).toHaveLength(1)
      expect(result[0].children![0].id).toBe('child-1')
    })
  })
})