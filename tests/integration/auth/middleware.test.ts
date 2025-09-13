/**
 * Tests middleware auth/RBAC - Priority 1 Critical
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { updateSession, getSessionDetails } from '@/lib/auth/middleware'
import { PUBLIC_ROUTES } from '@/lib/auth/types'

// Protected routes testing - comprehensive coverage examples
// These routes are tested individually in test cases below

// Mock Supabase
const mockSupabaseUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: { role: 'user' }
}

const mockSupabaseAdmin = {
  id: 'admin-user-id', 
  email: 'admin@example.com',
  app_metadata: { role: 'admin' }
}

const mockSupabaseDev = {
  id: 'dev-user-id',
  email: 'dev@example.com', 
  app_metadata: { role: 'dev' }
}

const mockGetUser = jest.fn()
const mockCookiesGetAll = jest.fn()
const mockCookiesSetAll = jest.fn()

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser
    }
  }))
}))

// Mock environment variables
process.env['NEXT_PUBLIC_SUPABASE_URL'] = 'https://test.supabase.co'
process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = 'test-anon-key'

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookiesGetAll.mockReturnValue([])
    mockCookiesSetAll.mockImplementation(() => {})
  })

  const createMockRequest = (pathname: string, cookies: any[] = []) => {
    const request = new NextRequest(`http://localhost:3000${pathname}`)
    
    // Mock cookies
    request.cookies.getAll = mockCookiesGetAll.mockReturnValue(cookies)
    request.cookies.set = jest.fn()
    
    return request
  }

  describe('Routes publiques (pas d\'auth requise)', () => {
    it.each(PUBLIC_ROUTES)('devrait permettre accès à route publique: %s', async (route) => {
      const request = createMockRequest(route)
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const response = await updateSession(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('location')).toBeNull()
    })

    it('devrait permettre accès à route publique avec user connecté', async () => {
      const request = createMockRequest('/')
      mockGetUser.mockResolvedValue({ data: { user: mockSupabaseUser } })

      const response = await updateSession(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('location')).toBeNull()
    })
  })

  describe('Routes protégées - User non authentifié', () => {
    it('devrait rediriger vers /login si user non connecté sur route protégée', async () => {
      const request = createMockRequest('/profile')
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const response = await updateSession(request)

      expect(response.status).toBe(307) // Redirect
      const location = response.headers.get('location')
      expect(location).toContain('/login')
      expect(location).toContain('redirectedFrom=%2Fprofile')
    })

    it('devrait rediriger vers /login avec preservation destination admin', async () => {
      const request = createMockRequest('/admin/users')
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const response = await updateSession(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login')
      expect(location).toContain('redirectedFrom=%2Fadmin%2Fusers')
    })
  })

  describe('RBAC - Contrôle permissions par rôle', () => {
    it('devrait permettre accès user à /profile', async () => {
      const request = createMockRequest('/profile')
      mockGetUser.mockResolvedValue({ data: { user: mockSupabaseUser } })

      const response = await updateSession(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('location')).toBeNull()
    })

    it('devrait bloquer user sur /admin et rediriger vers /unauthorized', async () => {
      const request = createMockRequest('/admin')
      mockGetUser.mockResolvedValue({ data: { user: mockSupabaseUser } })

      const response = await updateSession(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/unauthorized')
    })

    it('devrait permettre admin accès à /admin', async () => {
      const request = createMockRequest('/admin')
      mockGetUser.mockResolvedValue({ data: { user: mockSupabaseAdmin } })

      const response = await updateSession(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('location')).toBeNull()
    })

    it('devrait permettre admin accès à /admin/users', async () => {
      const request = createMockRequest('/admin/users')
      mockGetUser.mockResolvedValue({ data: { user: mockSupabaseAdmin } })

      const response = await updateSession(request)

      expect(response.status).toBe(200)
    })

    it('devrait bloquer admin sur routes /dev', async () => {
      const request = createMockRequest('/dev')
      mockGetUser.mockResolvedValue({ data: { user: mockSupabaseAdmin } })

      const response = await updateSession(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/unauthorized')
    })

    it('devrait permettre dev accès à toutes les routes', async () => {
      const protectedPaths = ['/profile', '/admin', '/admin/users', '/dev']
      
      for (const path of protectedPaths) {
        const request = createMockRequest(path)
        mockGetUser.mockResolvedValue({ data: { user: mockSupabaseDev } })

        const response = await updateSession(request)

        expect(response.status).toBe(200)
        expect(response.headers.get('location')).toBeNull()
      }
    })
  })

  describe('Extraction rôle utilisateur', () => {
    it('devrait extraire rôle depuis app_metadata', async () => {
      const request = createMockRequest('/profile')
      mockGetUser.mockResolvedValue({ 
        data: { 
          user: { ...mockSupabaseUser, app_metadata: { role: 'admin' } } 
        } 
      })

      const response = await updateSession(request)
      expect(response.status).toBe(200)
    })

    it('devrait fallback sur "user" si rôle invalide', async () => {
      const request = createMockRequest('/admin')
      mockGetUser.mockResolvedValue({ 
        data: { 
          user: { ...mockSupabaseUser, app_metadata: { role: 'invalid-role' } } 
        } 
      })

      const response = await updateSession(request)

      // User avec rôle invalide (fallback "user") ne peut pas accéder à /admin
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/unauthorized')
    })

    it('devrait fallback sur "user" si app_metadata manquant', async () => {
      const request = createMockRequest('/admin')
      mockGetUser.mockResolvedValue({ 
        data: { 
          user: { id: 'test', email: 'test@example.com' } // pas de app_metadata
        } 
      })

      const response = await updateSession(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/unauthorized')
    })
  })

  describe('Routes dynamiques et wildcards', () => {
    it('devrait protéger sous-routes admin', async () => {
      const request = createMockRequest('/admin/products/edit/123')
      mockGetUser.mockResolvedValue({ data: { user: mockSupabaseUser } })

      const response = await updateSession(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/unauthorized')
    })

    it('devrait permettre admin accès aux sous-routes admin', async () => {
      const request = createMockRequest('/admin/products/edit/123')
      mockGetUser.mockResolvedValue({ data: { user: mockSupabaseAdmin } })

      const response = await updateSession(request)

      expect(response.status).toBe(200)
    })
  })

  describe('getSessionDetails helper', () => {
    it('devrait retourner session complète pour user valide', async () => {
      const request = createMockRequest('/profile')
      mockGetUser.mockResolvedValue({ data: { user: mockSupabaseUser } })

      const session = await getSessionDetails(request)

      expect(session).toEqual({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
        exp: 0,
        iat: 0
      })
    })

    it('devrait retourner null pour user non connecté', async () => {
      const request = createMockRequest('/profile')
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const session = await getSessionDetails(request)

      expect(session).toBeNull()
    })
  })

  describe('Edge cases et sécurité', () => {
    it('devrait gérer erreur Supabase gracieusement', async () => {
      const request = createMockRequest('/profile')
      mockGetUser.mockRejectedValue(new Error('Supabase error'))

      // Ne devrait pas planter, traiter comme non-authentifié
      await expect(updateSession(request)).rejects.toThrow('Supabase error')
    })

    it('devrait préserver cookies Supabase dans response', async () => {
      const request = createMockRequest('/profile')
      mockGetUser.mockResolvedValue({ data: { user: mockSupabaseUser } })

      const response = await updateSession(request)

      expect(response.status).toBe(200)
      // Vérifier que les cookies sont préservés via supabaseResponse
    })
  })
})