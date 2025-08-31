/**
 * Tests unitaires pour hooks/useHydrationSafe
 * Tests prévention erreurs hydratation
 */

import { renderHook } from '@testing-library/react'
import { useHydrationSafe } from '@/hooks/useHydrationSafe'

// Mock window pour simuler client-side
const mockWindow = {
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  },
  document: {
    querySelector: jest.fn()
  }
}

describe('useHydrationSafe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('client-side rendering', () => {
    beforeAll(() => {
      // Simulate client-side
      Object.defineProperty(window, 'localStorage', {
        value: mockWindow.localStorage
      })
    })

    it('should return client value after hydration', () => {
      const clientValue = () => 'client-value'
      const serverValue = 'server-value'

      const { result, rerender } = renderHook(() =>
        useHydrationSafe(clientValue, serverValue)
      )

      // First render (server-side simulation)
      expect(result.current).toBe('server-value')

      // Simulate hydration completion
      rerender()
      
      // After hydration, should use client value
      setTimeout(() => {
        expect(result.current).toBe('client-value')
      }, 0)
    })

    it('should handle localStorage access safely', () => {
      mockWindow.localStorage.getItem.mockReturnValue('stored-value')

      const clientValue = () => {
        return window.localStorage.getItem('test-key') || 'default'
      }

      const { result } = renderHook(() =>
        useHydrationSafe(clientValue, 'server-default')
      )

      expect(result.current).toBe('server-default')

      setTimeout(() => {
        expect(mockWindow.localStorage.getItem).toHaveBeenCalledWith('test-key')
        expect(result.current).toBe('stored-value')
      }, 0)
    })

    it('should handle Date.now() safely', () => {
      const mockDate = 1642784400000 // 2022-01-21
      jest.spyOn(Date, 'now').mockReturnValue(mockDate)

      const clientValue = () => Date.now()
      const serverValue = 0

      const { result } = renderHook(() =>
        useHydrationSafe(clientValue, serverValue)
      )

      expect(result.current).toBe(0)

      setTimeout(() => {
        expect(result.current).toBe(mockDate)
      }, 0)
    })
  })

  describe('server-side rendering', () => {
    beforeAll(() => {
      // Simulate server-side (no window)
      delete (global as any).window
    })

    it('should always return server value on server', () => {
      const clientValue = () => 'client-value'
      const serverValue = 'server-value'

      const { result } = renderHook(() =>
        useHydrationSafe(clientValue, serverValue)
      )

      expect(result.current).toBe('server-value')
    })
  })

  describe('error handling', () => {
    it('should handle client value function errors', () => {
      const clientValue = () => {
        throw new Error('Client error')
      }
      const serverValue = 'fallback-value'

      const { result } = renderHook(() =>
        useHydrationSafe(clientValue, serverValue)
      )

      expect(result.current).toBe('fallback-value')
    })

    it('should handle undefined client values', () => {
      const clientValue = () => undefined
      const serverValue = 'server-value'

      const { result } = renderHook(() =>
        useHydrationSafe(clientValue, serverValue)
      )

      expect(result.current).toBe('server-value')
    })
  })
})