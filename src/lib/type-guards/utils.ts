/**
 * Type Guard Utilities
 * 
 * Helper functions and additional validation utilities
 */

import { isString, isValidEmail } from './basic';
import { isUserRole, isProductLabel } from './enums';
import { UUIDSchema, EmailSchema, PasswordSchema, PhoneNumberSchema, LanguageSchema } from './zod-schemas';
import type { UserRole, ProductLabel } from '@/types/database';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Assert function pour développement - lance une erreur si le type guard échoue
 */
export function assert<T>(
  value: unknown,
  guard: (v: unknown) => v is T,
  message?: string
): asserts value is T {
  if (!guard(value)) {
    throw new Error(message || `Type assertion failed for value: ${JSON.stringify(value)}`);
  }
}

/**
 * Safe cast - retourne null si le type guard échoue
 */
export function safeCast<T>(
  value: unknown,
  guard: (v: unknown) => v is T
): T | null {
  return guard(value) ? value : null;
}

// ============================================================================
// ADDITIONAL VALIDATION FOR TESTS
// ============================================================================

export function isValidRole(value: unknown): value is UserRole {
  return isUserRole(value);
}

export function isValidLanguage(value: unknown): value is 'fr' | 'en' {
  const result = LanguageSchema.safeParse(value);
  return result.success;
}

export function isValidProductLabel(value: unknown): value is ProductLabel {
  return isProductLabel(value);
}

export function isValidEmailAddress(value: unknown): value is string {
  const result = EmailSchema.safeParse(value);
  return result.success;
}

export function isValidPassword(value: unknown): value is string {
  const result = PasswordSchema.safeParse(value);
  return result.success;
}

export function isUUID(value: unknown): value is string {
  const result = UUIDSchema.safeParse(value);
  return result.success;
}

export function isValidPhoneNumber(value: unknown): value is string {
  const result = PhoneNumberSchema.safeParse(value);
  return result.success;
}