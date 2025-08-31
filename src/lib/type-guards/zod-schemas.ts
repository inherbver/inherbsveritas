/**
 * Zod Schema Integration
 * 
 * Runtime validation schemas for HerbisVeritas domain
 */

import { z } from 'zod';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const ProductLabelSchema = z.enum([
  'recolte_main', 
  'bio', 
  'origine_occitanie', 
  'partenariat_producteurs', 
  'rituel_bien_etre', 
  'rupture_recolte', 
  'essence_precieuse'
]);

export const UserRoleSchema = z.enum(['user', 'admin', 'dev']);

export const OrderStatusSchema = z.enum([
  'pending_payment', 
  'processing', 
  'shipped', 
  'delivered'
]);

export const PaymentStatusSchema = z.enum([
  'pending', 
  'succeeded', 
  'failed', 
  'refunded'
]);

export const AddressTypeSchema = z.enum(['billing', 'shipping']);

export const ArticleStatusSchema = z.enum(['draft', 'published', 'archived']);

export const FeaturedTypeSchema = z.enum(['product', 'article', 'event']);

// ============================================================================
// PRIMITIVE SCHEMAS
// ============================================================================

export const UUIDSchema = z.string().uuid();

export const EmailSchema = z.string().email();

export const URLSchema = z.string().url();

export const PriceSchema = z.number().positive().multipleOf(0.01);

export const PasswordSchema = z.string().min(8);

export const PhoneNumberSchema = z.string().regex(/^(\+33|0)[1-9](\d{8})$/);

export const LanguageSchema = z.enum(['fr', 'en']);

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validation avec Zod schema
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = schema.parse(value);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof z.ZodError 
      ? error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      : 'Validation failed';
    return { success: false, error: message };
  }
}

/**
 * Safe parse with default value
 */
export function safeParseWithDefault<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
  defaultValue: T
): T {
  const result = schema.safeParse(value);
  return result.success ? result.data : defaultValue;
}