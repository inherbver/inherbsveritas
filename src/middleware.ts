/**
 * Middleware d'authentification et permissions HerbisVeritas
 * Implémentation TDD Red → Green selon CLAUDE.md
 */

import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'
import type { User } from '@supabase/supabase-js'

type Role = 'user' | 'admin' | 'dev'

// Configuration des routes et permissions
const routeConfig = {
  public: [
    '/',
    '/shop',
    '/magazine', 
    '/about',
    '/contact',
    '/auth',
    '/api/public'
  ],
  authenticated: [
    '/profile',
    '/orders',
    '/addresses', 
    '/wishlist'
  ],
  admin: [
    '/admin'
  ],
  dev: [
    '/dev'
  ]
}

/**
 * Vérifie si une route correspond à un pattern
 */
function matchesRoute(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    // Pattern exact
    if (pattern === pathname) return true
    
    // Pattern avec wildcard (ex: /admin/* pour /admin/products)
    if (pattern.endsWith('*')) {
      const basePattern = pattern.slice(0, -1)
      return pathname.startsWith(basePattern)
    }
    
    // Pattern prefix (ex: /shop pour /shop/product-slug)
    return pathname.startsWith(pattern + '/')
  })
}

/**
 * Récupère le rôle d'un utilisateur
 */
function getUserRole(user: User): Role {
  return user.user_metadata?.role as Role || 'user'
}

/**
 * Vérifie si l'utilisateur a accès à une route selon son rôle
 */
function hasRouteAccess(user: User | null, pathname: string): boolean {
  // Routes publiques - accès libre
  if (matchesRoute(pathname, routeConfig.public)) {
    return true
  }

  // Pas d'utilisateur connecté pour routes protégées
  if (!user) return false

  const userRole = getUserRole(user)

  // Routes utilisateur authentifié
  if (matchesRoute(pathname, routeConfig.authenticated)) {
    return true // Tout utilisateur connecté peut accéder
  }

  // Routes admin seulement
  if (matchesRoute(pathname, [...routeConfig.admin.map(r => r + '*')])) {
    return userRole === 'admin' || userRole === 'dev'
  }

  // Routes dev seulement  
  if (matchesRoute(pathname, [...routeConfig.dev.map(r => r + '*')])) {
    return userRole === 'dev'
  }

  return false
}

/**
 * Ajoute headers de sécurité pour routes sensibles
 */
function addSecurityHeaders(response: NextResponse, pathname: string): void {
  const isSensitive = matchesRoute(pathname, [
    ...routeConfig.admin.map(r => r + '*'),
    ...routeConfig.dev.map(r => r + '*')
  ])

  if (isSensitive) {
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff') 
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
  }
}

/**
 * Log tentative d'accès non autorisé
 */
function logUnauthorizedAccess(user: User | null, pathname: string): void {
  console.warn('Unauthorized access attempt', {
    userId: user?.id || 'anonymous',
    userRole: user ? getUserRole(user) : 'anonymous',
    route: pathname,
    timestamp: new Date().toISOString()
  })
}

/**
 * Nettoie les cookies corrompus
 */
function clearCorruptedCookies(response: NextResponse): void {
  // Nettoie tous les cookies Supabase
  const cookiesToClear = [
    'supabase-auth-token',
    'sb-access-token', 
    'sb-refresh-token'
  ]

  cookiesToClear.forEach(cookieName => {
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immédiatement
    })
  })
}

/**
 * Middleware principal Next.js
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  try {
    // Créer client Supabase pour middleware
    const { supabase, response } = createClient(request)

    // Récupérer la session utilisateur
    const { data: { session }, error } = await supabase.auth.getSession()

    // Gérer les erreurs de session (token corrompu, etc.)
    if (error) {
      console.warn('Session error in middleware:', error.message)
      
      const redirectResponse = NextResponse.redirect(new URL('/auth/login', request.url))
      clearCorruptedCookies(redirectResponse)
      return redirectResponse
    }

    const user = session?.user || null

    // Vérifier expiration du token
    if (session && session.expires_at && session.expires_at * 1000 < Date.now()) {
      const redirectResponse = NextResponse.redirect(new URL('/auth/login', request.url))
      clearCorruptedCookies(redirectResponse)
      return redirectResponse
    }

    // Vérifier les permissions d'accès
    const hasAccess = hasRouteAccess(user, pathname)

    if (!hasAccess) {
      // Log tentative non autorisée
      logUnauthorizedAccess(user, pathname)

      if (!user) {
        // Rediriger vers login si non connecté
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      } else {
        // Retourner 403 si connecté mais pas autorisé
        const forbiddenResponse = new NextResponse('Access Forbidden', { status: 403 })
        addSecurityHeaders(forbiddenResponse, pathname)
        return forbiddenResponse
      }
    }

    // Ajouter headers de sécurité si nécessaire
    const finalResponse = response || NextResponse.next()
    addSecurityHeaders(finalResponse, pathname)

    return finalResponse

  } catch (error) {
    console.error('Middleware error:', error)
    
    // En cas d'erreur réseau Supabase, retourner 503
    const errorResponse = new NextResponse('Service temporarily unavailable', { 
      status: 503,
      headers: {
        'Retry-After': '30' // Retry dans 30 secondes
      }
    })
    
    return errorResponse
  }
}

/**
 * Configuration Next.js - routes où le middleware s'applique
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}