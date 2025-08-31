/**
 * Entity Type Guards
 * 
 * Complex entity shape validation for HerbisVeritas domain objects
 */

import { isObject, isNonEmptyString, isPositiveNumber, isNumber, isBoolean, isArray, isString } from './basic';
import { isProductLabel, isUserRole, isOrderStatus, isPaymentStatus } from './enums';
import type { ProductLabel, UserRole, OrderStatus, PaymentStatus } from '@/types/database';

// ============================================================================
// BASE INTERFACES
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

// ============================================================================
// DOMAIN ENTITIES
// ============================================================================

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
         (value['labels'] === null || value['labels'] === undefined || isArray(value['labels'], isProductLabel)) &&
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

// Address type guard
export interface AddressShape extends HasId, HasTimestamps {
  user_id: string;
  address_type: string;
  first_name: string;
  last_name: string;
  address_line1: string;
  city: string;
  postal_code: string;
  country_code: string;
}

export function isAddress(value: unknown): value is AddressShape {
  return isObject(value) &&
         hasId(value) &&
         hasTimestamps(value) &&
         isNonEmptyString(value['user_id']) &&
         isNonEmptyString(value['address_type']) &&
         isNonEmptyString(value['first_name']) &&
         isNonEmptyString(value['last_name']) &&
         isNonEmptyString(value['address_line1']) &&
         isNonEmptyString(value['city']) &&
         isNonEmptyString(value['postal_code']) &&
         isNonEmptyString(value['country_code']);
}

// Category type guard
export interface CategoryShape extends HasId, HasTimestamps {
  slug: string;
  name: string;
  parent_id?: string | null;
  sort_order: number;
}

export function isCategory(value: unknown): value is CategoryShape {
  return isObject(value) &&
         hasId(value) &&
         hasTimestamps(value) &&
         isNonEmptyString(value['slug']) &&
         isNonEmptyString(value['name']) &&
         isNumber(value['sort_order']) &&
         (value['parent_id'] === null || value['parent_id'] === undefined || isNonEmptyString(value['parent_id']));
}