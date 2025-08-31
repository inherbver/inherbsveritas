/**
 * Next.js Middleware  
 * Handles internationalization and authentication
 */
import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export default async function middleware(request: NextRequest) {
  // 1. Gestion i18n en premier
  const intlResponse = intlMiddleware(request)
  
  // 2. Protection des routes sensibles (phase dev)
  const pathname = request.nextUrl.pathname
  
  // Routes protégées en phase développement
  const isAdminRoute = pathname.includes('/admin')
  const isProfileRoute = pathname.includes('/profile')
  
  if (isAdminRoute || isProfileRoute) {
    try {
      const supabase = await createMiddlewareClient(request)
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      // Protection admin spécifique
      if (isAdminRoute) {
        const { data: userData } = await supabase.auth.getUser()
        const userRole = userData.user?.user_metadata?.role || 'user'
        
        if (userRole !== 'admin' && userRole !== 'dev') {
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
      }
    } catch (error) {
      console.error('Middleware auth error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return intlResponse
}

export const config = {
  // Match toutes les routes sauf les assets statiques
  matcher: [
    // Root redirect
    '/',
    
    // Routes avec locales (MVP: fr/en uniquement)
    '/(fr|en)/:path*',
    
    // Routes sans locale (pour redirection) + auth routes
    '/((?!_next|_vercel|api|.*\\..*).*)',
    
    // Routes protégées explicitement
    '/admin/:path*',
    '/profile/:path*'
  ]
}