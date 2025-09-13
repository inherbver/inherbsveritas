/**
 * Schémas Zod pour validation API côté serveur - HerbisVeritas V2 MVP
 * 
 * Validation centralisée des requêtes API avec sécurité et transformation
 */

import { z } from 'zod'
import { userProfileUpdateSchema, passwordChangeSchema, accountDeletionSchema } from '@/lib/schemas/user-profile'
import { addressCreateSchema, addressUpdateSchema } from '@/lib/addresses/address-validation'

/**
 * === USER PROFILE API VALIDATION ===
 */

// PATCH /api/user/profile
export const updateUserProfileRequestSchema = z.object({
  body: userProfileUpdateSchema.partial() // Tous champs optionnels pour PATCH
})

// POST /api/user/change-password  
export const changePasswordRequestSchema = z.object({
  body: passwordChangeSchema
})

// DELETE /api/user/account
export const deleteAccountRequestSchema = z.object({
  body: accountDeletionSchema
})

/**
 * === ADDRESS API VALIDATION ===
 */

// POST /api/user/addresses
export const createAddressRequestSchema = z.object({
  body: addressCreateSchema
})

// PATCH /api/user/addresses/[id]
export const updateAddressRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID adresse invalide')
  }),
  body: addressUpdateSchema
})

// DELETE /api/user/addresses/[id]
export const deleteAddressRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID adresse invalide')
  })
})

// GET /api/user/addresses?type=shipping|billing
export const getAddressesRequestSchema = z.object({
  query: z.object({
    type: z.enum(['shipping', 'billing']).optional()
  })
})

/**
 * === CART API VALIDATION ===
 */

// POST /api/cart/items
export const addToCartRequestSchema = z.object({
  body: z.object({
    product_id: z.string().uuid('ID produit invalide'),
    quantity: z.number().int().min(1, 'Quantité minimum 1').max(99, 'Quantité maximum 99')
  })
})

// PATCH /api/cart/items/[product_id]
export const updateCartItemRequestSchema = z.object({
  params: z.object({
    product_id: z.string().uuid('ID produit invalide')
  }),
  body: z.object({
    quantity: z.number().int().min(0, 'Quantité minimum 0').max(99, 'Quantité maximum 99')
  })
})

// DELETE /api/cart/items/[product_id]
export const removeFromCartRequestSchema = z.object({
  params: z.object({
    product_id: z.string().uuid('ID produit invalide')
  })
})

// POST /api/cart/merge
export const mergeCartRequestSchema = z.object({
  body: z.object({
    guest_session_id: z.string().min(1, 'Session ID invité requis')
  })
})

/**
 * === ORDERS API VALIDATION ===
 */

// POST /api/orders
export const createOrderRequestSchema = z.object({
  body: z.object({
    shipping_address_id: z.string().uuid('ID adresse livraison invalide'),
    billing_address_id: z.string().uuid('ID adresse facturation invalide').optional(),
    shipping_method: z.enum(['standard', 'express', 'pickup']).default('standard'),
    payment_method: z.enum(['stripe', 'paypal']).default('stripe'),
    notes: z.string().max(500, 'Notes trop longues (max. 500 caractères)').optional()
  })
})

// GET /api/orders?page=1&limit=10&status=pending
export const getOrdersRequestSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional()
  })
})

/**
 * === PRODUCTS API VALIDATION (extension existant) ===
 */

// GET /api/products - Schéma étendu avec sécurité renforcée
export const getProductsRequestSchema = z.object({
  query: z.object({
    category: z.string().uuid().optional(),
    labels: z.string().optional().transform(val => val ? val.split(',').filter(Boolean) : undefined),
    search: z.string().max(100, 'Recherche trop longue').optional(),
    priceMin: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    priceMax: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    inStock: z.string().optional().transform(val => val === 'true'),
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => {
      const parsed = val ? parseInt(val) : 24
      return Math.min(parsed, 100) // Limite max 100 pour sécurité
    })
  })
})

// GET /api/products/[slug]
export const getProductRequestSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug produit requis').regex(/^[a-z0-9-]+$/, 'Slug format invalide')
  })
})

/**
 * === NEWSLETTER API VALIDATION ===
 */

// POST /api/newsletter/subscribe
export const subscribeNewsletterRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide').toLowerCase(),
    first_name: z.string().min(1, 'Prénom requis').max(50),
    language: z.enum(['fr', 'en']).default('fr'),
    source: z.string().max(100).optional() // tracking origine inscription
  })
})

// POST /api/newsletter/unsubscribe
export const unsubscribeNewsletterRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide').toLowerCase(),
    token: z.string().min(1, 'Token de désinscription requis')
  })
})

