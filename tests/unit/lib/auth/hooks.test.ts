/**
 * Tests unitaires pour auth/hooks
 * TDD pour les hooks d'authentification
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useAuth, useAuthUser, useRequireAuth } from '@/lib/auth/hooks'

// Utilise les mocks centralisés pour Supabase

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn()
  }))
}))

describe('auth/hooks (TDD)', () => {
  let mockSupabase: any
  let mockRouter: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Utilise factory centralisée
    mockSupabase = global.createMockSupabaseClient()
    const { createClient } = require('@/lib/supabase/client')
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    
    const { useRouter } = require('next/navigation')
    mockRouter = useRouter()
  })

  describe('useAuth', () => {
    it('should initialize with loading state', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockImplementation(() => new Promise(() => {})) // Pending promise

      // Act
      const { result } = renderHook(() => useAuth())

      // Assert
      expect(result.current.isLoading).toBe(true)
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should set user when authenticated', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@herbisveritas.fr',
        app_metadata: { role: 'user' }
      }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Act
      const { result } = renderHook(() => useAuth())

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.user).toEqual({
          id: 'user-123',
          email: 'test@herbisveritas.fr',
          role: 'user'
        })
        expect(result.current.isAuthenticated).toBe(true)
      })
    })

    it('should handle unauthenticated state', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      // Act
      const { result } = renderHook(() => useAuth())

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
      })
    })

    it('should handle authentication errors gracefully', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Network error'))

      // Act
      const { result } = renderHook(() => useAuth())

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
      })
    })

    it('should subscribe to auth state changes', () => {
      // Arrange
      const mockUnsubscribe = jest.fn()
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } }
      })
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      // Act
      const { unmount } = renderHook(() => useAuth())

      // Assert
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()

      // Cleanup
      unmount()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('useAuthUser', () => {
    it('should return user when authenticated', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@herbisveritas.fr',
        app_metadata: { role: 'admin' }
      }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Act
      const { result } = renderHook(() => useAuthUser())

      // Assert
      await waitFor(() => {
        expect(result.current).toEqual({
          id: 'user-123',
          email: 'test@herbisveritas.fr',
          role: 'admin'
        })
      })
    })

    it('should return null when not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      // Act
      const { result } = renderHook(() => useAuthUser())

      // Assert
      await waitFor(() => {
        expect(result.current).toBeNull()
      })
    })
  })

  describe('useRequireAuth', () => {
    it('should not redirect when user is authenticated', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@herbisveritas.fr',
        app_metadata: { role: 'user' }
      }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Act
      const { result } = renderHook(() => useRequireAuth())

      // Assert
      await waitFor(() => {
        expect(result.current).toEqual({
          id: 'user-123',
          email: 'test@herbisveritas.fr',
          role: 'user'
        })
      })
      expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    it('should redirect to login when not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { pathname: '/profile' },
        writable: true
      })

      // Act
      const { result } = renderHook(() => useRequireAuth())

      // Assert
      await waitFor(() => {
        expect(result.current).toBeNull()
        expect(mockRouter.replace).toHaveBeenCalledWith('/login?callbackUrl=/profile')
      })
    })

    it('should redirect to login with custom redirect URL', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      // Act
      const { result } = renderHook(() => useRequireAuth('/custom-redirect'))

      // Assert
      await waitFor(() => {
        expect(result.current).toBeNull()
        expect(mockRouter.replace).toHaveBeenCalledWith('/login?callbackUrl=/custom-redirect')
      })
    })

    it('should handle role-based access control', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'user@herbisveritas.fr',
        app_metadata: { role: 'user' }
      }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Act
      const { result } = renderHook(() => useRequireAuth(undefined, ['admin', 'dev']))

      // Assert
      await waitFor(() => {
        expect(result.current).toBeNull()
        expect(mockRouter.replace).toHaveBeenCalledWith('/unauthorized')
      })
    })

    it('should allow access for authorized roles', async () => {
      // Arrange
      const mockUser = {
        id: 'admin-123',
        email: 'admin@herbisveritas.fr',
        app_metadata: { role: 'admin' }
      }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Act
      const { result } = renderHook(() => useRequireAuth(undefined, ['admin', 'dev']))

      // Assert
      await waitFor(() => {
        expect(result.current).toEqual({
          id: 'admin-123',
          email: 'admin@herbisveritas.fr',
          role: 'admin'
        })
      })
      expect(mockRouter.replace).not.toHaveBeenCalled()
    })
  })
})