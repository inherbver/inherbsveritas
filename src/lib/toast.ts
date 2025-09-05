/**
 * Simple toast system - temporary replacement for Sonner
 * Phase 2: Basic implementation for cart notifications
 */

// Simple console-based toast for Phase 2
export const toast = {
  success: (message: string) => {
    console.log(`✅ SUCCESS: ${message}`);
    // TODO: Implement real toast UI component or integrate with existing system
  },
  
  error: (message: string) => {
    console.error(`❌ ERROR: ${message}`);
    // TODO: Implement real toast UI component or integrate with existing system
  },
  
  info: (message: string) => {
    console.info(`ℹ️ INFO: ${message}`);
  },
  
  warning: (message: string) => {
    console.warn(`⚠️ WARNING: ${message}`);
  }
};