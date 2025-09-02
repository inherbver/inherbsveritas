/**
 * Tests TDD pour le service d'authentification HerbisVeritas
 * Red → Green → Refactor selon CLAUDE.md
 */

import { authService } from '@/lib/auth/auth-service'
import type { User } from '@supabase/supabase-js'

// Mock données de test déterministes (selon CLAUDE.md)
const mockUser: User = {
  id: 'user-123',
  email: 'test@herbisveritas.fr',
  user_metadata: { role: 'user' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-01T10:00:00Z'
}

const mockAdmin: User = {
  id: 'admin-456', 
  email: 'admin@herbisveritas.fr',
  user_metadata: { role: 'admin' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-01T10:00:00Z'
}

const mockDev: User = {
  id: 'dev-789',
  email: 'dev@herbisveritas.fr', 
  user_metadata: { role: 'dev' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-01T10:00:00Z'
}

describe('AuthService - TDD Red Phase', () => {
  let mockSupabase: ReturnType<typeof global.createMockSupabaseClient>

  beforeEach(() => {
    mockSupabase = global.createMockSupabaseClient()
    jest.clearAllMocks()
  })

  describe('🔴 Authentication Flows (Tests écrivits AVANT implémentation)', () => {
    describe('signIn', () => {
      it('devrait authentifier un utilisateur avec email/password valides', async () => {
        // ARRANGE - TDD Pattern
        const credentials = {
          email: 'test@herbisveritas.fr',
          password: 'Password123!'
        }
        
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockUser, session: { access_token: 'token-123' } },
          error: null
        })

        // ACT - Appel qui va échouer (Red phase TDD)
        const result = await authService.signIn(credentials)

        // ASSERT - Contrat observable attendu
        expect(result.success).toBe(true)
        expect(result.user).toEqual(mockUser)
        expect(result.error).toBeNull()
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: credentials.email,
          password: credentials.password
        })
      })

      it('devrait retourner erreur avec credentials invalides', async () => {
        // ARRANGE
        const invalidCredentials = {
          email: 'wrong@email.com',
          password: 'wrongpass'
        }

        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials' }
        })

        // ACT 
        const result = await authService.signIn(invalidCredentials)

        // ASSERT - Comportement erreur attendu
        expect(result.success).toBe(false)
        expect(result.user).toBeNull()
        expect(result.error).toBe('Invalid login credentials')
      })

      it('devrait valider le format email avant appel Supabase', async () => {
        // ARRANGE
        const invalidEmail = {
          email: 'not-an-email',
          password: 'Password123!'
        }

        // ACT
        const result = await authService.signIn(invalidEmail)

        // ASSERT - Validation côté client
        expect(result.success).toBe(false)
        expect(result.error).toContain('email')
        expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled()
      })
    })

    describe('signUp', () => {
      it('devrait créer un utilisateur avec données valides', async () => {
        // ARRANGE
        const userData = {
          email: 'newuser@herbisveritas.fr',
          password: 'Password123!',
          firstName: 'Jean',
          lastName: 'Dupont'
        }

        mockSupabase.auth.signUp.mockResolvedValue({
          data: { 
            user: { ...mockUser, email: userData.email },
            session: null // Confirmation email required
          },
          error: null
        })

        // ACT
        const result = await authService.signUp(userData)

        // ASSERT
        expect(result.success).toBe(true)
        expect(result.user?.email).toBe(userData.email)
        expect(result.requiresConfirmation).toBe(true)
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              first_name: userData.firstName,
              last_name: userData.lastName,
              role: 'user' // Rôle par défaut
            }
          }
        })
      })

      it('devrait rejeter passwords faibles', async () => {
        // ARRANGE
        const weakPasswordData = {
          email: 'test@herbisveritas.fr',
          password: '123', // Trop faible
          firstName: 'Jean',
          lastName: 'Dupont'
        }

        // ACT
        const result = await authService.signUp(weakPasswordData)

        // ASSERT - Validation password côté client
        expect(result.success).toBe(false)
        expect(result.error).toContain('password')
        expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
      })
    })

    describe('signOut', () => {
      it('devrait déconnecter utilisateur et nettoyer session', async () => {
        // ARRANGE
        mockSupabase.auth.signOut.mockResolvedValue({ error: null })

        // ACT
        const result = await authService.signOut()

        // ASSERT
        expect(result.success).toBe(true)
        expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      })

      it('devrait gérer les erreurs de déconnexion', async () => {
        // ARRANGE
        mockSupabase.auth.signOut.mockResolvedValue({ 
          error: { message: 'Network error' }
        })

        // ACT
        const result = await authService.signOut()

        // ASSERT
        expect(result.success).toBe(false)
        expect(result.error).toBe('Network error')
      })
    })
  })

  describe('🔴 Roles & Permissions (Tests écrits AVANT middleware)', () => {
    describe('getUserRole', () => {
      it('devrait retourner role "user" par défaut', async () => {
        // ACT
        const role = await authService.getUserRole(mockUser)

        // ASSERT
        expect(role).toBe('user')
      })

      it('devrait retourner role "admin" pour admin', async () => {
        // ACT  
        const role = await authService.getUserRole(mockAdmin)

        // ASSERT
        expect(role).toBe('admin')
      })

      it('devrait retourner role "dev" pour développeur', async () => {
        // ACT
        const role = await authService.getUserRole(mockDev)

        // ASSERT
        expect(role).toBe('dev')
      })
    })

    describe('hasPermission', () => {
      it('devrait autoriser user à voir produits publics', async () => {
        // ACT
        const canView = await authService.hasPermission(mockUser, 'view:products')

        // ASSERT
        expect(canView).toBe(true)
      })

      it('devrait interdire user à modifier produits', async () => {
        // ACT
        const canEdit = await authService.hasPermission(mockUser, 'edit:products')

        // ASSERT
        expect(canEdit).toBe(false)
      })

      it('devrait autoriser admin à tout modifier', async () => {
        // ACT
        const canEditProducts = await authService.hasPermission(mockAdmin, 'edit:products')
        const canEditUsers = await authService.hasPermission(mockAdmin, 'edit:users')

        // ASSERT
        expect(canEditProducts).toBe(true)
        expect(canEditUsers).toBe(true)
      })

      it('devrait autoriser dev à accéder debug tools', async () => {
        // ACT
        const canDebug = await authService.hasPermission(mockDev, 'debug:system')

        // ASSERT
        expect(canDebug).toBe(true)
      })

      it('devrait interdire accès debug aux non-dev', async () => {
        // ACT
        const userCanDebug = await authService.hasPermission(mockUser, 'debug:system')
        const adminCanDebug = await authService.hasPermission(mockAdmin, 'debug:system')

        // ASSERT
        expect(userCanDebug).toBe(false)
        expect(adminCanDebug).toBe(false)
      })
    })

    describe('requireRole', () => {
      it('devrait valider accès pour rôle requis', async () => {
        // ACT & ASSERT - Ne doit pas throw
        await expect(authService.requireRole(mockAdmin, 'admin')).resolves.not.toThrow()
      })

      it('devrait rejeter accès pour rôle insuffisant', async () => {
        // ACT & ASSERT - Doit throw
        await expect(authService.requireRole(mockUser, 'admin'))
          .rejects.toThrow('Access denied: admin role required')
      })
    })
  })

  describe('🔴 Session Management (Tests écrits AVANT gestion session)', () => {
    describe('getCurrentUser', () => {
      it('devrait retourner utilisateur connecté', async () => {
        // ARRANGE
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null
        })

        // ACT
        const user = await authService.getCurrentUser()

        // ASSERT
        expect(user).toEqual(mockUser)
      })

      it('devrait retourner null si pas connecté', async () => {
        // ARRANGE
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null
        })

        // ACT
        const user = await authService.getCurrentUser()

        // ASSERT
        expect(user).toBeNull()
      })
    })

    describe('isAuthenticated', () => {
      it('devrait retourner true si utilisateur connecté', async () => {
        // ARRANGE
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: { access_token: 'token-123' } },
          error: null
        })

        // ACT
        const isAuth = await authService.isAuthenticated()

        // ASSERT
        expect(isAuth).toBe(true)
      })

      it('devrait retourner false si pas de session', async () => {
        // ARRANGE
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null
        })

        // ACT
        const isAuth = await authService.isAuthenticated()

        // ASSERT
        expect(isAuth).toBe(false)
      })
    })
  })
})

describe('AuthService - Validation Inputs (Tests Edge Cases)', () => {
  describe('Input Sanitization', () => {
    it('devrait nettoyer email input (trim, lowercase)', async () => {
      // ARRANGE
      const messyCredentials = {
        email: '  Test@HerbisVeritas.FR  ',
        password: 'Password123!'
      }

      // ACT - Le service doit nettoyer l'input
      await authService.signIn(messyCredentials)

      // ASSERT - Email doit être nettoyé avant Supabase
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@herbisveritas.fr',
        password: 'Password123!'
      })
    })
  })

  describe('Rate Limiting', () => {
    it('devrait implémenter rate limiting sur tentatives login', async () => {
      // ARRANGE - Simuler multiples tentatives
      const credentials = { email: 'test@herbisveritas.fr', password: 'wrong' }

      // ACT - 5 tentatives rapides 
      for (let i = 0; i < 5; i++) {
        await authService.signIn(credentials)
      }
      
      const sixthAttempt = await authService.signIn(credentials)

      // ASSERT - 6ème tentative doit être rate limited
      expect(sixthAttempt.success).toBe(false)
      expect(sixthAttempt.error).toContain('rate limit')
    })
  })
})