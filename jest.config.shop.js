/**
 * @file Configuration Jest pour tests catalogue shop - Semaine 4 MVP
 * @description Configuration spécialisée pour tests frontend catalogue
 */

const nextJest = require('next/jest')
const path = require('path')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Custom Jest configuration for shop catalog tests
const customJestConfig = {
  displayName: 'Shop Catalog Tests',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Test patterns for shop-specific tests
  testMatch: [
    '<rootDir>/tests/unit/components/shop/**/*.test.{ts,tsx}',
    '<rootDir>/tests/integration/pages/shop.test.tsx',
    '<rootDir>/tests/unit/lib/products/**/*.test.{ts,tsx}',
    '<rootDir>/tests/unit/lib/categories/**/*.test.{ts,tsx}'
  ],
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1'
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/components/shop/**/*.{ts,tsx}',
    'src/app/[locale]/shop/**/*.{ts,tsx}',
    'src/lib/products/**/*.{ts,tsx}',
    'src/lib/categories/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}'
  ],
  
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    // Seuils spécifiques pour composants critiques
    './src/components/shop/product-filters.tsx': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/lib/products/products-service.ts': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/lib/categories/categories-service.ts': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'lcov', 
    'html',
    'json-summary'
  ],
  
  coverageDirectory: '<rootDir>/coverage/shop',
  
  // Setup files
  setupFiles: [
    '<rootDir>/tests/setup/env.setup.js'
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Test timeout
  testTimeout: 10000,
  
  // Global mocks
  globalSetup: '<rootDir>/tests/setup/global-setup.js',
  globalTeardown: '<rootDir>/tests/setup/global-teardown.js',
  
  // Clear mocks automatically
  clearMocks: true,
  
  // Restore mocks automatically 
  restoreMocks: true,
  
  // Verbose output for debugging
  verbose: false,
  
  // Max worker threads
  maxWorkers: '50%'
}

// Export Jest config created by next/jest
module.exports = createJestConfig(customJestConfig)