const nextJest = require('next/jest')

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  dir: './',
})

// Integration tests config - tests with real database/API
const config = {
  displayName: 'Integration Tests',
  coverageProvider: 'v8',
  testEnvironment: 'node', // Node environment for API/database tests
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  
  // Integration test directories
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}',
  ],
  
  // Module path mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Longer timeout for integration tests
  testTimeout: 10000,
  
  // Coverage for integration tests
  collectCoverage: false, // Usually disabled for integration tests
  
  // Global setup/teardown désactivé temporairement
  // globalSetup: '<rootDir>/tests/integration/setup.ts',
  // globalTeardown: '<rootDir>/tests/integration/teardown.ts',
}

module.exports = createJestConfig(config)