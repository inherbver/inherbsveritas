/**
 * Tests unitaires pour auth/actions
 * TDD pour les actions d'authentification principales
 */

import {
  loginUser,
  logoutUser,
  getCurrentUser,
  registerUser,
  type LoginCredentials,
  type RegisterCredentials,
  type LoginResult,
  type LogoutResult,
  type RegisterResult,
  type AuthUser
} from '@/lib/auth/actions'
import { AUTH_MESSAGES } from '@/lib/messages/auth-messages'

// Utilise les mocks centralisés

// Mock validateEmail
jest.mock('@/utils/validateEmail', () => ({
  validateEmail: jest.fn()
}))

describe('auth/actions', () => {
  let mockSupabase: any
  let mockValidateEmail: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Utilise factory centralisée
    mockSupabase = global.createMockSupabaseClient()
    const { createClient } = require('@/lib/supabase/client')
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    
    const { validateEmail } = require('@/utils/validateEmail')
    mockValidateEmail = validateEmail
  })

  describe('loginUser (TDD)', () => {
    it('should reject invalid email format', async () => {
      // Arrange
      mockValidateEmail.mockReturnValue(false)
      const credentials: LoginCredentials = {
        email: 'invalid-email',
        password: 'ValidPass123!'
      }

      // Act
      const result: LoginResult = await loginUser(credentials)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toEqual(AUTH_MESSAGES.validation.emailInvalid)
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled()
    })

    it('should reject password too short', async () => {
      // Arrange
      mockValidateEmail.mockReturnValue(true)
      const credentials: LoginCredentials = {
        email: 'test@herbisveritas.fr',
        password: '123' // Trop court
      }

      // Act
      const result: LoginResult = await loginUser(credentials)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message?.key).toBe('auth.validation.password_too_short')
      expect(result.message?.params).toEqual({ minLength: 8 })
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled()
    })

    it('should handle successful login with valid credentials', async () => {
      // Arrange
      mockValidateEmail.mockReturnValue(true)
      const mockUser = {
        id: 'user-123',
        email: 'test@herbisveritas.fr',
        app_metadata: { role: 'user' }
      }
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const credentials: LoginCredentials = {
        email: 'test@herbisveritas.fr',
        password: 'ValidPass123!'
      }

      // Act
      const result: LoginResult = await loginUser(credentials)

      // Assert
      expect(result.success).toBe(true)
      expect(result.user).toEqual({
        id: 'user-123',
        email: 'test@herbisveritas.fr',
        role: 'user'
      })
      expect(result.message).toEqual(AUTH_MESSAGES.login.success)
      expect(result.redirectTo).toBe('/profile')
    })

    it('should handle Supabase authentication error', async () => {
      // Arrange
      mockValidateEmail.mockReturnValue(true)
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' }
      })

      const credentials: LoginCredentials = {
        email: 'test@herbisveritas.fr',
        password: 'WrongPassword123!'
      }

      // Act
      const result: LoginResult = await loginUser(credentials)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toEqual(AUTH_MESSAGES.login.invalidCredentials)
      expect(result.user).toBeUndefined()
    })

    it('should handle network/exception errors', async () => {
      // Arrange
      mockValidateEmail.mockReturnValue(true)
      mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'))

      const credentials: LoginCredentials = {
        email: 'test@herbisveritas.fr',
        password: 'ValidPass123!'
      }

      // Act
      const result: LoginResult = await loginUser(credentials)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toEqual(AUTH_MESSAGES.login.networkError)
    })
  })

  describe('registerUser (TDD)', () => {
    it('should validate and normalize email', async () => {
      // Arrange
      mockValidateEmail.mockReturnValue(true)
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { 
          user: { id: 'user-123', email: 'test@herbisveritas.fr' },
          session: null
        },
        error: null
      })

      const credentials: RegisterCredentials = {
        email: '  Test@HerbisVeritas.Fr  ', // Espaces et casse mixte
        password: 'ValidPass123!',
        confirmPassword: 'ValidPass123!',
        acceptTerms: true
      }

      // Act
      const result: RegisterResult = await registerUser(credentials)

      // Assert
      expect(mockValidateEmail).toHaveBeenCalledWith('test@herbisveritas.fr')
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@herbisveritas.fr',
        password: 'ValidPass123!'
      })
      expect(result.success).toBe(true)
    })

    it('should reject password mismatch', async () => {
      // Arrange
      mockValidateEmail.mockReturnValue(true)
      const credentials: RegisterCredentials = {
        email: 'test@herbisveritas.fr',
        password: 'ValidPass123!',
        confirmPassword: 'DifferentPass123!',
        acceptTerms: true
      }

      // Act
      const result: RegisterResult = await registerUser(credentials)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toEqual(AUTH_MESSAGES.validation.passwordMismatch)
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('should reject if terms not accepted', async () => {
      // Arrange
      mockValidateEmail.mockReturnValue(true)
      const credentials: RegisterCredentials = {
        email: 'test@herbisveritas.fr',
        password: 'ValidPass123!',
        confirmPassword: 'ValidPass123!',
        acceptTerms: false
      }

      // Act
      const result: RegisterResult = await registerUser(credentials)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toEqual(AUTH_MESSAGES.validation.termsNotAccepted)
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('should handle successful registration requiring email confirmation', async () => {
      // Arrange
      mockValidateEmail.mockReturnValue(true)
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123', 
            email: 'test@herbisveritas.fr',
            email_confirmed_at: null 
          },
          session: null 
        },
        error: null
      })

      const credentials: RegisterCredentials = {
        email: 'test@herbisveritas.fr',
        password: 'ValidPass123!',
        confirmPassword: 'ValidPass123!',
        acceptTerms: true
      }

      // Act
      const result: RegisterResult = await registerUser(credentials)

      // Assert
      expect(result.success).toBe(true)
      expect(result.requiresConfirmation).toBe(true)
      expect(result.message).toEqual(AUTH_MESSAGES.register.emailVerificationRequired)
    })
  })

  describe('logoutUser (TDD)', () => {
    it('should handle successful logout', async () => {
      // Arrange
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      // Act
      const result: LogoutResult = await logoutUser()

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toEqual(AUTH_MESSAGES.logout.success)
      expect(result.redirectTo).toBe('/')
    })

    it('should handle logout error', async () => {
      // Arrange
      mockSupabase.auth.signOut.mockResolvedValue({ 
        error: { message: 'Logout failed' } 
      })

      // Act
      const result: LogoutResult = await logoutUser()

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toEqual(AUTH_MESSAGES.logout.error)
    })
  })

  describe('getCurrentUser (TDD)', () => {
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
      const result: AuthUser | null = await getCurrentUser()

      // Assert
      expect(result).toEqual({
        id: 'user-123',
        email: 'test@herbisveritas.fr',
        role: 'admin'
      })
    })

    it('should return null when not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      // Act
      const result: AuthUser | null = await getCurrentUser()

      // Assert
      expect(result).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Network error'))

      // Act
      const result: AuthUser | null = await getCurrentUser()

      // Assert
      expect(result).toBeNull()
    })
  })
})