# API Specifications - HerbisVeritas V2 MVP

## 📋 Vue d'ensemble

Cette documentation définit les spécifications des APIs pour HerbisVeritas V2 MVP (13 tables), utilisant Next.js 15 Server Actions avec `next-safe-action` pour la validation et la sécurité des types.

**Architecture MVP Validée** : 13 tables essentielles, i18n FR/EN, labels HerbisVeritas, TipTap éditeur, Stripe complet.

## 🏗️ Architecture API

### Patterns Architecturaux

```typescript
// Pattern uniforme pour toutes les Server Actions
import { createSafeAction } from '@/lib/create-safe-action'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

// 1. Schéma de validation Zod
const CreateProductSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  price: z.number().positive('Prix doit être positif'),
  description: z.string().optional(),
  category_id: z.string().uuid('ID catégorie invalide')
})

// 2. Handler typé et sécurisé
const handler = async (data: z.infer<typeof CreateProductSchema>) => {
  const supabase = await createSupabaseServerClient()
  
  // Vérification permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  
  // Opération base de données
  const { data: product, error } = await supabase
    .from('products')
    .insert(data)
    .select()
    .single()
    
  if (error) throw error
  
  // Revalidation cache
  revalidatePath('/admin/products')
  return { product }
}

// 3. Action exportée
export const createProduct = createSafeAction(CreateProductSchema, handler)
```

### Structure des Réponses

```typescript
// Types de réponse standardisés
export interface ActionResult<T> {
  data?: T
  error?: {
    message: string
    code?: string
    field?: string
  }
}

// Résultats paginés
export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Métadonnées de réponse
export interface ResponseMetadata {
  timestamp: string
  requestId: string
  version: string
}
```

## 🔐 Authentification & Autorisation

### Middleware de Sécurité

```typescript
// Décorateurs de sécurité pour Server Actions
export const withAuth = <T extends any[], R>(
  action: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      throw new Error('Authentication required')
    }
    
    return action(...args)
  }
}

export const withAdminAuth = <T extends any[], R>(
  action: (...args: T) => Promise<R>
) => {
  return withAuth(async (...args: T): Promise<R> => {
    const supabase = await createSupabaseServerClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .single()
    
    if (profile?.role !== 'admin') {
      throw new Error('Admin access required')
    }
    
    return action(...args)
  })
}
```

### Gestion des Sessions

```typescript
// Actions d'authentification
export const signIn = createSafeAction(
  z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Mot de passe trop court')
  }),
  async ({ email, password }) => {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    redirect('/dashboard')
  }
)

export const signOut = createSafeAction(
  z.object({}),
  async () => {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
    redirect('/auth/signin')
  }
)
```

## 🛍️ APIs E-commerce

### Gestion Produits

```typescript
// Schémas de validation
const ProductFilters = z.object({
  category_id: z.string().uuid().optional(),
  price_min: z.number().positive().optional(),
  price_max: z.number().positive().optional(),
  search: z.string().optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(20)
})

// Actions CRUD complètes
export const getProducts = createSafeAction(
  ProductFilters,
  async (filters) => {
    const supabase = await createSupabaseServerClient()
    
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        ),
        product_images (
          url,
          alt_text
        )
      `)
      .eq('active', true)
    
    // Filtres dynamiques
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    
    if (filters.price_min) {
      query = query.gte('price', filters.price_min)
    }
    
    if (filters.price_max) {
      query = query.lte('price', filters.price_max)
    }
    
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    
    // Pagination
    const { data: products, error, count } = await query
      .range(
        (filters.page - 1) * filters.limit,
        filters.page * filters.limit - 1
      )
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return {
      data: products,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / filters.limit)
      }
    }
  }
)

export const updateProductStock = createSafeAction(
  z.object({
    id: z.string().uuid(),
    stock_quantity: z.number().nonnegative()
  }),
  withAdminAuth(async ({ id, stock_quantity }) => {
    const supabase = await createSupabaseServerClient()
    
    const { data: product, error } = await supabase
      .from('products')
      .update({ stock_quantity, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    revalidatePath('/admin/products')
    revalidatePath('/products')
    
    return { product }
  })
)
```

### Gestion Panier

```typescript
const CartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().positive().max(99)
})

