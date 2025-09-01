import { createClient } from '@/lib/supabase/client'
// import { Product, ProductLabel } from '@/types/product'

export interface AddToCartResult {
  success: boolean
  error?: string
  cartItem?: any
}

export async function addToCart(productId: string, quantity: number): Promise<AddToCartResult> {
  try {
    const supabase = createClient()

    // Vérifier le stock disponible
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, stock, is_active')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (productError) {
      return {
        success: false,
        error: 'Produit non trouvé'
      }
    }

    if (product.stock < quantity) {
      return {
        success: false,
        error: 'Stock insuffisant'
      }
    }

    // Récupérer ou créer un panier pour la session/utilisateur
    // Pour l'instant, utilisation d'un guest_id simple
    const guestId = 'session-123' // TODO: Implémenter la gestion des sessions

    let { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('guest_id', guestId)
      .eq('status', 'active')
      .single()

    if (cartError || !cart) {
      // Créer un nouveau panier
      const { data: newCart, error: newCartError } = await supabase
        .from('carts')
        .insert([{
          guest_id: guestId,
          status: 'active'
        }])
        .select('id')
        .single()

      if (newCartError) {
        return {
          success: false,
          error: 'Erreur lors de la création du panier'
        }
      }

      cart = newCart
    }

    // Vérifier si le produit est déjà dans le panier
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .single()

    let cartItem
    if (existingItem) {
      // Mettre à jour la quantité
      const newQuantity = existingItem.quantity + quantity

      if (product.stock < newQuantity) {
        return {
          success: false,
          error: 'Stock insuffisant'
        }
      }

      const { data: updatedItem, error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select()
        .single()

      if (updateError) {
        return {
          success: false,
          error: 'Erreur lors de la mise à jour du panier'
        }
      }

      cartItem = updatedItem
    } else {
      // Ajouter un nouvel item
      const { data: newItem, error: insertError } = await supabase
        .from('cart_items')
        .insert([{
          cart_id: cart.id,
          product_id: productId,
          quantity
        }])
        .select()
        .single()

      if (insertError) {
        return {
          success: false,
          error: 'Erreur lors de l\'ajout au panier'
        }
      }

      cartItem = newItem
    }

    return {
      success: true,
      cartItem
    }

  } catch (error) {
    console.error('Add to cart error:', error)
    return {
      success: false,
      error: 'Erreur interne'
    }
  }
}

export async function getCartTotal(sessionId: string, items?: any[]): Promise<number> {
  try {
    const supabase = createClient()

    // Si des items sont fournis, calculer directement
    if (items && items.length > 0) {
      let total = 0
      
      for (const item of items) {
        let itemPrice = item.price
        
        // Appliquer des règles de pricing pour les labels spéciaux
        if (item.labels && item.labels.includes('bio')) {
          // Les produits bio pourraient avoir des frais ou bonus
          itemPrice = itemPrice * 1.0 // Pas de markup pour l'instant
        }
        
        if (item.labels && item.labels.includes('essence_precieuse')) {
          // Les essences précieuses pourraient avoir des frais spéciaux
          itemPrice = itemPrice * 1.0
        }
        
        total += itemPrice * (item.quantity || 1)
      }
      
      return total
    }

    // Sinon, récupérer le panier depuis la base de données
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select(`
        id,
        cart_items(
          quantity,
          product:products(
            id,
            name,
            price,
            labels
          )
        )
      `)
      .eq('guest_id', sessionId)
      .eq('status', 'active')
      .single()

    if (cartError || !cart) {
      return 0
    }

    let total = 0
    
    for (const item of cart.cart_items) {
      if (item.product) {
        let itemPrice = (item.product as any).price
        
        // Appliquer des règles de pricing
        if ((item.product as any).labels && (item.product as any).labels.includes('bio')) {
          itemPrice = itemPrice * 1.0
        }
        
        total += itemPrice * item.quantity
      }
    }
    
    return total

  } catch (error) {
    console.error('Get cart total error:', error)
    return 0
  }
}