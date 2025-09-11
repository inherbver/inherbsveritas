/**
 * ROOT: VALIDATION SCHEMA — PRODUCTS MVP
 * Rôle:
 *  - Valider DB -> DTO (enums stricts ProductLabel; nullables normalisés; arrays jamais `undefined`)
 *  - Centraliser les règles (prix unités, status, i18n JSONB)
 *  - Fonctions pures (aucun I/O); synchrones
 * Erreurs:
 *  - Rejeter toute valeur hors enum ProductLabel (7 valeurs fixes)
 *  - Ne jamais corriger silencieusement (throw explicite)
 *  - Prix négatifs rejetés
 */

import { z } from 'zod'
import type { ProductLabel, ProductStatus, ProductDTO } from '@/lib/types/domain/product'

// Schema enum pour ProductLabel (7 valeurs fixes HerbisVeritas)
export const ProductLabelSchema = z.enum([
  'recolte_main',
  'bio', 
  'origine_occitanie',
  'partenariat_producteurs',
  'rituel_bien_etre',
  'rupture_recolte',
  'essence_precieuse'
])

// Schema enum pour ProductStatus
export const ProductStatusSchema = z.enum(['active', 'inactive', 'draft'])

// Schema pour traductions i18n JSONB
export const ProductTranslationsSchema = z.object({
  fr: z.object({
    name: z.string().optional(),
    description_short: z.string().optional(),
    description_long: z.string().optional()
  }).default({}),
  en: z.object({
    name: z.string().optional(),
    description_short: z.string().optional(), 
    description_long: z.string().optional()
  }).default({})
}).default({ fr: {}, en: {} })

// Schema principal ProductDTO
export const ProductDTOSchema = z.object({
  // Identifiants
  id: z.string().uuid('ID must be valid UUID'),
  slug: z.string().min(1, 'Slug required').max(100, 'Slug too long'),
  category_id: z.string().uuid('Category ID must be valid UUID').nullable(),
  
  // Informations de base
  name: z.string().min(1, 'Name required').max(200, 'Name too long'),
  description_short: z.string().max(500, 'Short description too long').nullable(),
  description_long: z.string().max(5000, 'Long description too long').nullable(),
  
  // Commerce (prix EN UNITÉS, validation stricte)
  price: z.number()
    .positive('Price must be positive')
    .max(9999.99, 'Price too high')
    .multipleOf(0.01, 'Price must have max 2 decimal places'),
  currency: z.string().length(3, 'Currency must be 3 chars (ISO)').default('EUR'),
  stock: z.number().int('Stock must be integer').min(0, 'Stock cannot be negative'),
  unit: z.string().min(1, 'Unit required').max(20, 'Unit too long').default('pièce'),
  
  // Média
  image_url: z.string().url('Invalid image URL').nullable(),
  
  // Spécificités cosmétique (arrays jamais undefined)
  inci_list: z.array(z.string().min(1, 'INCI ingredient cannot be empty')).default([]),
  labels: z.array(ProductLabelSchema).default([]),
  
  // États
  status: ProductStatusSchema.default('active'),
  is_active: z.boolean().default(true),
  is_new: z.boolean().default(false),
  
  // i18n
  translations: ProductTranslationsSchema,
  
  // Timestamps
  created_at: z.string().datetime('Invalid created_at timestamp'),
  updated_at: z.string().datetime('Invalid updated_at timestamp')
})

// Schema pour validation DB row -> DTO (plus permissif pour nulls DB)
export const ProductDBRowSchema = ProductDTOSchema.extend({
  // DB peut avoir des nulls qui seront normalisés
  inci_list: z.array(z.string()).nullable().transform(val => val ?? []),
  labels: z.array(ProductLabelSchema).nullable().transform(val => val ?? []),
  translations: z.any().transform((val) => {
    if (!val || typeof val !== 'object') return {}
    return val
  })
})

// Schema pour filtres de recherche
export const ProductFiltersSchema = z.object({
  category_id: z.string().uuid().optional(),
  labels: z.array(ProductLabelSchema).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  search: z.string().min(1).max(100).optional(),
  inStock: z.boolean().optional()
}).refine(
  data => !data.priceMin || !data.priceMax || data.priceMin <= data.priceMax,
  { message: 'priceMin must be <= priceMax' }
)

// Schema pour pagination
export const ProductPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(24)
})

// Fonctions de validation avec messages d'erreur détaillés
export function validateProductDTO(data: unknown): ProductDTO {
  try {
    return ProductDTOSchema.parse(data) as ProductDTO
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      throw new Error(`Product validation failed: ${firstError?.path.join('.') || 'unknown'}: ${firstError?.message || 'unknown error'}`)
    }
    throw new Error('Product validation failed: Unknown error')
  }
}

export function validateProductDBRow(data: unknown): ProductDTO {
  try {
    return ProductDBRowSchema.parse(data) as ProductDTO
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0] 
      throw new Error(`Product DB row validation failed: ${firstError?.path.join('.') || 'unknown'}: ${firstError?.message || 'unknown error'}`)
    }
    throw new Error('Product DB row validation failed: Unknown error')
  }
}

export function validateProductFilters(data: unknown) {
  return ProductFiltersSchema.parse(data)
}

export function validateProductPagination(data: unknown) {
  return ProductPaginationSchema.parse(data)
}

// Type guards pour runtime checks
export function isValidProductLabel(value: string): value is ProductLabel {
  return ProductLabelSchema.safeParse(value).success
}

export function isValidProductStatus(value: string): value is ProductStatus {
  return ProductStatusSchema.safeParse(value).success
}

// Utilitaires de normalisation
export function normalizeProductLabels(labels: unknown): ProductLabel[] {
  if (!Array.isArray(labels)) return []
  return labels.filter(isValidProductLabel)
}

export function normalizeInciList(inci: unknown): string[] {
  if (!Array.isArray(inci)) return []
  return inci.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

// Constantes de validation
export const VALIDATION_CONSTANTS = {
  MAX_NAME_LENGTH: 200,
  MAX_SHORT_DESC_LENGTH: 500,
  MAX_LONG_DESC_LENGTH: 5000,
  MAX_SLUG_LENGTH: 100,
  MAX_PRICE: 9999.99,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 24
} as const