export const addToCart = createSafeAction(
  CartItemSchema,
  withAuth(async ({ product_id, quantity }) => {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Vérifier disponibilité produit
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock_quantity, active')
      .eq('id', product_id)
      .single()
    
    if (productError) throw productError
    if (!product.active) throw new Error('Produit indisponible')
    if (product.stock_quantity < quantity) {
      throw new Error('Stock insuffisant')
    }
    
    // Ajouter/mettre à jour panier
    const { data: cartItem, error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        product_id,
        quantity
      })
      .select(`
        *,
        products (
          name,
          price,
          product_images (url, alt_text)
        )
      `)
      .single()
    
    if (error) throw error
    
    return { cartItem }
  })
)

export const getCartSummary = createSafeAction(
  z.object({}),
  withAuth(async () => {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          name,
          price,
          product_images (url, alt_text)
        )
      `)
      .eq('user_id', user.id)
    
    if (error) throw error
    
    const total = cartItems.reduce((sum, item) => 
      sum + (item.products.price * item.quantity), 0
    )
    
    return {
      items: cartItems,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      total
    }
  })
)
```

### Gestion Commandes

```typescript
const CreateOrderSchema = z.object({
  address_id: z.string().uuid(),
  payment_method: z.enum(['card', 'bank_transfer']),
  notes: z.string().optional()
})

export const createOrder = createSafeAction(
  CreateOrderSchema,
  withAuth(async ({ address_id, payment_method, notes }) => {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Transaction complexe
    const { data, error } = await supabase.rpc('create_order_transaction', {
      p_user_id: user.id,
      p_address_id: address_id,
      p_payment_method: payment_method,
      p_notes: notes
    })
    
    if (error) throw error
    
    // Nettoyer le panier
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
    
    revalidatePath('/orders')
    
    return { order: data }
  })
)

export const updateOrderStatus = createSafeAction(
  z.object({
    order_id: z.string().uuid(),
    status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
  }),
  withAdminAuth(async ({ order_id, status }) => {
    const supabase = await createSupabaseServerClient()
    
    const { data: order, error } = await supabase
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', order_id)
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .single()
    
    if (error) throw error
    
    // Notifier le client (webhook ou email)
    await notifyOrderStatusChange(order)
    
    revalidatePath('/admin/orders')
    
    return { order }
  })
)
```

## 📅 APIs Marchés & Événements

### Gestion Marchés

```typescript
const MarketSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  location: z.string().min(1),
  contact_info: z.string().optional(),
  recurrence_type: z.enum(['weekly', 'monthly', 'one_time']),
  recurrence_config: z.object({
    day_of_week: z.number().min(0).max(6).optional(),
    day_of_month: z.number().min(1).max(31).optional(),
    start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  }),
  active: z.boolean().default(true)
})

export const createMarket = createSafeAction(
  MarketSchema,
  withAdminAuth(async (data) => {
    const supabase = await createSupabaseServerClient()
    
    const { data: market, error } = await supabase
      .from('markets')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    
    // Générer les occurrences initiales
    await generateMarketOccurrences(market.id, data.recurrence_config)
    
    revalidatePath('/admin/markets')
    
    return { market }
  })
)

export const getUpcomingMarkets = createSafeAction(
  z.object({
    limit: z.number().positive().max(50).default(10),
    city: z.string().optional()
  }),
  async ({ limit, city }) => {
    const supabase = await createSupabaseServerClient()
    
    let query = supabase
      .from('market_occurrences')
      .select(`
        *,
        markets (
          name,
          location,
          description
        )
      `)
      .gte('date', new Date().toISOString().split('T')[0])
      .eq('cancelled', false)
      .order('date', { ascending: true })
      .limit(limit)
    
    if (city) {
      query = query.ilike('markets.location', `%${city}%`)
    }
    
    const { data: occurrences, error } = await query
    
    if (error) throw error
    
    return { occurrences }
  }
)
```

## 📰 APIs Contenu & Magazine

### Gestion Articles

```typescript
const ArticleSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  featured_image: z.string().url().optional(),
  category_id: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  seo_meta: z.object({
    title: z.string().max(60).optional(),
    description: z.string().max(160).optional()
  }).optional(),
  published: z.boolean().default(false),
  published_at: z.string().datetime().optional()
})

export const createArticle = createSafeAction(
  ArticleSchema,
  withAdminAuth(async (data) => {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Générer slug unique si nécessaire
    const finalSlug = await generateUniqueSlug(data.slug, 'articles')
    
    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        ...data,
        slug: finalSlug,
        author_id: user.id,
        published_at: data.published ? new Date().toISOString() : null
      })
      .select(`
        *,
        categories (name),
        profiles!articles_author_id_fkey (full_name)
      `)
      .single()
    
    if (error) throw error
    
    // Gérer les tags
    if (data.tags?.length) {
      await associateArticleTags(article.id, data.tags)
    }
    
    revalidatePath('/admin/articles')
    if (data.published) {
      revalidatePath('/magazine')
      revalidatePath(`/magazine/${finalSlug}`)
    }
    
    return { article }
  })
)

export const getPublishedArticles = createSafeAction(
  z.object({
    category_id: z.string().uuid().optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
    page: z.number().positive().default(1),
    limit: z.number().positive().max(20).default(10)
  }),
  async (filters) => {
    const supabase = await createSupabaseServerClient()
    
    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image,
        published_at,
        categories (name),
        profiles!articles_author_id_fkey (full_name),
        article_tags (
          tags (name)
        )
      `)
      .eq('published', true)
      .order('published_at', { ascending: false })
    
    // Appliquer filtres
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
    }
    
    const { data: articles, error, count } = await query
      .range(
        (filters.page - 1) * filters.limit,
        filters.page * filters.limit - 1
      )
    
    if (error) throw error
    
    return {
      data: articles,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / filters.limit)
      }
    }
  }
)
```

## 👤 APIs Utilisateurs & Profils

### Gestion Profils

```typescript
const UpdateProfileSchema = z.object({
  full_name: z.string().min(1).max(100),
  phone: z.string().regex(/^[+]?[0-9\s\-\(\)]{10,}$/).optional(),
  bio: z.string().max(500).optional(),
  newsletter_subscribed: z.boolean().optional()
})

