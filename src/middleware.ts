/**
 * Middleware d'authentification - HerbisVeritas V2 MVP
 * TEMPORAIRE: Version stub pour permettre le build
 * TODO: Réimplémenter avec Supabase middleware corrigé
 */

import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(_request: NextRequest) {
  // Version simplifiée temporaire qui laisse passer toutes les requêtes
  return NextResponse.next()
}

// Configuration des routes - gardée pour référence
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}