/**
 * Custom Playwright matchers pour HerbisVeritas V2
 * Extension des capacités d'assertion Playwright selon patterns TDD
 */

import type { Locator } from '@playwright/test'
import { expect } from '@playwright/test'

interface CustomMatchers {
  toHaveCountGreaterThan(count: number): Promise<void>
  toHaveCountLessThan(count: number): Promise<void>
  toHaveCountBetween(min: number, max: number): Promise<void>
}

declare global {
  namespace PlaywrightTest {
    interface Matchers<R = Locator> extends CustomMatchers {}
  }
}

expect.extend({
  async toHaveCountGreaterThan(locator: Locator, count: number) {
    const actualCount = await locator.count()
    const pass = actualCount > count
    
    return {
      message: () => 
        pass 
          ? `Expected count ${actualCount} not to be greater than ${count}`
          : `Expected count ${actualCount} to be greater than ${count}`,
      pass
    }
  },
  
  async toHaveCountLessThan(locator: Locator, count: number) {
    const actualCount = await locator.count()
    const pass = actualCount < count
    
    return {
      message: () =>
        pass
          ? `Expected count ${actualCount} not to be less than ${count}`
          : `Expected count ${actualCount} to be less than ${count}`,
      pass
    }
  },
  
  async toHaveCountBetween(locator: Locator, min: number, max: number) {
    const actualCount = await locator.count()
    const pass = actualCount >= min && actualCount <= max
    
    return {
      message: () =>
        pass
          ? `Expected count ${actualCount} not to be between ${min} and ${max}`
          : `Expected count ${actualCount} to be between ${min} and ${max}`,
      pass
    }
  }
})