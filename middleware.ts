import createMiddleware from "next-intl/middleware";
import {
  locales,
  defaultLocale,
  localePrefix,
  localeDetection,
  pathnames,
  type Locale,
} from "./src/i18n-config";
import { type NextRequest, NextResponse } from "next/server";

const handleI18n = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  pathnames,
  localeDetection,
});

export async function middleware(request: NextRequest) {
  // 1. ÉTAPE INITIALE : Gérer i18n et routes spéciales
  let response: NextResponse;
  try {
    // Appliquer le middleware i18n
    response = handleI18n(request);
  } catch (error) {
    response = NextResponse.next();
  }

  // Extraction de la locale pour gérer les rewrites localisés
  const pathname = request.nextUrl.pathname;
  let currentLocaleForRewrite: Locale = defaultLocale;
  const firstPathSegment = pathname.split("/")[1];
  const isValidLocale = locales.includes(firstPathSegment as Locale);

  if (isValidLocale) {
    currentLocaleForRewrite = firstPathSegment as Locale;
    const pathToCheckForRewrite =
      pathname.substring(`/${currentLocaleForRewrite}`.length) || "/";

    // Gestion des routes localisées : /boutique -> /shop
    if (pathToCheckForRewrite === "/boutique") {
      return NextResponse.rewrite(
        new URL(`/${currentLocaleForRewrite}/shop`, request.url),
      );
    }
  }

  return response;
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