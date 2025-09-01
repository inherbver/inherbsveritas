/**
 * Tests unitaires pour lib/type-guards
 * Tests fonctions de validation de types
 */

import {
  isUserRole as isValidRole,
  isProductLabel as isValidProductLabel,
  isValidEmail,
  isUUID,
  isNonEmptyString,
  isPositiveNumber
} from '@/lib/type-guards'

describe('lib/type-guards', () => {
  describe('isValidRole', () => {
    it('should validate correct roles', () => {
      expect(isValidRole('user')).toBe(true)
      expect(isValidRole('admin')).toBe(true)
      expect(isValidRole('dev')).toBe(true)
    })

    it('should reject invalid roles', () => {
      expect(isValidRole('invalid')).toBe(false)
      expect(isValidRole('')).toBe(false)
      expect(isValidRole(null)).toBe(false)
      expect(isValidRole(undefined)).toBe(false)
    })
  })

  describe('isValidProductLabel', () => {
    it('should validate HerbisVeritas labels', () => {
      expect(isValidProductLabel('bio')).toBe(true)
      expect(isValidProductLabel('recolte_main')).toBe(true)
      expect(isValidProductLabel('origine_occitanie')).toBe(true)
      expect(isValidProductLabel('partenariat_producteurs')).toBe(true)
      expect(isValidProductLabel('rituel_bien_etre')).toBe(true)
      expect(isValidProductLabel('rupture_recolte')).toBe(true)
      expect(isValidProductLabel('essence_precieuse')).toBe(true)
    })

    it('should reject invalid labels', () => {
      expect(isValidProductLabel('invalid_label')).toBe(false)
      expect(isValidProductLabel('')).toBe(false)
      expect(isValidProductLabel(null)).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('test+tag@herbisveritas.fr')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail(null)).toBe(false)
    })
  })


  describe('isUUID', () => {
    it('should validate correct UUID formats', () => {
      expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(isUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true)
    })

    it('should reject invalid UUID formats', () => {
      expect(isUUID('not-a-uuid')).toBe(false)
      expect(isUUID('550e8400-e29b-41d4-a716')).toBe(false)
      expect(isUUID('')).toBe(false)
      expect(isUUID(null)).toBe(false)
    })
  })

  describe('isNonEmptyString', () => {
    it('should validate non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true)
      expect(isNonEmptyString('   text   ')).toBe(true)
    })

    it('should reject empty or non-string values', () => {
      expect(isNonEmptyString('')).toBe(false)
      expect(isNonEmptyString('   ')).toBe(false)
      expect(isNonEmptyString(null)).toBe(false)
      expect(isNonEmptyString(undefined)).toBe(false)
      expect(isNonEmptyString(123 as any)).toBe(false)
    })
  })

  describe('isPositiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true)
      expect(isPositiveNumber(29.99)).toBe(true)
      expect(isPositiveNumber(0.01)).toBe(true)
    })

    it('should reject non-positive numbers', () => {
      expect(isPositiveNumber(0)).toBe(false)
      expect(isPositiveNumber(-1)).toBe(false)
      expect(isPositiveNumber(NaN)).toBe(false)
      expect(isPositiveNumber('10' as any)).toBe(false)
      expect(isPositiveNumber(null as any)).toBe(false)
    })
  })

})