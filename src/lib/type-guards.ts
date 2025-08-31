/**
 * HerbisVeritas V2 - Type Guards Library
 * 
 * Collection de type guards pour éliminer 'any' et 'unknown'
 * Patterns Context7 pour sécurité runtime
 * 
 * @version 1.0.0
 * @since 2025-01-28
 */

import { z } from 'zod';
import type { 
  ProductLabel, 
  UserRole, 
  OrderStatus, 
  PaymentStatus,
  AddressType,
  ArticleStatus,
  FeaturedType
} from '@/types/database';

// ============================================================================
// 1. BASIC TYPE GUARDS
// ============================================================================

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) return false;
  if (!itemGuard) return true;
  return value.every(itemGuard);
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

// ============================================================================
// 2. HERBISVERITAS DOMAIN TYPE GUARDS
// ============================================================================

// Product Label validation
const VALID_PRODUCT_LABELS: readonly ProductLabel[] = [
  'recolte_main',
  'bio', 
  'origine_occitanie',
  'partenariat_producteurs',
  'rituel_bien_etre',
  'rupture_recolte',
  'essence_precieuse'
] as const;

export function isProductLabel(value: unknown): value is ProductLabel {
  return isString(value) && VALID_PRODUCT_LABELS.includes(value as ProductLabel);
}

export function isProductLabelArray(value: unknown): value is ProductLabel[] {
  return isArray(value, isProductLabel);
}

// User Role validation
const VALID_USER_ROLES: readonly UserRole[] = ['user', 'admin', 'dev'] as const;

export function isUserRole(value: unknown): value is UserRole {
  return isString(value) && VALID_USER_ROLES.includes(value as UserRole);
}

// Order Status validation  
const VALID_ORDER_STATUSES: readonly OrderStatus[] = [
  'pending_payment',
  'processing', 
  'shipped',
  'delivered'
] as const;

export function isOrderStatus(value: unknown): value is OrderStatus {
  return isString(value) && VALID_ORDER_STATUSES.includes(value as OrderStatus);
}

// Payment Status validation
const VALID_PAYMENT_STATUSES: readonly PaymentStatus[] = [
  'pending',
  'succeeded',
  'failed', 
  'refunded'
] as const;

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return isString(value) && VALID_PAYMENT_STATUSES.includes(value as PaymentStatus);
}

// Address Type validation
const VALID_ADDRESS_TYPES: readonly AddressType[] = ['shipping', 'billing'] as const;

export function isAddressType(value: unknown): value is AddressType {
  return isString(value) && VALID_ADDRESS_TYPES.includes(value as AddressType);
}

// Article Status validation
const VALID_ARTICLE_STATUSES: readonly ArticleStatus[] = ['draft', 'published', 'archived'] as const;

export function isArticleStatus(value: unknown): value is ArticleStatus {
  return isString(value) && VALID_ARTICLE_STATUSES.includes(value as ArticleStatus);
}

// Featured Type validation
const VALID_FEATURED_TYPES: readonly FeaturedType[] = ['product', 'article', 'event'] as const;

export function isFeaturedType(value: unknown): value is FeaturedType {
  return isString(value) && VALID_FEATURED_TYPES.includes(value as FeaturedType);
}

// ============================================================================
// 3. ENTITY TYPE GUARDS
// ============================================================================

export interface HasId {
  id: string;
}

export function hasId(value: unknown): value is HasId {
  return isObject(value) && isNonEmptyString(value['id']);
}

export interface HasTimestamps {
  created_at: string;
  updated_at: string;
}

export function hasTimestamps(value: unknown): value is HasTimestamps {
  return isObject(value) && 
         isNonEmptyString(value['created_at']) && 
         isNonEmptyString(value['updated_at']);
}

// Product type guard
export interface ProductShape extends HasId, HasTimestamps {
  slug: string;
  name: string;
  price: number;
  currency: string;
  stock: number;
  is_active: boolean;
  labels?: ProductLabel[] | null;
  inci_list?: string[] | null;
}

export function isProduct(value: unknown): value is ProductShape {
  return isObject(value) &&
         hasId(value) &&
         hasTimestamps(value) &&
         isNonEmptyString(value['slug']) &&
         isNonEmptyString(value['name']) &&
         isPositiveNumber(value['price']) &&
         isNonEmptyString(value['currency']) &&
         isNumber(value['stock']) &&
         isBoolean(value['is_active']) &&
         (value['labels'] === null || value['labels'] === undefined || isProductLabelArray(value['labels'])) &&
         (value['inci_list'] === null || value['inci_list'] === undefined || isArray(value['inci_list'], isString));
}

// User type guard
export interface UserShape extends HasId, HasTimestamps {
  email: string;
  role: UserRole;
  status: string;
  newsletter_subscribed: boolean;
}