export const updateProfile = createSafeAction(
  UpdateProfileSchema,
  withAuth(async (data) => {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) throw error
    
    revalidatePath('/profile')
    
    return { profile }
  })
)

export const getUserOrders = createSafeAction(
  z.object({
    status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']).optional(),
    page: z.number().positive().default(1),
    limit: z.number().positive().max(20).default(10)
  }),
  withAuth(async (filters) => {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        order_items (
          quantity,
          price,
          products (
            name,
            product_images (url, alt_text)
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    const { data: orders, error, count } = await query
      .range(
        (filters.page - 1) * filters.limit,
        filters.page * filters.limit - 1
      )
    
    if (error) throw error
    
    return {
      data: orders,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / filters.limit)
      }
    }
  })
)
```

## 🔍 APIs Recherche & Filtres

### Recherche Globale

```typescript
const GlobalSearchSchema = z.object({
  query: z.string().min(1).max(100),
  types: z.array(z.enum(['products', 'articles', 'markets'])).optional(),
  limit: z.number().positive().max(20).default(10)
})

export const globalSearch = createSafeAction(
  GlobalSearchSchema,
  async ({ query, types = ['products', 'articles', 'markets'], limit }) => {
    const supabase = await createSupabaseServerClient()
    const results = await Promise.allSettled([
      
      // Recherche produits
      types.includes('products') && supabase
        .from('products')
        .select('id, name, price, product_images(url)')
        .ilike('name', `%${query}%`)
        .eq('active', true)
        .limit(Math.ceil(limit / types.length)),
        
      // Recherche articles
      types.includes('articles') && supabase
        .from('articles')
        .select('id, title, slug, excerpt, featured_image')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .eq('published', true)
        .limit(Math.ceil(limit / types.length)),
        
      // Recherche marchés
      types.includes('markets') && supabase
        .from('markets')
        .select('id, name, location, description')
        .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
        .eq('active', true)
        .limit(Math.ceil(limit / types.length))
    ])
    
    const searchResults = {
      products: [],
      articles: [],
      markets: [],
      totalResults: 0
    }
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const { data } = result.value
        const type = types[index]
        if (type && data) {
          searchResults[type] = data
          searchResults.totalResults += data.length
        }
      }
    })
    
    return searchResults
  }
)
```

## ⚡ Performance & Optimisation

### Cache et Revalidation

```typescript
// Stratégies de cache par type de données
export const cacheStrategies = {
  // Données statiques - cache long
  categories: { revalidate: 3600 }, // 1h
  staticPages: { revalidate: 86400 }, // 24h
  
  // Données semi-dynamiques - cache moyen
  products: { revalidate: 900 }, // 15min
  articles: { revalidate: 1800 }, // 30min
  markets: { revalidate: 1800 }, // 30min
  
  // Données dynamiques - cache court
  orders: { revalidate: 60 }, // 1min
  cart: { revalidate: 0 }, // Pas de cache
  userProfile: { revalidate: 300 } // 5min
}

