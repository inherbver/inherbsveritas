/**
 * Product Server Actions
 * Server actions for product CRUD operations
 */
'use server'

import { revalidatePath } from 'next/cache'
// import { createClient } from '@/lib/supabase/server' // TODO: Utiliser quand nécessaire
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductInsert, ProductUpdate } from '@/types/database'
import { generateSlug } from '@/lib/utils'

interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Create a new product (Admin only)
export async function createProduct(
  productData: Omit<ProductInsert, 'id' | 'created_at' | 'updated_at' | 'slug'>
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const supabase = await createAdminClient()
    
    // Generate slug from name
    const slug = generateSlug(productData.name)
    
    // Check if slug already exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingProduct) {
      return {
        success: false,
        error: 'Un produit avec ce nom existe déjà'
      }
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        slug,
        status: productData.status || 'draft',
        currency: productData.currency || 'EUR',
        unit: productData.unit || 'pièce',
        stock: productData.stock || 0,
        labels: productData.labels || [],
        is_featured: productData.is_featured || false,
        is_new: productData.is_new || false,
        translations: productData.translations || {}
      })
      .select('id, slug')
      .single()

    if (error) {
      return {
        success: false,
        error: `Erreur lors de la création du produit: ${error.message}`
      }
    }

    revalidatePath('/admin/products')
    revalidatePath('/products')

    return {
      success: true,
      data: { id: data.id, slug: data.slug }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erreur interne du serveur'
    }
  }
}

// Update a product (Admin only)
export async function updateProduct(
  id: string,
  updates: ProductUpdate
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const supabase = await createAdminClient()

    // If name is being updated, regenerate slug
    let finalUpdates = { ...updates }
    if (updates.name) {
      const newSlug = generateSlug(updates.name)
      
      // Check if new slug conflicts with existing products (excluding current)
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', id)
        .single()

      if (existingProduct) {
        return {
          success: false,
          error: 'Un produit avec ce nom existe déjà'
        }
      }

      finalUpdates.slug = newSlug
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        ...finalUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, slug')
      .single()

    if (error) {
      return {
        success: false,
        error: `Erreur lors de la mise à jour du produit: ${error.message}`
      }
    }

    revalidatePath('/admin/products')
    revalidatePath('/products')
    if (data.slug) {
      revalidatePath(`/products/${data.slug}`)
    }

    return {
      success: true,
      data: { id: data.id, slug: data.slug }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erreur interne du serveur'
    }
  }
}

// Delete a product (Admin only)
export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const supabase = await createAdminClient()

    // Check if product exists
    const { data: product } = await supabase
      .from('products')
      .select('slug')
      .eq('id', id)
      .single()

    if (!product) {
      return {
        success: false,
        error: 'Produit non trouvé'
      }
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: `Erreur lors de la suppression du produit: ${error.message}`
      }
    }

    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath(`/products/${product.slug}`)

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erreur interne du serveur'
    }
  }
}

// Update product stock
export async function updateProductStock(
  id: string,
  stock: number
): Promise<ActionResult> {
  try {
    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('products')
      .update({ 
        stock,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: `Erreur lors de la mise à jour du stock: ${error.message}`
      }
    }

    revalidatePath('/admin/products')
    revalidatePath('/products')

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erreur interne du serveur'
    }
  }
}

// Toggle product featured status
export async function toggleProductFeatured(
  id: string,
  is_featured: boolean
): Promise<ActionResult> {
  try {
    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('products')
      .update({ 
        is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: `Erreur lors de la mise à jour: ${error.message}`
      }
    }

    revalidatePath('/admin/products')
    revalidatePath('/products')

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erreur interne du serveur'
    }
  }
}

// Update product status
export async function updateProductStatus(
  id: string,
  status: 'active' | 'inactive' | 'draft'
): Promise<ActionResult> {
  try {
    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('products')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: `Erreur lors de la mise à jour du statut: ${error.message}`
      }
    }

    revalidatePath('/admin/products')
    revalidatePath('/products')

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erreur interne du serveur'
    }
  }
}