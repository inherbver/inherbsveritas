/**
 * Address Management Library - HerbisVeritas V2 MVP
 * 
 * Refactored address CRUD operations with proper separation of concerns
 * 
 * @version 2.0.0
 * @since 2025-01-28
 */

// Re-export all address functionality with organized structure
export * from './schemas';
export * from './crud';
export * from './operations';
export * from './queries';

// ============================================================================
// BACKWARD COMPATIBILITY ALIASES
// ============================================================================

// Maintain compatibility with existing code
export { getUserAddresses } from './crud';
export { updateAddress, deleteAddress } from './operations';
export { getAddressesByType, getDefaultAddress } from './queries';