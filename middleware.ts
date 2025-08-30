import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/auth/middleware'

/**
 * Next.js 15 Middleware - HerbisVeritas V2 MVP
 * 
 * Gère l'authentification Supabase + protection routes RBAC
 * - Session refresh automatique pour Server Components
 * - Protection routes par rôles (user/admin/dev)  
 * - Redirections seamless
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Matcher optimisé pour performance MVP :
     * - Exclut static files (_next/static, _next/image, favicon.ico)
     * - Exclut assets (.svg, .png, .jpg, .jpeg, .gif, .webp)
     * - Inclut toutes les autres routes pour auth check
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}