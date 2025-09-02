'use client'

/**
 * useCartMutation - Hook TanStack Query pour mutations panier optimistes
 * 
 * Intégration avec ContentCard actions pour UX réactive
 * Support guest + authenticated users
 */

import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { Product } from '@/types/product'

// Types mutations panier
export interface CartItem {
  id: string
  product_id: string
  session_id?: string
  user_id?: string
  quantity: number
  unit_price: number
  product?: Product // Joined product data
  created_at: string
  updated_at: string
}

export interface CartMutationVariables {
  addToCart: {
    product: Product
    quantity?: number
    sessionId?: string
  }
  updateQuantity: {
    itemId: string
    quantity: number
    sessionId?: string
  }
  removeFromCart: {
    itemId: string
    sessionId?: string
  }
  clearCart: {
    sessionId?: string
  }
}

// Simulation API calls (à remplacer par vrais appels Supabase)
const cartApi = {
  addToCart: async (variables: CartMutationVariables['addToCart']): Promise<CartItem> => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network
    
    return {
      id: `cart-${Date.now()}`,
      product_id: variables.product.id,
      session_id: variables.sessionId || 'guest',
      quantity: variables.quantity || 1,
      unit_price: variables.product.price,
      product: variables.product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  
  updateQuantity: async (variables: CartMutationVariables['updateQuantity']): Promise<CartItem> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      id: variables.itemId,
      product_id: 'product-id',
      session_id: variables.sessionId || 'guest',
      quantity: variables.quantity,
      unit_price: 29.99,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  
  removeFromCart: async (_variables: CartMutationVariables['removeFromCart']): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200))
  },
  
  clearCart: async (_variables: CartMutationVariables['clearCart']): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400))
  }
}