// Helper pour revalidation intelligente
export const revalidateRelatedPaths = (entity: string, id?: string) => {
  const paths = {
    products: ['/products', '/admin/products', '/'],
    articles: ['/magazine', '/admin/articles', '/'],
    markets: ['/markets', '/admin/markets'],
    orders: ['/orders', '/admin/orders'],
    categories: ['/products', '/magazine', '/admin/categories']
  }
  
  const entityPaths = paths[entity] || []
  
  entityPaths.forEach(path => {
    revalidatePath(path)
    if (id) revalidatePath(`${path}/${id}`)
  })
}
```

### Batch Operations

```typescript
const BulkOperationSchema = z.object({
  action: z.enum(['update', 'delete', 'activate', 'deactivate']),
  ids: z.array(z.string().uuid()).min(1).max(100),
  data: z.record(z.any()).optional()
})

export const bulkProductOperation = createSafeAction(
  BulkOperationSchema,
  withAdminAuth(async ({ action, ids, data }) => {
    const supabase = await createSupabaseServerClient()
    
    let query
    
    switch (action) {
      case 'update':
        query = supabase
          .from('products')
          .update({ ...data, updated_at: new Date().toISOString() })
          .in('id', ids)
        break
        
      case 'delete':
        query = supabase
          .from('products')
          .delete()
          .in('id', ids)
        break
        
      case 'activate':
        query = supabase
          .from('products')
          .update({ active: true, updated_at: new Date().toISOString() })
          .in('id', ids)
        break
        
      case 'deactivate':
        query = supabase
          .from('products')
          .update({ active: false, updated_at: new Date().toISOString() })
          .in('id', ids)
        break
    }
    
    const { data: results, error } = await query.select()
    
    if (error) throw error
    
    revalidateRelatedPaths('products')
    
    return { 
      affectedRows: results?.length || 0,
      action,
      ids 
    }
  })
)
```

## 📊 Monitoring & Analytics

### Audit Trail

```typescript
const AuditLogSchema = z.object({
  action: z.string(),
  resource_type: z.string(),
  resource_id: z.string().optional(),
  changes: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
})

export const logAuditEvent = async (
  userId: string,
  data: z.infer<typeof AuditLogSchema>
) => {
  const supabase = await createSupabaseServerClient()
  
  await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      ...data,
      created_at: new Date().toISOString()
    })
}

