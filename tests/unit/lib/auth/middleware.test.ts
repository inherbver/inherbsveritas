/**
 * Tests unitaires pour auth/middleware  
 * TDD pour la protection des routes et redirection
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/middleware'
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from '@/lib/auth/types'

// Mock des modules externes
jest.mock('@/lib/supabase/middleware', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    }
  }))
}))

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn((url) => ({ redirect: url })),
    next: jest.fn(() => ({ next: true })),
    rewrite: jest.fn((url) => ({ rewrite: url }))
  }
}))

describe('auth/middleware (TDD)', () => {
  let mockSupabase: any
  let mockNextResponse: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    const { createClient } = require('@/lib/supabase/middleware')
    mockSupabase = createClient()
    
    mockNextResponse = require('next/server').NextResponse
  })

  describe('Public routes access', () => {
    const publicPaths = ['/', '/boutique', '/magazine', '/contact', '/login', '/signup']

    publicPaths.forEach(path => {
      it(`should allow access to public route: ${path}`, async () => {
        // Arrange
        const mockRequest = {
          nextUrl: { pathname: path, origin: 'https://herbisveritas.fr' }
        } as NextRequest

        // Act
        const result = await auth(mockRequest)

        // Assert
        expect(mockNextResponse.next).toHaveBeenCalled()
        expect(result).toEqual({ next: true })
      })
    })
  })

  describe('Protected routes - unauthenticated', () => {
    it('should redirect to login for protected route when not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const mockRequest = {
        nextUrl: { 
          pathname: '/profile', 
          origin: 'https://herbisveritas.fr',
          toString: () => 'https://herbisveritas.fr/profile'
        }
      } as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      const expectedRedirectUrl = 'https://herbisveritas.fr/login?callbackUrl=https://herbisveritas.fr/profile'
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(expectedRedirectUrl)
    })

    it('should redirect to login for admin route when not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const mockRequest = {
        nextUrl: { 
          pathname: '/admin', 
          origin: 'https://herbisveritas.fr',
          toString: () => 'https://herbisveritas.fr/admin'
        }
      } as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      const expectedRedirectUrl = 'https://herbisveritas.fr/login?callbackUrl=https://herbisveritas.fr/admin'
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(expectedRedirectUrl)
    })
  })

  describe('Protected routes - authenticated user', () => {
    it('should allow user access to profile', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
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
        nextUrl: { pathname: '/profile' }
      } as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toEqual({ next: true })
    })

    it('should redirect user to unauthorized for admin route', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
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
          pathname: '/admin',
          origin: 'https://herbisveritas.fr'
        }
      } as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalledWith('https://herbisveritas.fr/unauthorized')
    })

    it('should allow admin access to admin routes', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
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
        nextUrl: { pathname: '/admin/products' }
      } as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toEqual({ next: true })
    })

    it('should redirect admin to unauthorized for dev route', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
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
        nextUrl: { 
          pathname: '/dev',
          origin: 'https://herbisveritas.fr'
        }
      } as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalledWith('https://herbisveritas.fr/unauthorized')
    })

    it('should allow dev access to all routes', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
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
          nextUrl: { pathname: route }
        } as NextRequest

        // Act
        const result = await auth(mockRequest)

        // Assert
        expect(mockNextResponse.next).toHaveBeenCalled()
        expect(result).toEqual({ next: true })
      }
    })
  })

  describe('Auth pages - already authenticated', () => {
    it('should redirect authenticated user away from login page', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
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
          pathname: '/login',
          origin: 'https://herbisveritas.fr',
          searchParams: new URLSearchParams('callbackUrl=/profile')
        }
      } as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalledWith('https://herbisveritas.fr/profile')
    })

    it('should redirect authenticated user away from signup page', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
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
        nextUrl: { 
          pathname: '/signup',
          origin: 'https://herbisveritas.fr'
        }
      } as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalledWith('https://herbisveritas.fr/admin')
    })
  })

  describe('Error handling', () => {
    it('should handle Supabase errors gracefully', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Network error'))

      const mockRequest = {
        nextUrl: { pathname: '/profile' }
      } as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toEqual({ next: true })
    })

    it('should handle missing user metadata gracefully', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
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
        nextUrl: { pathname: '/profile' }
      } as NextRequest

      // Act
      const result = await auth(mockRequest)

      // Assert
      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toEqual({ next: true })
    })
  })
})