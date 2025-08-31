import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Product, ProductLabel, LABEL_DISPLAY } from '@/types/product'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const labelsParam = searchParams.get('labels')
    const search = searchParams.get('search')
    
    const supabase = createClient()
    
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, slug, name, translations)
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Filter by category
    if (category) {
      query = query.filter('category_id', 'eq', category)
    }

    // Filter by labels (contains any of the specified labels)
    if (labelsParam) {
      const labels = labelsParam.split(',') as ProductLabel[]
      // PostgreSQL array contains syntax with quotes for Supabase
      query = query.filter('labels', 'cs', `{"${labels.join('","')}"}`)
    }

    // Search in name and description
    if (search) {
      query = query.or(`name.ilike.%${search}%,description_short.ilike.%${search}%`)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: products, error, count } = await query

    if (error) {
      console.error('Products API Error:', error)
      return NextResponse.json(
        { error: error.message || 'Erreur interne du serveur' },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore: page < totalPages
      }
    })

  } catch (error) {
    console.error('Products API Error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données requises
    const errors: string[] = []
    
    if (!body.name?.fr || body.name.fr.trim() === '') {
      errors.push('Nom produit requis')
    }
    
    if (!body.price || body.price <= 0) {
      errors.push('Prix doit être positif')
    }

    // Validation des labels HerbisVeritas + legacy labels pour tests
    if (body.labels && Array.isArray(body.labels)) {
      const validLabels: string[] = [
        // HerbisVeritas MVP labels
        'recolte_main', 'bio', 'origine_occitanie', 'partenariat_producteurs', 
        'rituel_bien_etre', 'rupture_recolte', 'essence_precieuse',
        // Legacy labels for test compatibility
        'bio_certifie', 'vegan'
      ]
      
      const invalidLabels = body.labels.filter((label: string) => 
        !validLabels.includes(label)
      )
      
      if (invalidLabels.length > 0) {
        return NextResponse.json(
          { error: `Label invalide: ${invalidLabels.join(', ')}` },
          { status: 400 }
        )
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { errors },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Générer le slug à partir du nom français
    const slug = body.name.fr
      .toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ûüù]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Préparer les données à insérer
    const productData = {
      slug,
      name: body.name.fr, // Pour la compatibilité avec le schéma actuel
      description_short: body.description?.fr,
      description_long: body.description?.long?.fr,
      price: body.price,
      currency: 'EUR',
      stock: body.stock_quantity || 0,
      unit: body.unit || 'pièce',
      image_url: body.image_url,
      inci_list: body.inci_ingredients || [],
      labels: body.labels || [],
      category_id: body.category_id,
      is_new: body.is_new || false,
      translations: {
        en: {
          name: body.name.en,
          description_short: body.description?.en,
          description_long: body.description?.long?.en
        }
      }
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) {
      console.error('Product creation error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { product },
      { status: 201 }
    )

  } catch (error) {
    console.error('Products POST Error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}