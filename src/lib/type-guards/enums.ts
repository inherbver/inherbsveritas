/**
 * Enum Type Guards
 * 
 * HerbisVeritas domain-specific enum validation
 */

import type { 
  ProductLabel, 
  UserRole, 
  OrderStatus, 
  PaymentStatus,
  AddressType,
  ArticleStatus,
  FeaturedType
} from '@/types/database';
import { isString } from './basic';

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
  return Array.isArray(value) && value.every(isProductLabel);
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