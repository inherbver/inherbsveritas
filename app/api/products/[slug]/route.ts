import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    
    // Service role key côté serveur seulement (sécurisé)
    const supabase = createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['SUPABASE_SERVICE_ROLE_KEY']!
    )
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    
    if (error || !product) {
      console.error('API Product error:', error)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json({ product })
    
  } catch (err) {
    console.error('API Product exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}