/**
 * === CONTACT API VALIDATION ===
 */

// POST /api/contact
export const contactRequestSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
    email: z.string().email('Email invalide').toLowerCase(),
    subject: z.string().min(1, 'Sujet requis').max(200, 'Sujet trop long'),
    message: z.string().min(10, 'Message trop court (min. 10 caractères)').max(2000, 'Message trop long (max. 2000 caractères)'),
    phone: z.string().optional(),
    order_number: z.string().optional() // pour support commandes
  })
})

/**
 * === ADMIN API VALIDATION ===
 */

// POST /api/admin/products (création produit - admin uniquement)
export const createProductRequestSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nom produit requis').max(200),
    slug: z.string().min(1, 'Slug requis').regex(/^[a-z0-9-]+$/, 'Slug format invalide'),
    description_short: z.string().max(300),
    description_long: z.string().max(2000),
    price: z.number().min(0, 'Prix invalide'),
    stock: z.number().int().min(0, 'Stock invalide'),
    category_id: z.string().uuid('Catégorie invalide'),
    labels: z.array(z.enum(['bio', 'recolte_main', 'artisanal', 'local', 'vegan', 'naturel', 'zero_dechet'])),
    inci_ingredients: z.array(z.string()).optional(),
    images: z.array(z.string().url()).min(1, 'Au moins une image requise'),
    is_active: z.boolean().default(true),
    seo_title: z.string().max(60).optional(),
    seo_description: z.string().max(160).optional()
  })
})

/**
 * === TYPES INFÉRÉS ===
 */

// User Profile
export type UpdateUserProfileRequest = z.infer<typeof updateUserProfileRequestSchema>
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>
export type DeleteAccountRequest = z.infer<typeof deleteAccountRequestSchema>

// Addresses
export type CreateAddressRequest = z.infer<typeof createAddressRequestSchema>
export type UpdateAddressRequest = z.infer<typeof updateAddressRequestSchema>
export type GetAddressesRequest = z.infer<typeof getAddressesRequestSchema>

// Cart
export type AddToCartRequest = z.infer<typeof addToCartRequestSchema>
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>
export type MergeCartRequest = z.infer<typeof mergeCartRequestSchema>

// Orders
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>
export type GetOrdersRequest = z.infer<typeof getOrdersRequestSchema>

// Products
export type GetProductsRequest = z.infer<typeof getProductsRequestSchema>
export type GetProductRequest = z.infer<typeof getProductRequestSchema>

// Newsletter
export type SubscribeNewsletterRequest = z.infer<typeof subscribeNewsletterRequestSchema>
export type UnsubscribeNewsletterRequest = z.infer<typeof unsubscribeNewsletterRequestSchema>

// Contact
export type ContactRequest = z.infer<typeof contactRequestSchema>

// Admin
export type CreateProductRequest = z.infer<typeof createProductRequestSchema>

/**
 * === UTILITAIRES DE VALIDATION API ===
 */

export class ApiValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message)
    this.name = 'ApiValidationError'
  }
}

/**
 * Middleware de validation pour routes API Next.js
 */
export function validateApiRequest<T extends z.ZodSchema>(
  schema: T,
  request: {
    params?: Record<string, string>
    query?: Record<string, string | string[]>
    body?: any
  }
): z.infer<T> {
  try {
    return schema.parse(request)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      if (firstError) {
        throw new ApiValidationError(
          firstError.path.join('.'),
          firstError.message,
          'VALIDATION_ERROR'
        )
      }
    }
    throw new ApiValidationError('unknown', 'Erreur de validation', 'VALIDATION_ERROR')
  }
}

/**
 * Helper pour réponses d'erreur standardisées
 */
export function createErrorResponse(
  error: ApiValidationError | Error,
  status: number = 400
) {
  if (error instanceof ApiValidationError) {
    return {
      error: {
        code: error.code,
        field: error.field,
        message: error.message
      },
      status
    }
  }

  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erreur interne du serveur'
    },
    status: 500
  }
}

/**
 * Sanitization des données utilisateur (protection XSS)
 */
export function sanitizeUserInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Supprime balises HTML de base
    .replace(/javascript:/gi, '') // Supprime javascript:
    .replace(/on\w+=/gi, '') // Supprime event handlers
    .trim()
}

/**
 * Validation rate limiting par IP
 */
export function getRateLimitKey(request: Request, endpoint: string): string {
  // En production, utiliser IP réelle depuis headers proxy
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  return `ratelimit:${endpoint}:${ip}`
}