const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

// Configuration Jest MVP - Focus sur les nouveaux composants
const customJestConfig = {
  displayName: 'MVP Components Tests',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/components/ui/(.*)$': '<rootDir>/src/components/ui/$1',
    '^@/components/modules/(.*)$': '<rootDir>/src/components/modules/$1', 
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    // Focus sur les nouveaux composants MVP
    '<rootDir>/tests/unit/components/ui/**/*.test.{ts,tsx}',
    '<rootDir>/tests/unit/components/modules/**/*.test.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/components/ui/**/*.{ts,tsx}',
    'src/components/modules/**/*.{ts,tsx}',
    'src/types/product.ts',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    './src/components/ui/': {
      statements: 85,
      branches: 70,
      functions: 85,
      lines: 85,
    },
    './src/components/modules/boutique/': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
}

module.exports = createJestConfig(customJestConfig)