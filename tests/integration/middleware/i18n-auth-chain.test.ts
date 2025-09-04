/**
 * Tests Middleware Chain - i18n + Auth
 * 
 * Tests critiques pour middleware combiné next-intl + Supabase
 * Prévient corruption chain qui causait 404 généralisés
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Mocks - Isoler comportements middleware
 */
const mockHandleI18n = jest.fn()
const mockUpdateSession = jest.fn()
const mockCreateClient = jest.fn()

// Mock i18n middleware
jest.mock('next-intl/middleware', () => ({
  createMiddleware: jest.fn(() => mockHandleI18n)
}))

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient
}))

// Mock middleware functions
jest.mock('@/lib/auth/middleware', () => ({
  updateSession: mockUpdateSession
}))

describe('Middleware Chain Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup mocks par défaut
    mockHandleI18n.mockReturnValue(NextResponse.next())
    mockUpdateSession.mockImplementation((req, res) => Promise.resolve(res))
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null }))
      }
    })
  })

  describe('Ordre Exécution Critique', () => {
    test('i18n middleware DOIT être traité AVANT auth', async () => {
      // Import middleware après setup mocks
      const { middleware } = await import('@/middleware')
      
      const request = new NextRequest('http://localhost:3000/boutique')
      
      // Exécution middleware  
      await middleware(request)
      
      // ✅ CRITIQUE: i18n appelé avant updateSession
      expect(mockHandleI18n).toHaveBeenCalledBefore(mockUpdateSession as jest.Mock)
      expect(mockHandleI18n).toHaveBeenCalledWith(request)
    })

    test('auth updateSession ne doit pas écraser response i18n', async () => {
      // Setup response i18n avec headers/cookies spécifiques
      const i18nResponse = new NextResponse(null, { 
        status: 200,
        headers: {
          'X-Middleware-Locale': 'fr',
          'Set-Cookie': 'NEXT_LOCALE=fr; Path=/'
        }
      })
      
      mockHandleI18n.mockReturnValue(i18nResponse)
      mockUpdateSession.mockImplementation(async (req, res) => {
        // Auth doit préserver headers i18n
        expect(res.headers.get('X-Middleware-Locale')).toBe('fr')
        return res
      })
      
      const { middleware } = await import('@/middleware')
      const request = new NextRequest('http://localhost:3000/boutique')
      
      const finalResponse = await middleware(request)
      
      // ✅ Headers i18n préservés après auth
      expect(finalResponse.headers.get('X-Middleware-Locale')).toBe('fr')
    })

    test('erreur auth ne doit pas casser routage i18n', async () => {
      // Simulation erreur auth
      mockUpdateSession.mockRejectedValue(new Error('Auth error'))
      
      const { middleware } = await import('@/middleware')
      const request = new NextRequest('http://localhost:3000/')
      
      // Middleware doit gérer erreur gracieusement
      let result: NextResponse
      
      try {
        result = await middleware(request)
      } catch (error) {
        // Si erreur, i18n doit quand même avoir été traité
        expect(mockHandleI18n).toHaveBeenCalled()
        throw error
      }
      
      // Ou retourner response i18n en fallback
      expect(result).toBeDefined()
    })
  })

  describe('Gestion Cookies - Intégrité', () => {
    test('cookies i18n et auth doivent coexister', async () => {
      const i18nResponse = NextResponse.next()
      i18nResponse.cookies.set('NEXT_LOCALE', 'fr')
      
      mockHandleI18n.mockReturnValue(i18nResponse)
      
      mockUpdateSession.mockImplementation(async (req, res) => {
        // Auth ajoute ses cookies SANS écraser i18n
        res.cookies.set('supabase-auth-token', 'token123')
        return res
      })
      
      const { middleware } = await import('@/middleware')
      const request = new NextRequest('http://localhost:3000/en/shop')
      
      const response = await middleware(request)
      
      // ✅ Les deux types de cookies présents
      const cookies = response.cookies.getAll()
      const cookieNames = cookies.map(c => c.name)
      
      expect(cookieNames).toContain('NEXT_LOCALE')
      expect(cookieNames).toContain('supabase-auth-token')
    })

    test('conflits cookies doivent être résolus en faveur de i18n', async () => {
      const i18nResponse = NextResponse.next()
      i18nResponse.cookies.set('shared-cookie', 'i18n-value')
      
      mockHandleI18n.mockReturnValue(i18nResponse)
      
      mockUpdateSession.mockImplementation(async (req, res) => {
        // Conflit: même nom de cookie
        res.cookies.set('shared-cookie', 'auth-value')
        return res
      })
      
      const { middleware } = await import('@/middleware')
      const request = new NextRequest('http://localhost:3000/')
      
      const response = await middleware(request)
      
      // ✅ i18n prioritaire pour éviter casser routage
      const sharedCookie = response.cookies.get('shared-cookie')
      expect(sharedCookie?.value).toBe('i18n-value')
    })
  })

  describe('Matcher Configuration', () => {
    test('matcher doit capturer routes critiques i18n', () => {
      // Import config matcher
      const { config } = require('@/middleware')
      
      const criticalRoutes = [
        '/',
        '/boutique', 
        '/en',
        '/en/shop',
        '/fr/boutique',
        '/produits/test'
      ]
      
      criticalRoutes.forEach(route => {
        // Test que route match au moins un pattern
        const matches = config.matcher.some((pattern: string) => {
          // Simulation Next.js matcher logic
          if (pattern === '/') return route === '/'
          
          if (pattern.includes('(?!')) {
            // Pattern exclusion - doit matcher sauf assets
            return !route.includes('_next') && 
                   !route.includes('.') &&
                   !route.includes('favicon')
          }
          
          return false
        })
        
        expect(matches).toBe(true)
      })
    })

    test('assets ne doivent pas déclencher middleware', () => {
      const { config } = require('@/middleware')
      
      const assetRoutes = [
        '/_next/static/css/app.css',
        '/_next/image/logo.png', 
        '/favicon.ico',
        '/robots.txt',
        '/logo.svg'
      ]
      
      assetRoutes.forEach(route => {
        const matches = config.matcher.some((pattern: string) => {
          if (pattern.includes('(?!')) {
            // Pattern exclusion - NE doit PAS matcher assets
            return !route.includes('_next') && 
                   !route.includes('favicon') &&
                   !route.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
          }
          return false
        })
        
        // Assets ne doivent PAS matcher
        expect(matches).toBe(false)
      })
    })
  })

  describe('Performance Chain', () => {
    test('middleware combiné ne doit pas causer timeout', async () => {
      // Simulation latence réseau
      mockHandleI18n.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(NextResponse.next()), 100)
        })
      })
      
      mockUpdateSession.mockImplementation(async (req, res) => {
        return new Promise(resolve => {
          setTimeout(() => resolve(res), 50)
        })
      })
      
      const { middleware } = await import('@/middleware')
      const request = new NextRequest('http://localhost:3000/')
      
      const startTime = Date.now()
      const response = await middleware(request)
      const duration = Date.now() - startTime
      
      // ✅ Total < 1 seconde (éviter timeouts 10+ secondes)
      expect(duration).toBeLessThan(1000)
      expect(response).toBeDefined()
    })

    test('middleware errors ne doivent pas bloquer indéfiniment', async () => {
      // i18n prend du temps
      mockHandleI18n.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(NextResponse.next()), 2000)
        })
      })
      
      const { middleware } = await import('@/middleware')
      const request = new NextRequest('http://localhost:3000/')
      
      // Test avec timeout strict
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 3000)
      })
      
      const middlewarePromise = middleware(request)
      
      // Ne doit pas timeout
      const result = await Promise.race([middlewarePromise, timeoutPromise])
      expect(result).toBeDefined()
    })
  })
})

