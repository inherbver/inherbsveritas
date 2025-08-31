/**
 * Auth Middleware - HerbisVeritas V2 MVP  
 * 
 * Implémentation Supabase SSR + RBAC selon patterns Context7 :
 * - Session refresh obligatoire pour Server Components
 * - Cookie sync client/serveur critique
 * - Protection routes par rôles custom claims
 * - Performance optimisée (< 50ms)
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { 
  type UserRole, 
  type UserSession,
  PROTECTED_ROUTES, 
  PUBLIC_ROUTES 
} from '@/lib/auth/types'

/**
 * Fonction principale middleware Supabase SSR
 * CRITIQUE: Retourner supabaseResponse inchangé (Context7 pattern)
 */
export async function updateSession(request: NextRequest, response?: NextResponse) {
  // Utiliser response fournie (i18n) ou créer nouvelle si aucune
  let supabaseResponse = response || NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITIQUE: Ne pas executer de code entre createServerClient et getUser()
  // Un bug simple peut causer des déconnexions aléatoires

  // OBLIGATOIRE: Refresh session pour Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Vérification route publique (bypass auth)
  if (isPublicRoute(pathname)) {
    return supabaseResponse
  }

  // User non authentifié → redirection login
  if (!user) {
    return redirectToLogin(request, pathname)
  }

  // User authentifié → vérification permissions RBAC
  const userRole = getUserRole(user)
  const routeProtection = getRouteProtection(pathname)

  if (routeProtection && !hasAccess(userRole, routeProtection.allowedRoles)) {
    return redirectToUnauthorized(request, routeProtection.redirectTo)
  }

  // CRITIQUE: Retourner supabaseResponse inchangé (Context7)
  return supabaseResponse
}

/**
 * Extraire rôle utilisateur depuis custom claims JWT
 * Fallback sur 'user' si non défini (sécurité)
 */
function getUserRole(user: any): UserRole {
  // Récupérer depuis app_metadata (set par auth hook)
  const role = user.app_metadata?.role as UserRole
  
  // Validation + fallback sécurisé
  if (role && ['user', 'admin', 'dev'].includes(role)) {
    return role
  }
  
  // Fallback par défaut
  return 'user'
}

/**
 * Vérifier si route est publique (pas d'auth requise)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === pathname) return true
    
    // Support wildcards pour routes dynamiques
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2)
      return pathname.startsWith(baseRoute)
    }
    
    return false
  })
}

/**
 * Trouver configuration protection pour route donnée
 */
function getRouteProtection(pathname: string) {
  return PROTECTED_ROUTES.find(route => {
    // Match exact
    if (route.path === pathname) return true
    
    // Match prefix pour routes imbriquées
    if (pathname.startsWith(route.path + '/')) return true
    
    return false
  })
}

/**
 * Vérifier si user a accès à la route (RBAC)
 */
function hasAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

/**
 * Redirection login avec préservation destination
 */
function redirectToLogin(request: NextRequest, originalPath: string) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('redirectedFrom', originalPath)
  return NextResponse.redirect(url)
}

/**
 * Redirection unauthorized avec fallback
 */
function redirectToUnauthorized(request: NextRequest, customRedirect?: string) {
  const url = request.nextUrl.clone()
  url.pathname = customRedirect || '/unauthorized'
  return NextResponse.redirect(url)
}

/**
 * Helper: Extraire session complète pour debugging
 * Usage: const session = await getSessionDetails(request)
 */
export async function getSessionDetails(request: NextRequest): Promise<UserSession | null> {
  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // Lecture seule pour debugging
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  return {
    userId: user.id,
    email: user.email!,
    role: getUserRole(user),
    exp: 0, // TODO: extraire du JWT si nécessaire
    iat: 0
  }
}