// Hook principal pour mutations panier
export function useCartMutation(sessionId?: string) {
  const queryClient = useQueryClient()
  
  // Helper pour invalider les queries panier
  const invalidateCartQueries = React.useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.cart.all() 
    })
  }, [queryClient])

  // Mutation Ajouter au panier avec optimistic update
  const addToCartMutation = useMutation({
    mutationKey: ['addToCart'],
    mutationFn: cartApi.addToCart,
    
    // Optimistic update pour UX instantanée
    onMutate: async (variables) => {
      const cartQueryKey = queryKeys.cart.detail(variables.sessionId || sessionId)
      
      // Annule les queries en cours pour éviter conflits
      await queryClient.cancelQueries({ queryKey: cartQueryKey })
      
      // Snapshot de l'état actuel pour rollback
      const previousCart = queryClient.getQueryData(cartQueryKey)
      
      // Update optimiste : ajouter l'item immédiatement
      const optimisticItem: CartItem = {
        id: `temp-${Date.now()}`,
        product_id: variables.product.id,
        session_id: variables.sessionId || sessionId || 'guest',
        quantity: variables.quantity || 1,
        unit_price: variables.product.price,
        product: variables.product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      queryClient.setQueryData(cartQueryKey, (old: CartItem[] | undefined) => [
        ...(old || []),
        optimisticItem
      ])
      
      // Incrémenter le compteur optimiste
      const countQueryKey = queryKeys.cart.count(variables.sessionId || sessionId)
      queryClient.setQueryData(countQueryKey, (old: number | undefined) => (old || 0) + 1)
      
      return { previousCart, cartQueryKey, countQueryKey }
    },
    
    // Succès : remplacer l'item optimiste par le vrai
    onSuccess: (realItem, variables, context) => {
      if (context) {
        queryClient.setQueryData(context.cartQueryKey, (old: CartItem[] | undefined) => {
          if (!old) return [realItem]
          
          // Remplacer l'item temporaire par le vrai
          return old.map(item => 
            item.id.startsWith('temp-') && item.product_id === realItem.product_id
              ? realItem 
              : item
          )
        })
      }
      
      // Toast success
      console.log(`✅ Produit "${variables.product.name}" ajouté au panier`)
    },
    
    // Erreur : rollback optimistic update
    onError: (err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(context.cartQueryKey, context.previousCart)
        queryClient.setQueryData(context.countQueryKey, (old: number | undefined) => Math.max((old || 1) - 1, 0))
      }
      
      console.error('❌ Erreur ajout panier:', err)
    },
    
    // Toujours invalider pour sync serveur
    onSettled: () => {
      invalidateCartQueries()
    }
  })

  // Mutation Modifier quantité
  const updateQuantityMutation = useMutation({
    mutationKey: ['updateCartQuantity'],
    mutationFn: cartApi.updateQuantity,
    
    onMutate: async (variables) => {
      const cartQueryKey = queryKeys.cart.detail(variables.sessionId || sessionId)
      await queryClient.cancelQueries({ queryKey: cartQueryKey })
      
      const previousCart = queryClient.getQueryData(cartQueryKey)
      
      // Update optimiste quantité
      queryClient.setQueryData(cartQueryKey, (old: CartItem[] | undefined) => {
        if (!old) return old
        
        return old.map(item =>
          item.id === variables.itemId
            ? { ...item, quantity: variables.quantity, updated_at: new Date().toISOString() }
            : item
        )
      })
      
      return { previousCart, cartQueryKey }
    },
    
    onError: (err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(context.cartQueryKey, context.previousCart)
      }
      console.error('❌ Erreur modification quantité:', err)
    },
    
    onSettled: () => {
      invalidateCartQueries()
    }
  })

  // Mutation Supprimer du panier
  const removeFromCartMutation = useMutation({
    mutationKey: ['removeFromCart'],
    mutationFn: cartApi.removeFromCart,
    
    onMutate: async (variables) => {
      const cartQueryKey = queryKeys.cart.detail(variables.sessionId || sessionId)
      await queryClient.cancelQueries({ queryKey: cartQueryKey })
      
      const previousCart = queryClient.getQueryData(cartQueryKey)
      
      // Remove optimiste
      queryClient.setQueryData(cartQueryKey, (old: CartItem[] | undefined) => {
        if (!old) return old
        return old.filter(item => item.id !== variables.itemId)
      })
      
      // Décrémenter compteur
      const countQueryKey = queryKeys.cart.count(variables.sessionId || sessionId)
      queryClient.setQueryData(countQueryKey, (old: number | undefined) => Math.max((old || 1) - 1, 0))
      
      return { previousCart, cartQueryKey, countQueryKey }
    },
    
    onSuccess: (_data, _variables) => {
      console.log(`✅ Article supprimé du panier`)
    },
    
    onError: (err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(context.cartQueryKey, context.previousCart)
        queryClient.setQueryData(context.countQueryKey, (old: number | undefined) => (old || 0) + 1)
      }
      console.error('❌ Erreur suppression panier:', err)
    },
    
    onSettled: () => {
      invalidateCartQueries()
    }
  })

  // Mutation Vider panier
  const clearCartMutation = useMutation({
    mutationKey: ['clearCart'],
    mutationFn: cartApi.clearCart,
    
    onMutate: async (variables) => {
      const cartQueryKey = queryKeys.cart.detail(variables.sessionId || sessionId)
      const countQueryKey = queryKeys.cart.count(variables.sessionId || sessionId)
      
      await queryClient.cancelQueries({ queryKey: cartQueryKey })
      
      const previousCart = queryClient.getQueryData(cartQueryKey)
      const previousCount = queryClient.getQueryData(countQueryKey)
      
      // Clear optimiste
      queryClient.setQueryData(cartQueryKey, [])
      queryClient.setQueryData(countQueryKey, 0)
      
      return { previousCart, previousCount, cartQueryKey, countQueryKey }
    },
    
    onSuccess: () => {
      console.log('✅ Panier vidé')
    },
    
    onError: (err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(context.cartQueryKey, context.previousCart)
        queryClient.setQueryData(context.countQueryKey, context.previousCount)
      }
      console.error('❌ Erreur vidage panier:', err)
    },
    
    onSettled: () => {
      invalidateCartQueries()
    }
  })

  return {
    // Mutations
    addToCart: addToCartMutation,
    updateQuantity: updateQuantityMutation,
    removeFromCart: removeFromCartMutation,
    clearCart: clearCartMutation,
    
    // États globaux
    isLoading: addToCartMutation.isPending || updateQuantityMutation.isPending || 
               removeFromCartMutation.isPending || clearCartMutation.isPending,
    
    // Helpers pour ContentCard integration
    addToCartAction: React.useCallback((product: Product) => {
      return addToCartMutation.mutateAsync({ 
        product, 
        quantity: 1, 
        ...(sessionId && { sessionId })
      })
    }, [addToCartMutation, sessionId]),
    
    removeFromCartAction: React.useCallback((itemId: string) => {
      return removeFromCartMutation.mutateAsync({ 
        itemId, 
        ...(sessionId && { sessionId })
      })
    }, [removeFromCartMutation, sessionId])
  }
}

// Hook simplifié pour ContentCard ProductCard integration
export function useProductActions(sessionId?: string) {
  const { addToCartAction, isLoading } = useCartMutation(sessionId)
  
  return React.useMemo(() => ({
    onAddToCart: addToCartAction,
    isAddingToCart: isLoading
  }), [addToCartAction, isLoading])
}

