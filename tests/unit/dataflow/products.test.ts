/**
 * Tests TDD Dataflow Products MVP
 * Tests pour notre architecture simplifiée DB → DTO → ViewModel
 * Labels simplifiés, prix en unités, validation Zod
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { 
  mapProductDTOToViewModel, 
  mapDBRowToProductDTO, 
  normalizeLocale 
} from '@/lib/mappers/product.mapper'
import { 
  validateProductDTO, 
  validateProductDBRow, 
  normalizeProductLabels 
} from '@/lib/schemas/product'
import type { ProductDTO } from '@/lib/types/domain/product'

describe('Dataflow Products MVP - TDD', () => {
  let validDBRow: any
  let validDTO: ProductDTO

  beforeEach(() => {
    // Mock DB row (comme retourné par Supabase)
    validDBRow = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      slug: 'creme-hydratante-bio',
      name: 'Crème Hydratante Bio',
      description_short: 'Hydrate en profondeur',
      description_long: null,
      price: 24.99, // En unités, pas cents
      currency: 'EUR',
      stock: 15,
      unit: '50ml',
      image_url: 'https://example.com/creme.jpg',
      inci_list: ['Aqua', 'Butyrospermum Parkii', 'Glycerin'],
      labels: ['bio', 'artisanal'], // Strings simples
      status: 'active',
      is_active: true,
      is_new: false,
      translations: {
        fr: { name: 'Crème Hydratante Bio' },
        en: { name: 'Organic Moisturizing Cream' }
      },
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
      category_id: null
    }

    // DTO validé
    validDTO = validDBRow as ProductDTO
  })

  describe('DB Row → DTO Validation', () => {
    it('should validate a correct DB row', () => {
      expect(() => validateProductDBRow(validDBRow)).not.toThrow()
      
      const dto = validateProductDBRow(validDBRow)
      expect(dto.id).toBe(validDBRow.id)
      expect(dto.price).toBe(24.99) // Prix en unités
      expect(dto.labels).toEqual(['bio', 'artisanal'])
    })

    it('should reject invalid price (negative)', () => {
      const invalidRow = { ...validDBRow, price: -10 }
      
      expect(() => validateProductDBRow(invalidRow))
        .toThrow(/Price must be positive/)
    })

    it('should reject invalid price (too high)', () => {
      const invalidRow = { ...validDBRow, price: 99999 }
      
      expect(() => validateProductDBRow(invalidRow))
        .toThrow(/Price too high/)
    })

    it('should normalize null labels to empty array', () => {
      const rowWithNullLabels = { ...validDBRow, labels: null }
      
      const dto = validateProductDBRow(rowWithNullLabels)
      expect(dto.labels).toEqual([])
    })

    it('should reject invalid UUID', () => {
      const invalidRow = { ...validDBRow, id: 'invalid-uuid' }
      
      expect(() => validateProductDBRow(invalidRow))
        .toThrow(/ID must be valid UUID/)
    })
  })

  describe('DTO → ViewModel Mapping', () => {
    it('should create ViewModel with formatted price', () => {
      const viewModel = mapProductDTOToViewModel(validDTO, 'fr')
      
      expect(viewModel.price).toBe(24.99)
      expect(viewModel.priceFormatted).toMatch(/^24,99\s*€$/)
      expect(viewModel.currency).toBe('EUR')
    })

    it('should handle stock status correctly', () => {
      // Stock normal
      const viewModel = mapProductDTOToViewModel(validDTO)
      expect(viewModel.isInStock).toBe(true)
      expect(viewModel.isLowStock).toBe(false)

      // Stock faible
      const lowStockDTO = { ...validDTO, stock: 5 }
      const lowStockVM = mapProductDTOToViewModel(lowStockDTO)
      expect(lowStockVM.isInStock).toBe(true)
      expect(lowStockVM.isLowStock).toBe(true)

      // Rupture
      const outOfStockDTO = { ...validDTO, stock: 0 }
      const outOfStockVM = mapProductDTOToViewModel(outOfStockDTO)
      expect(outOfStockVM.isInStock).toBe(false)
      expect(outOfStockVM.isLowStock).toBe(false)
    })

    it('should use default image when image_url is null', () => {
      const dtoWithoutImage = { ...validDTO, image_url: null }
      const viewModel = mapProductDTOToViewModel(dtoWithoutImage)
      
      expect(viewModel.image_url).toBe('/images/products/default-product.jpg')
      expect(viewModel.image_alt).toContain('Crème Hydratante Bio')
    })

    it('should handle i18n localization correctly', () => {
      // Français
      const frViewModel = mapProductDTOToViewModel(validDTO, 'fr')
      expect(frViewModel.name).toBe('Crème Hydratante Bio')

      // Anglais
      const enViewModel = mapProductDTOToViewModel(validDTO, 'en')
      expect(enViewModel.name).toBe('Organic Moisturizing Cream')

      // Fallback si pas de traduction
      const dtoNoTranslation = { 
        ...validDTO, 
        translations: { fr: {}, en: {} } 
      }
      const fallbackVM = mapProductDTOToViewModel(dtoNoTranslation)
      expect(fallbackVM.name).toBe('Crème Hydratante Bio') // Nom original
    })

    it('should keep labels as simple strings', () => {
      const viewModel = mapProductDTOToViewModel(validDTO)
      
      expect(viewModel.labels).toEqual(['bio', 'artisanal'])
      expect(Array.isArray(viewModel.labels)).toBe(true)
      expect(viewModel.labels.every(l => typeof l === 'string')).toBe(true)
    })
  })

  describe('Labels Simplifiés', () => {
    it('should normalize labels correctly', () => {
      // Cas normal
      expect(normalizeProductLabels(['bio', 'artisanal'])).toEqual(['bio', 'artisanal'])
      
      // Filtrer vides
      expect(normalizeProductLabels(['bio', '', 'artisanal'])).toEqual(['bio', 'artisanal'])
      
      // Filtrer non-strings
      expect(normalizeProductLabels(['bio', null, 123, 'artisanal'])).toEqual(['bio', 'artisanal'])
      
      // Array non-valide
      expect(normalizeProductLabels(null)).toEqual([])
      expect(normalizeProductLabels('not-array')).toEqual([])
    })
  })

  describe('Locale Handling', () => {
    it('should normalize locale correctly', () => {
      expect(normalizeLocale('fr')).toBe('fr')
      expect(normalizeLocale('en')).toBe('en')
      expect(normalizeLocale('fr-FR')).toBe('fr')
      expect(normalizeLocale('en-US')).toBe('en')
      expect(normalizeLocale('de')).toBe('fr') // Fallback
      expect(normalizeLocale(undefined)).toBe('fr') // Default
    })
  })

  describe('Edge Cases - Robustesse', () => {
    it('should handle malformed translations gracefully', () => {
      const malformedDTO = { 
        ...validDTO, 
        translations: null as any 
      }
      
      expect(() => mapProductDTOToViewModel(malformedDTO)).not.toThrow()
      
      const viewModel = mapProductDTOToViewModel(malformedDTO)
      expect(viewModel.name).toBe(validDTO.name) // Fallback
    })

    it('should handle extremely long labels list', () => {
      const longLabels = Array(50).fill('test-label')
      const dtoWithLongLabels = { ...validDTO, labels: longLabels }
      
      expect(() => mapProductDTOToViewModel(dtoWithLongLabels)).not.toThrow()
      
      const viewModel = mapProductDTOToViewModel(dtoWithLongLabels)
      expect(viewModel.labels).toHaveLength(50)
    })

    it('should handle special characters in labels', () => {
      const specialLabels = ['bio', 'made-in-🇫🇷', 'origine_occitanie']
      const dtoWithSpecialLabels = { ...validDTO, labels: specialLabels }
      
      const viewModel = mapProductDTOToViewModel(dtoWithSpecialLabels)
      expect(viewModel.labels).toEqual(specialLabels)
    })
  })

  describe('Performance Invariants', () => {
    it('should be pure functions (no side effects)', () => {
      const originalDTO = { ...validDTO }
      
      // Mapper ne doit pas muter les données d'entrée
      mapProductDTOToViewModel(validDTO)
      expect(validDTO).toEqual(originalDTO)
    })

    it('should handle batch mapping efficiently', () => {
      const dtos = Array(100).fill(validDTO)
      const start = performance.now()
      
      dtos.forEach(dto => mapProductDTOToViewModel(dto))
      
      const duration = performance.now() - start
      expect(duration).toBeLessThan(100) // < 100ms pour 100 produits
    })
  })
})