/**
 * @file Global setup tests - Semaine 4 MVP
 * @description Configuration globale avant tous les tests
 */

module.exports = async () => {
  console.log('🚀 Starting shop catalog tests...')
  
  // Setup global test environment
  global.__TEST_START_TIME__ = Date.now()
  
  // Mock performance API if not available
  if (typeof performance === 'undefined') {
    global.performance = {
      now: () => Date.now(),
      mark: () => {},
      measure: () => {}
    }
  }
  
  // Mock ResizeObserver for tests
  global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  
  // Mock IntersectionObserver for lazy loading tests
  global.IntersectionObserver = class IntersectionObserver {
    constructor(callback, options) {
      this.callback = callback
      this.options = options
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  
  // Mock matchMedia for responsive tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
  })
  
  console.log('✅ Global test setup complete')
}