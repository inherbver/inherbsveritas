/**
 * Toast Notification System - HerbisVeritas V2 MVP
 * 
 * Refactored toast system with proper separation of concerns
 * 
 * @version 2.0.0 
 * @since 2025-01-28
 */

// Core system
export { ToastSystem } from './toast-core';
export * from './types';

// Business patterns
export { businessToasts } from './business-patterns';

// React hooks
export { useToast, useAsyncToast } from './hooks';

// Default instance
export { ToastSystem } from './toast-core';

// Create and export default instance
import { ToastSystem } from './toast-core';
export const toastSystem = new ToastSystem();

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

// Re-export for existing code compatibility
export { useToast as useToastSystem } from './hooks';