/**
 * Tests unitaires useAuthState Hook
 * TDD Pattern : Red-Green-Refactor
 * Coverage target: >90%
 */

import { renderHook, act } from '@testing-library/react'
import { useAuthState } from '@/lib/auth/hooks/use-auth-state'
import { createClient } from '@/lib/supabase/client'

// Utilise les mocks centralisés - pas de mock local nécessaire

describe('useAuthState', () => {
  let mockSupabaseClient: any

  beforeEach(() => {
    jest.clearAllMocks()
    // Utilise la factory centralisée avec overrides spécifiques
    mockSupabaseClient = global.createMockSupabaseClient()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('Hook initialization', () => {
    it('should return initial auth state', () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      })
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      })

      const { result } = renderHook(() => useAuthState())

      expect(result.current).toEqual({
        user: null,
        loading: true,
        isAuthenticated: false,
        userRole: 'user',
        hasAccess: expect.any(Function)
      })
    })

    it('should initialize auth listener on mount', () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      })
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      })

      renderHook(() => useAuthState())

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled()
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled()
    })
  })

  describe('Authentication state', () => {
    it('should handle authenticated user with admin role', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'admin@herbisveritas.fr',
        user_metadata: { role: 'admin' }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => callback('SIGNED_IN', { user: mockUser }), 0)
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const { result } = renderHook(() => useAuthState())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.userRole).toBe('admin')
      expect(result.current.loading).toBe(false)
    })

    it('should handle authenticated user with dev role', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'dev@herbisveritas.fr',
        user_metadata: { role: 'dev' }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => callback('SIGNED_IN', { user: mockUser }), 0)
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const { result } = renderHook(() => useAuthState())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      expect(result.current.userRole).toBe('dev')
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle unauthenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      })
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => callback('SIGNED_OUT', { user: null }), 0)
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const { result } = renderHook(() => useAuthState())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.userRole).toBe('user')
      expect(result.current.loading).toBe(false)
    })

    it('should default to user role when no role specified', async () => {
      const mockUser = {
        id: 'user-789',
        email: 'user@herbisveritas.fr',
        user_metadata: {}
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => callback('SIGNED_IN', { user: mockUser }), 0)
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const { result } = renderHook(() => useAuthState())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      expect(result.current.userRole).toBe('user')
    })
  })

  describe('hasAccess function', () => {
    it('should grant access for matching role', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'admin@herbisveritas.fr',
        user_metadata: { role: 'admin' }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => callback('SIGNED_IN', { user: mockUser }), 0)
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const { result } = renderHook(() => useAuthState())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      expect(result.current.hasAccess('admin')).toBe(true)
      expect(result.current.hasAccess('user')).toBe(true) // admin can access user features
    })

    it('should deny access for higher role requirement', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@herbisveritas.fr',
        user_metadata: { role: 'user' }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => callback('SIGNED_IN', { user: mockUser }), 0)
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const { result } = renderHook(() => useAuthState())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      expect(result.current.hasAccess('admin')).toBe(false)
      expect(result.current.hasAccess('user')).toBe(true)
    })

    it('should handle dev role permissions', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'dev@herbisveritas.fr',
        user_metadata: { role: 'dev' }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => callback('SIGNED_IN', { user: mockUser }), 0)
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const { result } = renderHook(() => useAuthState())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      expect(result.current.hasAccess('dev')).toBe(true)
      expect(result.current.hasAccess('admin')).toBe(true) // dev can access admin features
      expect(result.current.hasAccess('user')).toBe(true) // dev can access user features
    })
  })

  describe('Auth state changes', () => {
    it('should handle sign in event', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@herbisveritas.fr',
        user_metadata: { role: 'user' }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      })

      let authCallback: any
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const { result } = renderHook(() => useAuthState())

      expect(result.current.isAuthenticated).toBe(false)

      await act(async () => {
        authCallback('SIGNED_IN', { user: mockUser })
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.userRole).toBe('user')
    })

    it('should handle sign out event', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@herbisveritas.fr',
        user_metadata: { role: 'user' }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })

      let authCallback: any
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback
        // Initial sign in
        setTimeout(() => callback('SIGNED_IN', { user: mockUser }), 0)
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const { result } = renderHook(() => useAuthState())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      expect(result.current.isAuthenticated).toBe(true)

      await act(async () => {
        authCallback('SIGNED_OUT', { user: null })
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.userRole).toBe('user')
    })
  })

  describe('Cleanup', () => {
    it('should unsubscribe on unmount', () => {
      const mockUnsubscribe = jest.fn()
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      })
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } }
      })

      const { unmount } = renderHook(() => useAuthState())

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('Error handling', () => {
    it('should handle getUser error gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: { message: 'Failed to get user' } 
      })
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      })

      const { result } = renderHook(() => useAuthState())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.loading).toBe(false)
    })
  })
})