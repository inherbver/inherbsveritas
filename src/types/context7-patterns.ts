/**
 * HerbisVeritas V2 - Context7 TypeScript Patterns
 * 
 * Patterns avancés pour éliminer 'any' et assurer la sécurité des types
 * Basé sur les bonnes pratiques Context7 MCP
 * 
 * @version 1.0.0
 * @since 2025-01-28
 */

// ============================================================================
// 1. BRANDED TYPES - Sécurité Domaine Métier
// ============================================================================

export type ProductId = string & { readonly _brand: 'ProductId' };
export type UserId = string & { readonly _brand: 'UserId' };
export type OrderId = string & { readonly _brand: 'OrderId' };
export type CategoryId = string & { readonly _brand: 'CategoryId' };
export type CartId = string & { readonly _brand: 'CartId' };
export type AddressId = string & { readonly _brand: 'AddressId' };
export type ArticleId = string & { readonly _brand: 'ArticleId' };
export type PartnerId = string & { readonly _brand: 'PartnerId' };

// Factory functions pour branded types
export const createProductId = (id: string): ProductId => id as ProductId;
export const createUserId = (id: string): UserId => id as UserId;
export const createOrderId = (id: string): OrderId => id as OrderId;
export const createCategoryId = (id: string): CategoryId => id as CategoryId;
export const createCartId = (id: string): CartId => id as CartId;
export const createAddressId = (id: string): AddressId => id as AddressId;
export const createArticleId = (id: string): ArticleId => id as ArticleId;
export const createPartnerId = (id: string): PartnerId => id as PartnerId;

// ============================================================================
// 2. GENERIC CONSTRAINTS - Pas de Any
// ============================================================================

// Interface de base pour toutes les entités avec ID
export interface HasId {
  readonly id: string;
}

// Interface pour entités avec timestamps
export interface HasTimestamps {
  readonly created_at: string;
  readonly updated_at: string;
}

// Interface pour entités avec statut
export interface HasStatus<TStatus extends string = string> {
  readonly status: TStatus;
}

// Generic constraint pour mise à jour d'entités
export type EntityUpdate<T extends HasId> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;

// Generic pour résultats paginés
export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

// ============================================================================
// 3. TYPE GUARDS - Remplacement de Any
// ============================================================================

// Type guard générique pour vérifier les objets
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Type guard pour vérifier si une valeur a un ID
export function hasId(value: unknown): value is HasId {
  return isObject(value) && typeof value['id'] === 'string';
}

// Type guard pour vérifier les timestamps
export function hasTimestamps(value: unknown): value is HasTimestamps {
  return isObject(value) && 
         typeof value['created_at'] === 'string' && 
         typeof value['updated_at'] === 'string';
}

// Type guard pour réponses API
export interface ApiResponse<T> {
  readonly data: T;
  readonly status: 'success';
  readonly timestamp: string;
}

export interface ApiError {
  readonly error: string;
  readonly status: 'error';
  readonly timestamp: string;
  readonly code?: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export function isApiSuccess<T>(result: ApiResult<T>): result is ApiResponse<T> {
  return result.status === 'success';
}

export function isApiError<T>(result: ApiResult<T>): result is ApiError {
  return result.status === 'error';
}

// ============================================================================
// 4. UTILITY TYPES AVANCÉS
// ============================================================================

// Deep partial pour updates complexes
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object 
    ? T[P] extends readonly (infer U)[]
      ? readonly U[]
      : DeepPartial<T[P]>
    : T[P];
};

// Extraction de clés par type
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Propriétés requises
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Propriétés optionnelles
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ============================================================================
// 5. FORM HANDLING TYPES
// ============================================================================

// État de champ de formulaire
export interface FormField<T> {
  readonly value: T;
  readonly error?: string;
  readonly touched: boolean;
  readonly dirty: boolean;
}

// État complet de formulaire
export type FormState<T> = {
  readonly [K in keyof T]: FormField<T[K]>;
};

