const nextJest = require('next/jest')

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Test directories
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}',
  ],
  
  // Module path mapping for absolute imports  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Coverage settings
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/database.ts', // Generated file
    '!src/components/ui/**', // shadcn/ui external components
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!src/**/*.config.{js,ts}',
    '!src/middleware.ts', // Next.js middleware
  ],
  
  coverageReporters: ['text', 'lcov', 'html', ['text', {skipFull: true}]],
  coverageDirectory: 'coverage',
  
  // Coverage thresholds MVP activés selon CLAUDE.md
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 80,
      statements: 80
    },
    './src/lib/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './app/': {
      branches: 75,
      functions: 80,
      lines: 75,
      statements: 75
    }
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config)