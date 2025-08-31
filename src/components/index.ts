// Compatibility exports - maintain existing imports during migration
// TODO: Remove after full migration to modules structure

// Re-export new UI components for compatibility
export * from './ui'

// Re-export new modules
export * from './modules/boutique'

// Legacy re-exports (temporary during migration)
// Keep existing component exports working during gradual migration

// Auth components
export { default as AuthGuard } from './auth/auth-guard'
export { default as LogoutButton } from './auth/logout-button'
export { default as RoleGate } from './auth/role-gate'

// Forms - if they exist and need to be maintained
// Add other legacy exports as needed during migration