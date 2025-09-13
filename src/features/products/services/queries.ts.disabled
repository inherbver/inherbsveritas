/**
 * Product Database Queries
 * Server-side product operations using Supabase
 */
import { createClient } from '@/lib/supabase/server'
import { Product, ProductInsert, ProductUpdate, ProductTranslations } from '@/types/database'

export interface ProductFilters {
  category_id?: string
  status?: 'active' | 'inactive' | 'draft'
  is_featured?: boolean
  is_new?: boolean
  search?: string
  labels?: string[]
  price_min?: number
  price_max?: number
}

export interface ProductQueryOptions {
  page?: number
  limit?: number
  orderBy?: 'name' | 'price' | 'created_at' | 'stock'
  orderDirection?: 'asc' | 'desc'
  locale?: string
}

// Get all products with filters and pagination
export async function getProducts(
  filters: ProductFilters = {},
  options: ProductQueryOptions = {}
) {
  const supabase = await createClient()
  const {
    page = 1,
    limit = 20,
    orderBy = 'created_at',
    orderDirection = 'desc',
    locale = 'fr'
  } = options

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `)

  // Apply filters
  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id)
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.eq('status', 'active') // Default to active only
  }

  if (filters.is_featured !== undefined) {
    query = query.eq('is_featured', filters.is_featured)
  }

  if (filters.is_new !== undefined) {
    query = query.eq('is_new', filters.is_new)
  }

  if (filters.labels && filters.labels.length > 0) {
    query = query.overlaps('labels', filters.labels)
  }

  if (filters.price_min !== undefined) {
    query = query.gte('price', filters.price_min)
  }

  if (filters.price_max !== undefined) {
    query = query.lte('price', filters.price_max)
  }

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    )
  }

  // Apply ordering
  query = query.order(orderBy, { ascending: orderDirection === 'asc' })

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  return {
    products: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    }
  }
}

// Get a single product by slug
export async function getProductBySlug(slug: string, locale = 'fr') {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug, translations)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Product not found
    }
    throw new Error(`Failed to fetch product: ${error.message}`)
  }

  return data
}

// Get a single product by ID (admin use)
export async function getProductById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug, translations)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch product: ${error.message}`)
  }

  return data
}

// Get featured products
export async function getFeaturedProducts(limit = 8, locale = 'fr') {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch featured products: ${error.message}`)
  }

  return data || []
}

// Get new products
export async function getNewProducts(limit = 8, locale = 'fr') {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq('status', 'active')
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch new products: ${error.message}`)
  }

  return data || []
}

// Get products by category
export async function getProductsByCategory(
  categorySlug: string,
  options: ProductQueryOptions = {}
) {
  const supabase = await createClient()

  // First get the category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (categoryError) {
    throw new Error(`Category not found: ${categoryError.message}`)
  }

  return getProducts(
    { category_id: category.id },
    options
  )
}

// Get product labels (for filters)
export async function getProductLabels() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('labels')
    .eq('status', 'active')
    .not('labels', 'is', null)

  if (error) {
    throw new Error(`Failed to fetch product labels: ${error.message}`)
  }

  // Extract unique labels
  const allLabels = data?.flatMap(item => item.labels || []) || []
  const uniqueLabels = Array.from(new Set(allLabels)).sort()

  return uniqueLabels
}

// Search products
export async function searchProducts(
  query: string,
  options: ProductQueryOptions = {}
) {
  return getProducts(
    { search: query },
    options
  )
}

// Get product price range
export async function getProductPriceRange() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('price')
    .eq('status', 'active')
    .order('price', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch price range: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return { min: 0, max: 0 }
  }

  return {
    min: data[0].price,
    max: data[data.length - 1].price
  }
}