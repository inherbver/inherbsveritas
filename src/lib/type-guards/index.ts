/**
 * Type Guards Library - HerbisVeritas V2
 * 
 * Refactored type guard collection with proper separation of concerns
 * 
 * @version 2.0.0
 * @since 2025-01-28
 */

// Re-export all type guards with organized structure
export * from './basic';
export * from './enums';  
export * from './entities';
export * from './api';
export * from './zod-schemas';
// export * from './utils';

// ============================================================================
// BACKWARD COMPATIBILITY ALIASES
// ============================================================================

// Maintain compatibility with existing code
// export { isValidEmailAddress as isValidEmail } from './utils';