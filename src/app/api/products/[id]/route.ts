import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ProductLabel } from '@/types/product'

interface RouteContext {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params
    const supabase = createClient()

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, slug, name, translations)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Produit non trouvé' },
          { status: 404 }
        )
      }
      console.error('Product GET Error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Transform data for frontend compatibility
    const transformedProduct = {
      ...product,
      // Add compatibility fields from tests
      inci_ingredients: product.inci_list,
      stock_quantity: product.stock,
      name: product.translations?.en?.name ? {
        fr: product.name,
        en: product.translations.en.name
      } : { fr: product.name },
      description: product.translations?.en?.description_short ? {
        fr: product.description_short,
        en: product.translations.en.description_short
      } : { fr: product.description_short }
    }

    return NextResponse.json({
      product: transformedProduct
    })

  } catch (error) {
    console.error('Product GET Error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params
    const body = await request.json()
    
    const supabase = createClient()

    // Vérifier que le produit existe
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Produit non trouvé' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    // Validation des labels si fournis
    if (body.labels && Array.isArray(body.labels)) {
      const validLabels: ProductLabel[] = [
        'recolte_main', 'bio', 'origine_occitanie', 'partenariat_producteurs', 
        'rituel_bien_etre', 'rupture_recolte', 'essence_precieuse'
      ]
      
      const invalidLabels = body.labels.filter((label: string) => 
        !validLabels.includes(label as ProductLabel)
      )
      
      if (invalidLabels.length > 0) {
        return NextResponse.json(
          { error: `Label invalide: ${invalidLabels.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = {}

    if (body.name?.fr) {
      updateData.name = body.name.fr
    }
    if (body.description?.fr) {
      updateData.description_short = body.description.fr
    }
    if (body.price !== undefined) {
      updateData.price = body.price
    }
    if (body.stock_quantity !== undefined) {
      updateData.stock = body.stock_quantity
    }
    if (body.labels) {
      updateData.labels = body.labels
    }
    if (body.inci_ingredients) {
      updateData.inci_list = body.inci_ingredients
    }

    // Gérer les traductions
    if (body.name?.en || body.description?.en) {
      const currentTranslations = existingProduct.translations || {}
      updateData.translations = {
        ...currentTranslations,
        en: {
          ...currentTranslations.en,
          ...(body.name?.en && { name: body.name.en }),
          ...(body.description?.en && { description_short: body.description.en })
        }
      }
    }

    // Mettre à jour updated_at
    updateData.updated_at = new Date().toISOString()

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, slug, name, translations)
      `)
      .single()

    if (error) {
      console.error('Product update error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Transform data for frontend compatibility
    const transformedProduct = {
      ...product,
      inci_ingredients: product.inci_list,
      stock_quantity: product.stock,
      name: product.translations?.en?.name ? {
        fr: product.name,
        en: product.translations.en.name
      } : { fr: product.name },
      description: product.translations?.en?.description_short ? {
        fr: product.description_short,
        en: product.translations.en.description_short
      } : { fr: product.description_short }
    }

    return NextResponse.json({
      product: transformedProduct
    })

  } catch (error) {
    console.error('Product PUT Error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params
    const supabase = createClient()

    // Soft delete: marquer comme inactif
    const { data: product, error } = await supabase
      .from('products')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, name')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Produit non trouvé' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Produit supprimé avec succès',
      product: { id: product.id, name: product.name }
    })

  } catch (error) {
    console.error('Product DELETE Error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}