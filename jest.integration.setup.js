// Integration tests setup
// Real Supabase connection for integration tests

// Load test environment variables
require('dotenv').config({ path: '.env.test.local' })

// Global test utilities for integration tests
global.testTimeout = 10000

// Mock console warnings for cleaner test output
const originalWarn = console.warn
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is deprecated')
  ) {
    return
  }
  originalWarn.apply(console, args)
}