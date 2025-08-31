/**
 * Tests unitaires pour lib/utils
 * Tests fonctions utilitaires partagées
 */

import { cn } from '@/lib/utils'

describe('lib/utils', () => {
  describe('cn - className merger', () => {
    it('should merge basic class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle undefined/null values', () => {
      const result = cn('class1', undefined, null, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle empty strings', () => {
      const result = cn('class1', '', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const isDisabled = false
      
      const result = cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled'
      )
      
      expect(result).toBe('base-class active')
    })

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle object with boolean values', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true
      })
      
      expect(result).toBe('class1 class3')
    })
  })
})