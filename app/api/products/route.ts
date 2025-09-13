/**
 * ROOT: API CONTRACT — GET /api/products
 * Query: ?category=uuid&labels=bio,recolte_main&search=term&page=1&limit=24
 * Response: { products: ProductDTO[] } (pagination dans headers si besoin)
 * Cache: public + stale-while-revalidate; revalidateTag('products') sur mutation
 * Erreurs: 400 (query invalide) | 500 (inattendu)
 * Interdits: création de nouvelles libs; contournement RLS; exposition service_role
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateProductFilters, validateProductPagination } from '@/features/products/schemas'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Validation des paramètres de requête
    const rawFilters = {
      category_id: searchParams.get('category') || undefined,
      labels: searchParams.get('labels')?.split(',').filter(Boolean) || undefined,
      search: searchParams.get('search') || undefined,
      priceMin: searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined,
      priceMax: searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined,
      inStock: searchParams.get('inStock') ? searchParams.get('inStock') === 'true' : undefined
    }

    const rawPagination = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 24
    }

    let filters, pagination
    try {
      filters = validateProductFilters(rawFilters)
      pagination = validateProductPagination(rawPagination)
    } catch (validationError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: validationError instanceof Error ? validationError.message : 'Invalid parameters'
        },
        { status: 400 }
      )
    }

    // Service role key côté serveur seulement (sécurisé)
    const supabase = createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['SUPABASE_SERVICE_ROLE_KEY']!
    )
    
    // Construction de la requête avec filtres
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .eq('status', 'active')

    // Appliquer les filtres
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }

    if (filters.labels && filters.labels.length > 0) {
      query = query.overlaps('labels', filters.labels)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description_short.ilike.%${filters.search}%`)
    }

    if (filters.priceMin !== undefined) {
      query = query.gte('price', filters.priceMin)
    }

    if (filters.priceMax !== undefined) {
      query = query.lte('price', filters.priceMax)
    }

    if (filters.inStock) {
      query = query.gt('stock', 0)
    }

    // Pagination et tri
    const offset = (pagination.page - 1) * pagination.limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pagination.limit - 1)
    
    const { data: products, error, count } = await query
    
    if (error) {
      console.error('API Products error:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Calculer les métadonnées de pagination
    const total = count || 0
    const totalPages = Math.ceil(total / pagination.limit)
    const hasMore = pagination.page < totalPages

    const response = NextResponse.json({
      products: products || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasMore
      }
    })

    // Cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    response.headers.set('Cache-Tag', 'products')

    return response
    
  } catch (err) {
    console.error('API Products exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}