export function isUser(value: unknown): value is UserShape {
  return isObject(value) &&
         hasId(value) &&
         hasTimestamps(value) &&
         isNonEmptyString(value['email']) &&
         isUserRole(value['role']) &&
         isNonEmptyString(value['status']) &&
         isBoolean(value['newsletter_subscribed']);
}

// Order type guard
export interface OrderShape extends HasId, HasTimestamps {
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  currency: string;
}

export function isOrder(value: unknown): value is OrderShape {
  return isObject(value) &&
         hasId(value) &&
         hasTimestamps(value) &&
         isNonEmptyString(value['user_id']) &&
         isOrderStatus(value['status']) &&
         isPaymentStatus(value['payment_status']) &&
         isPositiveNumber(value['total_amount']) &&
         isNonEmptyString(value['currency']);
}

// ============================================================================
// 4. API RESPONSE TYPE GUARDS
// ============================================================================

export interface ApiSuccessResponse<T> {
  data: T;
  status: 'success';
  timestamp: string;
}

export interface ApiErrorResponse {
  error: string;
  status: 'error';
  timestamp: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return isObject(response) && response.status === 'success' && 'data' in response;
}

export function isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return isObject(response) && 
         response.status === 'error' && 
         'error' in response &&
         isNonEmptyString(response.error);
}

// ============================================================================
// 5. ZOD SCHEMA INTEGRATION
// ============================================================================

// Zod schemas pour validation runtime
export const ProductLabelSchema = z.enum(['recolte_main', 'bio', 'origine_occitanie', 'partenariat_producteurs', 'rituel_bien_etre', 'rupture_recolte', 'essence_precieuse']);
export const UserRoleSchema = z.enum(['user', 'admin', 'dev']);
export const OrderStatusSchema = z.enum(['pending_payment', 'processing', 'shipped', 'delivered']);
export const PaymentStatusSchema = z.enum(['pending', 'succeeded', 'failed', 'refunded']);
export const AddressTypeSchema = z.enum(['billing', 'shipping']);
export const ArticleStatusSchema = z.enum(['draft', 'published', 'archived']);
export const FeaturedTypeSchema = z.enum(['product', 'article', 'partner']);

// Schema pour UUID validation
export const UUIDSchema = z.string().uuid();

// Schema pour email
export const EmailSchema = z.string().email();

// Schema pour URL
export const URLSchema = z.string().url();

// Schema pour prix (positif avec 2 décimales max)
export const PriceSchema = z.number().positive().multipleOf(0.01);

// ============================================================================
// 6. FORM VALIDATION TYPE GUARDS
// ============================================================================

export interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export function isFormField<T>(
  value: unknown, 
  valueGuard: (v: unknown) => v is T
): value is FormField<T> {
  return isObject(value) &&
         valueGuard(value['value']) &&
         (value['error'] === undefined || isNonEmptyString(value['error'])) &&
         isBoolean(value['touched']) &&
         isBoolean(value['dirty']);
}

// ============================================================================
// 7. PAGINATION TYPE GUARDS
// ============================================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function isPaginationParams(value: unknown): value is PaginationParams {
  return isObject(value) &&
         isPositiveNumber(value['page']) &&
         isPositiveNumber(value['pageSize']) &&
         (value['sortBy'] === undefined || isNonEmptyString(value['sortBy'])) &&
         (value['sortOrder'] === undefined || value['sortOrder'] === 'asc' || value['sortOrder'] === 'desc');
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export function isPaginatedResult<T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is PaginatedResult<T> {
  return isObject(value) &&
         isArray(value['data'], itemGuard) &&
         isNumber(value['total']) &&
         isPositiveNumber(value['page']) &&
         isPositiveNumber(value['pageSize']) &&
         isBoolean(value['hasMore']);
}

// ============================================================================
// 8. UTILITY FUNCTIONS
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

// ============================================================================
// 9. ADDITIONAL VALIDATION FUNCTIONS FOR TESTS
// ============================================================================

export function isValidRole(value: unknown): value is UserRole {
  return isUserRole(value);
}

export function isValidLanguage(value: unknown): value is 'fr' | 'en' {
  return isString(value) && (value === 'fr' || value === 'en');
}

export function isValidProductLabel(value: unknown): value is ProductLabel {
  return isProductLabel(value);
}

export function isValidEmail(value: unknown): value is string {
  const result = EmailSchema.safeParse(value);
  return result.success;
}

export function isValidPassword(value: unknown): value is string {
  return isString(value) && value.length >= 8;
}

export function isUUID(value: unknown): value is string {
  const result = UUIDSchema.safeParse(value);
  return result.success;
}

export function isValidPhoneNumber(value: unknown): value is string {
  const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
  return isString(value) && phoneRegex.test(value);
}