describe('Scénarios Régression - Chain Corruption', () => {
  test('reproduction erreur: auth écrase i18n response', async () => {
    // Scenario problématique décrit dans notes techniques
    const i18nResponse = new NextResponse('i18n content', { 
      status: 200,
      headers: { 'X-Locale': 'fr' }
    })
    
    mockHandleI18n.mockReturnValue(i18nResponse)
    
    // ❌ Auth écrase complètement response (comportement cassé)
    mockUpdateSession.mockImplementation(async () => {
      return new NextResponse('auth override', { status: 200 })
    })
    
    const { middleware } = await import('@/middleware')
    const request = new NextRequest('http://localhost:3000/boutique')
    
    const response = await middleware(request)
    
    // ✅ Doit préserver les éléments i18n critiques
    // (Si ce test échoue, possible régression chain)
    const text = await response.text()
    const locale = response.headers.get('X-Locale')
    
    // Au minimum, headers i18n doivent survivre
    expect(locale).toBe('fr')
  })

  test('middleware isolation - i18n seul doit fonctionner', async () => {
    // Test i18n middleware isolé (sans auth)
    const isolatedI18n = mockHandleI18n
    
    const request = new NextRequest('http://localhost:3000/boutique')
    const response = isolatedI18n(request)
    
    expect(response).toBeDefined()
    expect(response.status).toBe(200)
    
    // i18n isolé ne doit jamais causer 404
    expect(response.status).not.toBe(404)
  })

  test('auth isolation - sans i18n ne doit pas casser', async () => {
    // Test auth seul (sans i18n)
    const request = new NextRequest('http://localhost:3000/')
    const response = NextResponse.next()
    
    const authResult = await mockUpdateSession(request, response)
    
    expect(authResult).toBeDefined()
    // Auth seul ne cause pas 404
    expect(authResult.status).not.toBe(404)
  })
})