/**
 * API Response Type Guards
 * 
 * Validation for API responses, pagination, and form data
 */

import { isObject, isNonEmptyString, isPositiveNumber, isNumber, isBoolean, isArray } from './basic';

// ============================================================================
// API RESPONSE TYPES
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
// PAGINATION TYPES
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
// FORM VALIDATION TYPES
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