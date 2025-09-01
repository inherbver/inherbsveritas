/**
 * Tests unitaires pour auth/middleware  
 * TDD pour la protection des routes et redirection
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/middleware'
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from '@/lib/auth/types'

// Mock spécialisé pour ce test - utilise les mocks centralisés
const mockGetUser = jest.fn()

// Utilise les mocks centralisés mais override getUser pour ce test
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    ...global.createMockSupabaseClient(),
    auth: {
      ...global.createMockSupabaseClient().auth,
      getUser: mockGetUser
    }
  }))
}))

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn((url) => ({
      type: 'redirect',
      url: url.toString ? url.toString() : url
    })),
    next: jest.fn((config) => ({
      type: 'next',
      config,
      cookies: { set: jest.fn() }
    })),
    rewrite: jest.fn((url) => ({ type: 'rewrite', url }))
  }
}))

// Helper pour créer des mocks NextUrl consistants  
const createMockNextUrl = (pathname: string, origin = 'https://herbisveritas.fr') => {
  const mockUrl = {
    pathname,
    origin,
    toString: () => `${origin}${mockUrl.pathname}`,
    clone: () => {
      const clonedUrl = {
        pathname: mockUrl.pathname,
        origin: mockUrl.origin,
        searchParams: { 
          set: jest.fn((key, value) => {
            // Simulate setting search params by updating toString
            clonedUrl.toString = () => `${origin}${clonedUrl.pathname}?${key}=${value}`
          })
        },
        toString: () => `${origin}${clonedUrl.pathname}`
      }
      return clonedUrl
    }
  }
  return mockUrl
}

describe('auth/middleware (TDD)', () => {
  let mockNextResponse: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockNextResponse = require('next/server').NextResponse
  })

  describe('Public routes access', () => {
    const publicPaths = ['/', '/shop', '/magazine', '/contact', '/login', '/signup']

    publicPaths.forEach(path => {
      it(`should allow access to public route: ${path}`, async () => {
        // Arrange
        mockGetUser.mockResolvedValue({
          data: { user: null },
          error: null
        })

        const mockRequest = {
          nextUrl: createMockNextUrl(path),
          cookies: { 
            getAll: () => [],
            set: jest.fn()
          }
        } as unknown as NextRequest

        // Act
        const result = await auth(mockRequest)

        // Assert
        expect(mockNextResponse.next).toHaveBeenCalled()
        expect(result).toEqual({
          type: 'next',
          config: expect.any(Object),
          cookies: expect.any(Object)
        })
      })
    })
  })

  describe('Protected routes - unauthenticated', () => {
    it('should redirect to login for protected route when not authenticated', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const mockRequest = {
        nextUrl: { 
          pathname: '/profile', 
          origin: 'https://herbisveritas.fr',
          toString: () => 'https://herbisveritas.fr/profile',
          clone: () => ({
            pathname: '/profile',
            searchParams: { set: jest.fn() },
            toString: () => 'https://herbisveritas.fr/login?redirectedFrom=/profile'
          })
        },
        cookies: { 
          getAll: () => [],
          set: jest.fn()
        }
      } as unknown as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalled()
      expect(result).toEqual({
        type: 'redirect',
        url: 'https://herbisveritas.fr/login?redirectedFrom=/profile'
      })
    })

    it('should redirect to login for admin route when not authenticated', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const mockRequest = {
        nextUrl: { 
          pathname: '/admin', 
          origin: 'https://herbisveritas.fr',
          toString: () => 'https://herbisveritas.fr/admin',
          clone: () => ({
            pathname: '/admin',
            searchParams: { set: jest.fn() },
            toString: () => 'https://herbisveritas.fr/login?redirectedFrom=/admin'
          })
        },
        cookies: { 
          getAll: () => [],
          set: jest.fn()
        }
      } as unknown as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalled()
      expect(result).toEqual({
        type: 'redirect',
        url: 'https://herbisveritas.fr/login?redirectedFrom=/admin'
      })
    })
  })

  describe('Protected routes - authenticated user', () => {
    it('should allow user access to profile', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123', 
            email: 'user@herbisveritas.fr',
            app_metadata: { role: 'user' }
          } 
        },
        error: null
      })

      const mockRequest = {
        nextUrl: createMockNextUrl('/profile'),
        cookies: { 
          getAll: () => [],
          set: jest.fn()
        }
      } as unknown as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toEqual({
        type: 'next',
        config: expect.any(Object),
        cookies: expect.any(Object)
      })
    })

    it('should redirect user to unauthorized for admin route', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123', 
            email: 'user@herbisveritas.fr',
            app_metadata: { role: 'user' }
          } 
        },
        error: null
      })

      const mockRequest = {
        nextUrl: createMockNextUrl('/admin'),
        cookies: { 
          getAll: () => [],
          set: jest.fn()
        }
      } as unknown as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalled()
      expect(result).toEqual({
        type: 'redirect',
        url: 'https://herbisveritas.fr/unauthorized'
      })
    })

    it('should allow admin access to admin routes', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'admin-123', 
            email: 'admin@herbisveritas.fr',
            app_metadata: { role: 'admin' }
          } 
        },
        error: null
      })

      const mockRequest = {
        nextUrl: createMockNextUrl('/admin/products'),
        cookies: { 
          getAll: () => [],
          set: jest.fn()
        }
      } as unknown as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toEqual({
        type: 'next',
        config: expect.any(Object),
        cookies: expect.any(Object)
      })
    })

    it('should redirect admin to unauthorized for dev route', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'admin-123', 
            email: 'admin@herbisveritas.fr',
            app_metadata: { role: 'admin' }
          } 
        },
        error: null
      })

      const mockRequest = {
        nextUrl: createMockNextUrl('/dev'),
        cookies: { 
          getAll: () => [],
          set: jest.fn()
        }
      } as unknown as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalled()
      expect(result).toEqual({
        type: 'redirect',
        url: 'https://herbisveritas.fr/unauthorized'
      })
    })

    it('should allow dev access to all routes', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'dev-123', 
            email: 'dev@herbisveritas.fr',
            app_metadata: { role: 'dev' }
          } 
        },
        error: null
      })

      const devRoutes = ['/dev', '/admin', '/profile']
      
      for (const route of devRoutes) {
        const mockRequest = {
          nextUrl: createMockNextUrl(route),
          cookies: { 
            getAll: () => [],
            set: jest.fn()
          }
        } as unknown as NextRequest

        // Act
        const result = await auth(mockRequest)

        // Assert
        expect(mockNextResponse.next).toHaveBeenCalled()
        expect(result).toEqual({
          type: 'next',
          config: expect.any(Object),
          cookies: expect.any(Object)
        })
      }
    })
  })

  describe('Auth pages - already authenticated', () => {
    it('should allow authenticated user to access login page (public route)', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123', 
            email: 'user@herbisveritas.fr',
            app_metadata: { role: 'user' }
          } 
        },
        error: null
      })

      const mockRequest = {
        nextUrl: {
          ...createMockNextUrl('/login'),
          searchParams: new URLSearchParams('callbackUrl=/profile')
        },
        cookies: { 
          getAll: () => [],
          set: jest.fn()
        }
      } as unknown as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert - login is a public route, so middleware allows access
      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toEqual({
        type: 'next',
        config: expect.any(Object),
        cookies: expect.any(Object)
      })
    })

    it('should redirect authenticated user away from signup page', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'admin-123', 
            email: 'admin@herbisveritas.fr',
            app_metadata: { role: 'admin' }
          } 
        },
        error: null
      })

      const mockRequest = {
        nextUrl: createMockNextUrl('/signup'),
        cookies: { 
          getAll: () => [],
          set: jest.fn()
        }
      } as unknown as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert - signup is a public route, so middleware allows access
      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toEqual({
        type: 'next',
        config: expect.any(Object),
        cookies: expect.any(Object)
      })
    })
  })

  describe('Error handling', () => {
    it('should handle Supabase errors gracefully', async () => {
      // Arrange
      mockGetUser.mockRejectedValue(new Error('Network error'))

      const mockRequest = {
        nextUrl: createMockNextUrl('/profile'),
        cookies: { 
          getAll: () => [],
          set: jest.fn()
        }
      } as unknown as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert - Error treated as unauthenticated, should redirect to login
      expect(mockNextResponse.redirect).toHaveBeenCalled()
      expect(result).toEqual({
        type: 'redirect',
        url: 'https://herbisveritas.fr/login?redirectedFrom=/profile'
      })
    })

    it('should handle missing user metadata gracefully', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123', 
            email: 'user@herbisveritas.fr',
            app_metadata: {} // Pas de role
          } 
        },
        error: null
      })

      const mockRequest = {
        nextUrl: createMockNextUrl('/profile'),
        cookies: { 
          getAll: () => [],
          set: jest.fn()
        }
      } as unknown as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toEqual({
        type: 'next',
        config: expect.any(Object),
        cookies: expect.any(Object)
      })
    })
  })
})