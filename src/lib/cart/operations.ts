import { createClient } from '@/lib/supabase/server'

export interface AddToCartResult {
  success: boolean
  data?: any
  error?: string
}

export async function addToCart(
  productId: string, 
  quantity: number, 
  sessionId?: string | null, 
  userId?: string | null
): Promise<AddToCartResult> {
  try {
    const supabase = createClient()
    
    const cartData = {
      product_id: productId,
      quantity,
      ...(userId ? { user_id: userId } : { session_id: sessionId })
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert(cartData)
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data?.[0] }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }
  }
}

export async function removeFromCart(cartItemId: string): Promise<AddToCartResult> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data?.[0] }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }
  }
}

export async function updateCartQuantity(
  cartItemId: string, 
  quantity: number
): Promise<AddToCartResult> {
  try {
    const supabase = createClient()
    
    if (quantity === 0) {
      return await removeFromCart(cartItemId)
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data?.[0] }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }
  }
}

export async function getCartTotal(sessionId?: string, userId?: string): Promise<number> {
  try {
    const supabase = createClient()
    
    let query = supabase
      .from('cart_items')
      .select(`
        quantity,
        products!inner(price)
      `)

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data, error } = await query

    if (error || !data) {
      return 0
    }

    return data.reduce((total, item) => {
      return total + (item.quantity * (item.products as any).price)
    }, 0)
  } catch (error) {
    return 0
  }
}