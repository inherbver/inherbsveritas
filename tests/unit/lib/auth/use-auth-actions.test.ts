/**
 * Tests unitaires useAuthActions Hook
 * TDD Pattern : Red-Green-Refactor
 * Coverage target: >90%
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useAuthActions } from '@/lib/auth/hooks/use-auth-actions'
import { createClient } from '@/lib/supabase/client'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

describe('useAuthActions', () => {
  const mockPush = jest.fn()
  const mockSupabaseAuth = {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn()
  }
  const mockSupabaseClient = {
    auth: mockSupabaseAuth
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('Hook initialization', () => {
    it('should return all required auth actions and state', () => {
      const { result } = renderHook(() => useAuthActions())

      expect(result.current).toHaveProperty('signIn')
      expect(result.current).toHaveProperty('signUp')
      expect(result.current).toHaveProperty('signOut')
      expect(result.current).toHaveProperty('resetPassword')
      expect(result.current).toHaveProperty('loading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('clearError')

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(typeof result.current.clearError).toBe('function')
    })
  })

  describe('signIn', () => {
    it('should sign in successfully and redirect', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuthActions())

      let authResult: any
      await act(async () => {
        authResult = await result.current.signIn('test@example.com', 'password123')
      })

      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(authResult).toEqual({ success: true })
      expect(mockPush).toHaveBeenCalledWith('/profile')
    })

    it('should handle sign in error', async () => {
      const errorMessage = 'Invalid credentials'
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({ 
        error: { message: errorMessage } 
      })

      const { result } = renderHook(() => useAuthActions())

      let authResult: any
      await act(async () => {
        authResult = await result.current.signIn('test@example.com', 'wrongpassword')
      })

      expect(authResult).toEqual({ success: false, error: errorMessage })
      expect(result.current.error).toBe(errorMessage)
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should redirect to custom redirectTo path', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuthActions())

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123', '/shop')
      })

      expect(mockPush).toHaveBeenCalledWith('/shop')
    })

    it('should set loading state during sign in', async () => {
      mockSupabaseAuth.signInWithPassword.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )

      const { result } = renderHook(() => useAuthActions())

      act(() => {
        result.current.signIn('test@example.com', 'password123')
      })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('signUp', () => {
    it('should sign up successfully with immediate session', async () => {
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: { id: 'user-123' }, session: { access_token: 'token' } },
        error: null
      })

      const { result } = renderHook(() => useAuthActions())

      let authResult: any
      await act(async () => {
        authResult = await result.current.signUp('test@example.com', 'password123')
      })

      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(authResult).toEqual({ success: true })
      expect(mockPush).toHaveBeenCalledWith('/profile')
    })

    it('should handle sign up requiring email confirmation', async () => {
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: { id: 'user-123' }, session: null },
        error: null
      })

      const { result } = renderHook(() => useAuthActions())

      let authResult: any
      await act(async () => {
        authResult = await result.current.signUp('test@example.com', 'password123')
      })

      expect(authResult).toEqual({ 
        success: true, 
        error: 'Vérifiez votre email pour confirmer votre compte' 
      })
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should sign up with metadata', async () => {
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: { id: 'user-123' }, session: { access_token: 'token' } },
        error: null
      })

      const { result } = renderHook(() => useAuthActions())

      const metadata = { first_name: 'John', last_name: 'Doe' }

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', metadata)
      })

      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: { data: metadata }
      })
    })

    it('should handle sign up error', async () => {
      const errorMessage = 'Email already exists'
      mockSupabaseAuth.signUp.mockResolvedValue({ 
        data: null,
        error: { message: errorMessage } 
      })

      const { result } = renderHook(() => useAuthActions())

      let authResult: any
      await act(async () => {
        authResult = await result.current.signUp('test@example.com', 'password123')
      })

      expect(authResult).toEqual({ success: false, error: errorMessage })
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockSupabaseAuth.signOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuthActions())

      let authResult: any
      await act(async () => {
        authResult = await result.current.signOut()
      })

      expect(mockSupabaseAuth.signOut).toHaveBeenCalled()
      expect(authResult).toEqual({ success: true })
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should redirect to custom path after sign out', async () => {
      mockSupabaseAuth.signOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuthActions())

      await act(async () => {
        await result.current.signOut('/login')
      })

      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('should handle sign out error', async () => {
      const errorMessage = 'Sign out failed'
      mockSupabaseAuth.signOut.mockResolvedValue({ 
        error: { message: errorMessage } 
      })

      const { result } = renderHook(() => useAuthActions())

      let authResult: any
      await act(async () => {
        authResult = await result.current.signOut()
      })

      expect(authResult).toEqual({ success: false, error: errorMessage })
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({ error: null })

      // Mock window.location.origin
      delete (window as any).location
      ;(window as any).location = { origin: 'https://herbisveritas.fr' }

      const { result } = renderHook(() => useAuthActions())

      let authResult: any
      await act(async () => {
        authResult = await result.current.resetPassword('test@example.com')
      })

      expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({ 
          redirectTo: expect.stringContaining('/auth/reset-password') 
        })
      )
      expect(authResult).toEqual({ success: true })
    })

    it('should handle reset password error', async () => {
      const errorMessage = 'Email not found'
      mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({ 
        error: { message: errorMessage } 
      })

      const { result } = renderHook(() => useAuthActions())

      let authResult: any
      await act(async () => {
        authResult = await result.current.resetPassword('test@example.com')
      })

      expect(authResult).toEqual({ success: false, error: errorMessage })
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('clearError', () => {
    it('should clear error state', async () => {
      // Set an error first
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({ 
        error: { message: 'Test error' } 
      })

      const { result } = renderHook(() => useAuthActions())

      await act(async () => {
        await result.current.signIn('test@example.com', 'wrongpassword')
      })

      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabaseAuth.signInWithPassword.mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useAuthActions())

      let authResult: any
      await act(async () => {
        authResult = await result.current.signIn('test@example.com', 'password123')
      })

      expect(authResult).toEqual({ success: false, error: 'Network error' })
      expect(result.current.error).toBe('Network error')
      expect(result.current.loading).toBe(false)
    })

    it('should handle unknown errors', async () => {
      mockSupabaseAuth.signInWithPassword.mockRejectedValue('Unknown error')

      const { result } = renderHook(() => useAuthActions())

      let authResult: any
      await act(async () => {
        authResult = await result.current.signIn('test@example.com', 'password123')
      })

      expect(authResult).toEqual({ 
        success: false, 
        error: 'Erreur de connexion' 
      })
      expect(result.current.error).toBe('Erreur de connexion')
    })
  })
})