/**
 * ROOT: IMAGE POLICY MVP
 * getDefaultProductImage(): string - image par défaut si image_url null
 * getResponsiveImageProps(url): { src, srcset?, sizes? }
 * Responsive: [320, 480, 768] (webp si dispo, fallback jpg)
 * Ne jamais upscaler > original; conserver ratio; pas d'URL hardcodées
 */


// Configuration responsive
const RESPONSIVE_BREAKPOINTS = [320, 480, 768, 1024] as const
const SUPPORTED_FORMATS = ['webp', 'jpg', 'png'] as const
const DEFAULT_QUALITY = 80
const DEFAULT_PRODUCT_IMAGE = '/images/products/default-product.jpg'

/**
 * Retourne l'image par défaut si aucune image fournie
 */
export function getDefaultProductImage(): string {
  return DEFAULT_PRODUCT_IMAGE
}

/**
 * Génère le texte alt pour une image produit
 */
export function getProductImageAlt(
  productName: string,
  labels: string[] = []
): string {
  const baseAlt = `Photo du produit ${productName}`
  
  if (labels.length === 0) {
    return baseAlt
  }
  
  // Ajouter quelques labels dans l'alt (max 3 pour lisibilité)
  const displayLabels = labels.slice(0, 3).join(', ')
  return `${baseAlt}, ${displayLabels}`
}

/**
 * Génère les props d'image responsive
 */
export function getResponsiveImageProps(
  imageUrl: string | null,
  options: {
    width?: number
    height?: number
    quality?: number
    priority?: boolean
  } = {}
): {
  src: string
  srcSet?: string
  sizes?: string
  alt?: string
  width?: number
  height?: number
  priority?: boolean
} {
  // Utiliser image par défaut si pas d'URL
  const src = imageUrl ?? getDefaultProductImage()
  
  // Pour MVP: pas de transformation d'images complexes
  // Retourner l'URL telle quelle avec responsive basique
  const result = {
    src,
    priority: options.priority ?? false
  }
  
  // Ajouter width/height si fournis
  if (options.width) (result as any).width = options.width
  if (options.height) (result as any).height = options.height
  
  // Générer srcSet si URL Supabase Storage (détection basique)
  if (imageUrl && isSupabaseStorageUrl(imageUrl)) {
    (result as any).srcSet = generateSupabaseSrcSet(imageUrl, options.quality);
    (result as any).sizes = generateResponsiveSizes()
  }
  
  return result
}

/**
 * Optimise une URL d'image Supabase Storage
 */
export function optimizeSupabaseImage(
  imageUrl: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpg' | 'png'
  } = {}
): string {
  if (!isSupabaseStorageUrl(imageUrl)) {
    return imageUrl
  }
  
  const url = new URL(imageUrl)
  
  // Ajouter les paramètres de transformation Supabase
  if (options.width) url.searchParams.set('width', options.width.toString())
  if (options.height) url.searchParams.set('height', options.height.toString())
  if (options.quality) url.searchParams.set('quality', options.quality.toString())
  if (options.format) url.searchParams.set('format', options.format)
  
  return url.toString()
}

/**
 * Génère un placeholder en base64 pour le loading
 */
export function getImagePlaceholder(
  width: number = 400,
  height: number = 400
): string {
  // SVG simple avec couleur de fond HerbisVeritas
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <circle cx="50%" cy="50%" r="20" fill="#d1d5db"/>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Valide qu'une URL d'image est accessible et valide
 */
export function validateImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Extrait les dimensions d'une image (si disponibles dans l'URL)
 */
export function extractImageDimensions(url: string): { width?: number; height?: number } {
  try {
    const parsed = new URL(url)
    const width = parsed.searchParams.get('width')
    const height = parsed.searchParams.get('height')
    
    const result: { width?: number; height?: number } = {}
    if (width) result.width = parseInt(width, 10)
    if (height) result.height = parseInt(height, 10)
    return result
  } catch {
    return {}
  }
}

// Helpers privés

function isSupabaseStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname.includes('supabase.co') && parsed.pathname.includes('/storage/')
  } catch {
    return false
  }
}

function generateSupabaseSrcSet(imageUrl: string, quality?: number): string {
  const srcSetEntries = RESPONSIVE_BREAKPOINTS.map(width => {
    const optimizedUrl = optimizeSupabaseImage(imageUrl, { 
      width, 
      quality: quality ?? DEFAULT_QUALITY,
      format: 'webp'
    })
    return `${optimizedUrl} ${width}w`
  })
  
  return srcSetEntries.join(', ')
}

function generateResponsiveSizes(): string {
  return [
    '(max-width: 480px) 100vw',
    '(max-width: 768px) 50vw', 
    '(max-width: 1024px) 33vw',
    '25vw'
  ].join(', ')
}

// Types et constantes
export interface ResponsiveImageConfig {
  breakpoints: readonly number[]
  quality: number
  formats: readonly string[]
  defaultImage: string
}

export const IMAGE_CONFIG: ResponsiveImageConfig = {
  breakpoints: RESPONSIVE_BREAKPOINTS,
  quality: DEFAULT_QUALITY,
  formats: SUPPORTED_FORMATS,
  defaultImage: DEFAULT_PRODUCT_IMAGE
}