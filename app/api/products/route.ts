import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Service role key côté serveur seulement (sécurisé)
    const supabase = createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['SUPABASE_SERVICE_ROLE_KEY']!
    )
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('API Products error:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
    
    return NextResponse.json({ products: products || [] })
    
  } catch (err) {
    console.error('API Products exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}