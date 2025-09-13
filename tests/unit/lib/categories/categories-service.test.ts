/**
 * @file Tests TDD pour service categories hiérarchiques - STUB
 * @description Tests simplifiés pour stub temporaire
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { CategoriesService } from '@/lib/categories/categories-service'

describe('CategoriesService - STUB', () => {
  let categoriesService: CategoriesService
  
  beforeEach(() => {
    categoriesService = new CategoriesService()
  })

  describe('getRootCategories - Récupération catégories racine', () => {
    it('devrait retourner un tableau vide (stub)', async () => {
      const result = await categoriesService.getRootCategories()
      expect(result).toEqual([])
    })
  })

  describe('getCategoryWithChildren - Récupération avec enfants', () => {
    it('devrait retourner null (stub)', async () => {
      const result = await categoriesService.getCategoryWithChildren('test-id')
      expect(result).toBeNull()
    })
  })

  describe('getCategoryHierarchy - Hiérarchie complète', () => {
    it('devrait retourner un tableau vide (stub)', async () => {
      const result = await categoriesService.getCategoryHierarchy()
      expect(result).toEqual([])
    })
  })
})