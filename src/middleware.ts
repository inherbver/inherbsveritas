/**
 * Next.js Middleware
 * Handles internationalization and authentication
 */
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(de|en|es|fr)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/products` -> `/en/products`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
}