// Actions de formulaire
export type FormAction<T> = 
  | { type: 'SET_VALUE'; field: keyof T; value: T[keyof T] }
  | { type: 'SET_ERROR'; field: keyof T; error: string }
  | { type: 'SET_TOUCHED'; field: keyof T }
  | { type: 'RESET_FIELD'; field: keyof T }
  | { type: 'RESET_FORM' };

// ============================================================================
// 6. ASYNC STATE PATTERNS
// ============================================================================

// États de loading
export type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; error: string };

// Resource avec état async
export interface AsyncResource<T> {
  readonly data: T | null;
  readonly loading: LoadingState;
  readonly lastFetched?: string;
}

// Hook result pattern
export interface UseAsyncResult<T, E = string> {
  readonly data: T | null;
  readonly error: E | null;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly isSuccess: boolean;
  readonly refetch: () => Promise<void>;
}

// ============================================================================
// 7. EVENT PATTERNS - No Any
// ============================================================================

// Event handler types stricts
export interface CustomEventMap {
  'product:added-to-cart': { productId: ProductId; quantity: number };
  'user:logged-in': { userId: UserId };
  'order:created': { orderId: OrderId };
  'cart:updated': { cartId: CartId; itemCount: number };
}

export type CustomEventHandler<K extends keyof CustomEventMap> = 
  (data: CustomEventMap[K]) => void;

// ============================================================================
// 8. VALIDATION PATTERNS
// ============================================================================

// Résultat de validation
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ValidationError[];
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

// Validator function type
export type Validator<T> = (value: T) => ValidationResult;

// Composition de validators
export function composeValidators<T>(...validators: readonly Validator<T>[]): Validator<T> {
  return (value: T): ValidationResult => {
    const errors: ValidationError[] = [];
    
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        errors.push(...result.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
}

// ============================================================================
// 9. ERROR HANDLING - Type Safe
// ============================================================================

// Base error class
export abstract class HerbisVeritasError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  
  constructor(message: string, public readonly context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Erreurs métier spécifiques
export class ProductNotFoundError extends HerbisVeritasError {
  readonly code = 'PRODUCT_NOT_FOUND';
  readonly statusCode = 404;
}

export class InsufficientStockError extends HerbisVeritasError {
  readonly code = 'INSUFFICIENT_STOCK';
  readonly statusCode = 400;
}

export class InvalidPaymentError extends HerbisVeritasError {
  readonly code = 'INVALID_PAYMENT';
  readonly statusCode = 402;
}

// Error result pattern
export type Result<T, E = HerbisVeritasError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// ============================================================================
// 10. COMPONENT PROPS PATTERNS
// ============================================================================

// Props de base pour tous les composants
export interface BaseComponentProps {
  readonly className?: string;
  readonly testId?: string;
}

// Props avec enfants
export interface ComponentWithChildren extends BaseComponentProps {
  readonly children: React.ReactNode;
}

// Props pour composants avec état de loading
export interface LoadingComponentProps extends BaseComponentProps {
  readonly isLoading?: boolean;
  readonly loadingText?: string;
}

// Props strictement typées pour événements
export interface ClickableProps extends BaseComponentProps {
  readonly onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
}

// ============================================================================
// 11. INTERFACES POUR TESTS - Compatibilité
// ============================================================================

export interface Context7Pattern {
  id: string;
  name: string;
  description: string;
  category: PatternCategory;
  implementation: string;
  examples: string[];
}

export interface AuthPattern extends Context7Pattern {
  category: 'auth';
  permissions: string[];
  roles: string[];
}

export interface DataPattern extends Context7Pattern {
  category: 'data';
  schema: Record<string, unknown>;
  validations: ValidationRule[];
}

export interface UIPattern extends Context7Pattern {
  category: 'ui';
  components: string[];
  styling: Record<string, unknown>;
}

export interface SecurityPattern extends Context7Pattern {
  category: 'security';
  vulnerabilities: string[];
  mitigations: string[];
}

export type PatternCategory = 'auth' | 'data' | 'ui' | 'security' | 'performance';

export interface PatternConfig {
  enabled: boolean;
  priority: number;
  settings: Record<string, unknown>;
}

export interface ValidationRule {
  field: string;
  type: string;
  required: boolean;
  constraints?: Record<string, unknown>;
}