// Usage dans les actions
export const deleteProduct = createSafeAction(
  z.object({ id: z.string().uuid() }),
  withAdminAuth(async ({ id }) => {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Récupérer les données avant suppression
    const { data: product } = await supabase
      .from('products')
      .select()
      .eq('id', id)
      .single()
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    // Log de l'audit
    await logAuditEvent(user.id, {
      action: 'DELETE',
      resource_type: 'product',
      resource_id: id,
      changes: product,
      metadata: { 
        timestamp: new Date().toISOString(),
        ip: headers().get('x-forwarded-for') 
      }
    })
    
    revalidatePath('/admin/products')
    
    return { success: true }
  })
)
```

## 🔧 Utilitaires & Helpers

### Validation Personnalisée

```typescript
// Validators personnalisés pour HerbisVeritas
export const customValidators = {
  slug: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Format slug invalide'),
    
  price: z.number()
    .positive('Le prix doit être positif')
    .multipleOf(0.01, 'Maximum 2 décimales'),
    
  phone: z.string()
    .regex(/^(?:(?:\+|00)33[\s\-\.]?(?:\(0\)[\s\-\.]?)?|0)[1-9](?:[\s\-\.]?\d{2}){4}$/, 
      'Numéro de téléphone français invalide'),
      
  postalCode: z.string()
    .regex(/^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/, 'Code postal français invalide')
}

// Factory pour schémas de pagination
export const createPaginationSchema = (maxLimit = 100) =>
  z.object({
    page: z.number().positive().default(1),
    limit: z.number().positive().max(maxLimit).default(20),
    search: z.string().optional()
  })
```

### Gestion d'Erreurs

```typescript
// Types d'erreurs standardisés
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Access denied') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

// Handler global d'erreurs
export const handleActionError = (error: unknown): ActionResult<never> => {
  console.error('Action error:', error)
  
  if (error instanceof ValidationError) {
    return {
      error: {
        message: error.message,
        code: 'VALIDATION_ERROR',
        field: error.field
      }
    }
  }
  
  if (error instanceof AuthenticationError) {
    return {
      error: {
        message: error.message,
        code: 'AUTHENTICATION_ERROR'
      }
    }
  }
  
  if (error instanceof AuthorizationError) {
    return {
      error: {
        message: error.message,
        code: 'AUTHORIZATION_ERROR'
      }
    }
  }
  
  return {
    error: {
      message: 'Une erreur inattendue est survenue',
      code: 'INTERNAL_ERROR'
    }
  }
}
```

## 📋 Standards de Qualité

### Tests d'Intégration

```typescript
// Template de test pour Server Actions
import { testClient } from '@/lib/test-client'
import { createProduct } from '@/actions/products'

describe('Product Actions', () => {
  it('should create product with valid data', async () => {
    const mockUser = await testClient.auth.signInAsAdmin()
    
    const productData = {
      name: 'Test Product',
      price: 19.99,
      description: 'Test description',
      category_id: 'valid-uuid'
    }
    
    const result = await createProduct(productData)
    
    expect(result.data).toBeDefined()
    expect(result.data?.product.name).toBe(productData.name)
    expect(result.error).toBeUndefined()
  })
  
  it('should reject invalid price', async () => {
    const result = await createProduct({
      name: 'Test',
      price: -10, // Prix négatif
      category_id: 'valid-uuid'
    })
    
    expect(result.error).toBeDefined()
    expect(result.error?.code).toBe('VALIDATION_ERROR')
    expect(result.error?.field).toBe('price')
  })
})
```

### Documentation API

```typescript
/**
 * Crée un nouveau produit dans le catalogue
 * 
 * @param data - Données du produit à créer
 * @returns Promise<ActionResult<{ product: Product }>>
 * 
 * @example
 * ```typescript
 * const result = await createProduct({
 *   name: 'Tomates Bio',
 *   price: 3.50,
 *   description: 'Tomates biologiques locales',
 *   category_id: '123e4567-e89b-12d3-a456-426614174000'
 * })
 * 
 * if (result.error) {
 *   console.error(result.error.message)
 * } else {
 *   console.log('Produit créé:', result.data.product)
 * }
 * ```
 * 
 * @throws {ValidationError} Si les données sont invalides
 * @throws {AuthorizationError} Si l'utilisateur n'est pas admin
 * 
 * @permissions admin:products:create
 * @rateLimit 100 requests per hour
 */
export const createProduct = createSafeAction(ProductSchema, handler)
```

Cette spécification API complète fournit une base solide pour développer toutes les fonctionnalités de HerbisVeritas V2 avec une approche type-safe, sécurisée et performante.