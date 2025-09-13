/**
 * Auth Middleware - HerbisVeritas V2 MVP  
 * TEMPORAIRE: Version stub pour permettre le build
 * TODO: Réimplémenter avec Supabase SSR corrigé
 */

import { NextResponse, type NextRequest } from 'next/server'

/**
 * Fonction principale middleware Supabase SSR
 * Version temporaire simplifiée
 */
export async function updateSession(request: NextRequest, response?: NextResponse) {
  // Version simplifiée pour permettre le build
  // request parameter is used for potential future routing logic
  return response || NextResponse.next({
    request,
  })
}

export function createMiddleware() {
  return async (request: NextRequest) => {
    return await updateSession(request)
  }
}

// Types temporaires pour éviter les erreurs
export interface UserSession {
  id: string
  email: string
  role: 'user' | 'admin' | 'dev'
}

export type UserRole = 'user' | 'admin' | 'dev'

export async function getSessionDetails(_request: NextRequest): Promise<UserSession | null> {
  // TODO: Implémentation réelle avec Supabase SSR
  // Version temporaire pour permettre le build  
  // _request parameter prefixed with _ to indicate intentionally unused in stub
  return null;
}

export const PROTECTED_ROUTES = ['/admin', '/dashboard']
export const PUBLIC_ROUTES = ['/login', '/register', '/']