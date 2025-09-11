/**
 * ROOT: API CONTRACT — GET /api/products/[slug]
 * Path: slug unique; retourne ProductDTO détaillé (status='active' en public)
 * Cache: public + S-W-R; revalidateTag('products') sur mutation
 * Erreurs: 404 si produit inexistant/non publié; 500 sinon
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  _request: NextRequest, 
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Validation du slug
    if (!slug || slug.trim() === '') {
      return NextResponse.json(
        { error: 'Product slug is required' }, 
        { status: 400 }
      )
    }

    // Service role key côté serveur seulement (sécurisé)
    const supabase = createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['SUPABASE_SERVICE_ROLE_KEY']!
    )
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug.trim())
      .eq('is_active', true)
      .eq('status', 'active')
      .single()
    
    if (error) {
      console.error('API Product error:', error)
      
      // Distinguish between not found and other errors
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
    }
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    const response = NextResponse.json({ product })

    // Cache headers (contenu produit stable)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    response.headers.set('Cache-Tag', 'products')
    
    return response
    
  } catch (err) {
    console.error('API Product exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}